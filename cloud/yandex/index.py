import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
import traceback
import uuid
from datetime import datetime, timezone

import ydb
import ydb.iam

_driver = None
_pool = None
PIN_ITERATIONS = 180_000
ALLOWED_AVATARS = {"spark", "sprite", "spirit", "guardian", "master"}
SYNC_TYPES = {"profile.upsert", "progress.upsert", "rewards.upsert", "session.completed"}


def _cors_headers():
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGIN", "*"),
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    }


def _response(status, body):
    return {"statusCode": status, "headers": _cors_headers(), "body": json.dumps(body, ensure_ascii=False)}


def _body(event):
    value = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        value = base64.b64decode(value).decode("utf-8")
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else {}
    except (ValueError, TypeError):
        return {}


def _path(event):
    request_context = event.get("requestContext") or {}
    http = request_context.get("http") or {}
    return (http.get("path") or event.get("url") or event.get("path") or "/").rstrip("/") or "/"


def _method(event):
    request_context = event.get("requestContext") or {}
    return ((request_context.get("http") or {}).get("method") or event.get("httpMethod") or "GET").upper()


def _db():
    global _driver, _pool
    if _pool is not None:
        return _pool
    endpoint = os.environ["YDB_ENDPOINT"]
    database = os.environ["YDB_DATABASE"]
    _driver = ydb.Driver(endpoint=endpoint, database=database, credentials=ydb.iam.MetadataUrlCredentials())
    _driver.wait(timeout=10, fail_fast=True)
    _pool = ydb.SessionPool(_driver, size=5)
    return _pool


def _typed(key, value):
    if isinstance(value, datetime):
        utc_value = value.astimezone(timezone.utc) if value.tzinfo else value.replace(tzinfo=timezone.utc)
        elapsed = utc_value - datetime(1970, 1, 1, tzinfo=timezone.utc)
        return ((elapsed.days * 86400 + elapsed.seconds) * 1_000_000) + elapsed.microseconds
    return str(value)


def _query(text, **values):
    parameters = {f"${key}": _typed(key, value) for key, value in values.items()}

    def execute(session):
        prepared = session.prepare(text)
        return session.transaction().execute(prepared, parameters, commit_tx=True)

    return _db().retry_operation_sync(execute)


def _rows(result):
    if not result:
        return []
    return list(result[0].rows)


def _value(row, key):
    try:
        return row[key]
    except (KeyError, TypeError):
        return getattr(row, key)


def _utcnow():
    return datetime.now(timezone.utc)


def _timestamp_iso(value):
    if isinstance(value, datetime):
        return value.isoformat().replace("+00:00", "Z")
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1_000_000, timezone.utc).isoformat().replace("+00:00", "Z")
    return str(value)


def _hash_secret(value):
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", value.encode(), salt, PIN_ITERATIONS)
    return f"{PIN_ITERATIONS}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def _verify_secret(value, stored):
    try:
        iterations, salt, expected = stored.split("$", 2)
        actual = hashlib.pbkdf2_hmac("sha256", value.encode(), base64.urlsafe_b64decode(salt), int(iterations))
        return hmac.compare_digest(actual, base64.urlsafe_b64decode(expected))
    except (ValueError, TypeError):
        return False


def _b64(value):
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _unb64(value):
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _issue_token(role, subject_id, extra=None):
    expires = int(time.time()) + 60 * 60 * 24 * 14
    payload = {"role": role, "sub": subject_id, "exp": expires, **(extra or {})}
    encoded = _b64(json.dumps(payload, separators=(",", ":")).encode())
    signature = _b64(hmac.new(os.environ["AUTH_SECRET"].encode(), encoded.encode(), hashlib.sha256).digest())
    return {
        "token": f"{encoded}.{signature}",
        "role": role,
        "subjectId": subject_id,
        "expiresAt": datetime.fromtimestamp(expires, timezone.utc).isoformat().replace("+00:00", "Z"),
    }


def _authenticate(event, role=None):
    headers = {str(key).lower(): value for key, value in (event.get("headers") or {}).items()}
    authorization = headers.get("authorization", "")
    if not authorization.startswith("Bearer "):
        return None
    try:
        encoded, signature = authorization[7:].split(".", 1)
        expected = _b64(hmac.new(os.environ["AUTH_SECRET"].encode(), encoded.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        payload = json.loads(_unb64(encoded))
        if int(payload.get("exp", 0)) <= int(time.time()) or (role and payload.get("role") != role):
            return None
        return payload
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


def _student_profile(row):
    return {
        "id": "current",
        "studentId": _value(row, "student_id"),
        "wordcodeId": _value(row, "wordcode_id"),
        "displayName": _value(row, "display_name"),
        "groupId": _value(row, "group_id"),
        "groupDisplayName": _value(row, "group_display_name"),
        "joinCode": _value(row, "join_code"),
        "avatar": _value(row, "avatar"),
        "createdAt": _timestamp_iso(_value(row, "created_at")),
    }


def _find_student(wordcode_id):
    result = _query("""
        DECLARE $wordcode_id AS Utf8;
        SELECT wordcode_id, student_id, display_name, group_id, group_display_name, join_code, avatar, pin_hash, created_at
        FROM students WHERE wordcode_id = $wordcode_id;
    """, wordcode_id=wordcode_id)
    rows = _rows(result)
    return rows[0] if rows else None


def _register_student(data):
    display_name = str(data.get("displayName", "")).strip()[:24]
    join_code = str(data.get("joinCode", "")).strip().upper()[:24]
    avatar = str(data.get("avatar", "spark"))
    pin = str(data.get("pin", ""))
    if not display_name or not re.fullmatch(r"\d{6}", pin) or avatar not in ALLOWED_AVATARS:
        return _response(400, {"message": "Check the name, avatar and 6-digit PIN."})
    groups = _rows(_query("""
        DECLARE $join_code AS Utf8;
        SELECT group_id, display_name FROM groups WHERE join_code = $join_code;
    """, join_code=join_code))
    if not groups:
        return _response(404, {"message": "Group not found. Check the Join Code with your teacher."})
    group = groups[0]
    stem = re.sub(r"[^A-Z0-9]", "", display_name.upper())[:7] or "CODE"
    wordcode_id = None
    for _ in range(8):
        candidate = f"{stem}-{secrets.randbelow(900) + 100}"
        if _find_student(candidate) is None:
            wordcode_id = candidate
            break
    if wordcode_id is None:
        return _response(503, {"message": "Could not create an ID. Please try again."})
    student_id = str(uuid.uuid4())
    group_id = _value(group, "group_id")
    group_name = _value(group, "display_name")
    now = _utcnow()
    _query("""
        DECLARE $wordcode_id AS Utf8; DECLARE $student_id AS Utf8; DECLARE $display_name AS Utf8;
        DECLARE $group_id AS Utf8; DECLARE $group_display_name AS Utf8; DECLARE $join_code AS Utf8;
        DECLARE $avatar AS Utf8; DECLARE $pin_hash AS Utf8; DECLARE $now AS Timestamp;
        UPSERT INTO students (wordcode_id, student_id, display_name, group_id, group_display_name, join_code, avatar, pin_hash, created_at, updated_at)
        VALUES ($wordcode_id, $student_id, $display_name, $group_id, $group_display_name, $join_code, $avatar, $pin_hash, $now, $now);
        UPSERT INTO group_members (group_id, student_id, wordcode_id) VALUES ($group_id, $student_id, $wordcode_id);
    """, wordcode_id=wordcode_id, student_id=student_id, display_name=display_name, group_id=group_id,
        group_display_name=group_name, join_code=join_code, avatar=avatar, pin_hash=_hash_secret(pin), now=now)
    student = _find_student(wordcode_id)
    return _response(201, {"session": _issue_token("student", student_id, {"wordcodeId": wordcode_id}), "profile": _student_profile(student)})


def _login_student(data):
    wordcode_id = str(data.get("wordcodeId", "")).strip().upper()[:32]
    pin = str(data.get("pin", ""))
    student = _find_student(wordcode_id)
    if not student or not _verify_secret(pin, _value(student, "pin_hash")):
        return _response(401, {"message": "ID or PIN is not correct."})
    student_id = _value(student, "student_id")
    return _response(200, {"session": _issue_token("student", student_id, {"wordcodeId": wordcode_id}), "profile": _student_profile(student)})


def _change_pin(event, data):
    identity = _authenticate(event, "student")
    pin = str(data.get("pin", ""))
    if not identity:
        return _response(401, {"message": "Please sign in again."})
    if not re.fullmatch(r"\d{6}", pin):
        return _response(400, {"message": "PIN must contain exactly 6 digits."})
    _query("""
        DECLARE $wordcode_id AS Utf8; DECLARE $pin_hash AS Utf8; DECLARE $now AS Timestamp;
        UPDATE students SET pin_hash = $pin_hash, updated_at = $now WHERE wordcode_id = $wordcode_id;
    """, wordcode_id=identity["wordcodeId"], pin_hash=_hash_secret(pin), now=_utcnow())
    return _response(200, {"ok": True})


def _bootstrap_teacher(event, data):
    supplied = (event.get("headers") or {}).get("X-Bootstrap-Secret") or (event.get("headers") or {}).get("x-bootstrap-secret")
    if not supplied or not hmac.compare_digest(str(supplied), os.environ.get("BOOTSTRAP_SECRET", "disabled")):
        return _response(403, {"message": "Bootstrap access denied."})
    email = str(data.get("email", "")).strip().lower()[:120]
    password = str(data.get("password", ""))
    display_name = str(data.get("displayName", "Teacher")).strip()[:60]
    group_name = str(data.get("groupName", "Power Up 1")).strip()[:80]
    join_code = str(data.get("joinCode", "")).strip().upper()[:24]
    if "@" not in email or len(password) < 10 or not re.fullmatch(r"[A-Z0-9-]{4,24}", join_code):
        return _response(400, {"message": "Use a valid email, password of 10+ characters and Join Code."})
    teacher_id, group_id, now = str(uuid.uuid4()), str(uuid.uuid4()), _utcnow()
    _query("""
        DECLARE $email AS Utf8; DECLARE $teacher_id AS Utf8; DECLARE $display_name AS Utf8;
        DECLARE $password_hash AS Utf8; DECLARE $join_code AS Utf8; DECLARE $group_id AS Utf8;
        DECLARE $group_name AS Utf8; DECLARE $now AS Timestamp;
        UPSERT INTO teachers (email, teacher_id, display_name, password_hash, join_code, created_at)
        VALUES ($email, $teacher_id, $display_name, $password_hash, $join_code, $now);
        UPSERT INTO groups (join_code, group_id, teacher_id, display_name, created_at)
        VALUES ($join_code, $group_id, $teacher_id, $group_name, $now);
    """, email=email, teacher_id=teacher_id, display_name=display_name, password_hash=_hash_secret(password),
        join_code=join_code, group_id=group_id, group_name=group_name, now=now)
    return _response(201, {"ok": True, "joinCode": join_code})


def _login_teacher(data):
    email = str(data.get("email", "")).strip().lower()[:120]
    result = _rows(_query("""
        DECLARE $email AS Utf8;
        SELECT teacher_id, password_hash, join_code FROM teachers WHERE email = $email;
    """, email=email))
    teacher = result[0] if result else None
    if not teacher or not _verify_secret(str(data.get("password", "")), _value(teacher, "password_hash")):
        return _response(401, {"message": "Email or password is not correct."})
    teacher_id = _value(teacher, "teacher_id")
    session = _issue_token("teacher", teacher_id, {"joinCode": _value(teacher, "join_code")})
    return _response(200, {"session": session})


def _sync_events(event, data):
    identity = _authenticate(event, "student")
    if not identity:
        return _response(401, {"message": "Please sign in again."})
    events = data.get("events")
    if not isinstance(events, list) or len(events) > 50:
        return _response(400, {"message": "Send between 0 and 50 sync events."})
    acknowledged = []
    student_id = identity["sub"]
    for item in events:
        if not isinstance(item, dict) or item.get("studentId") != student_id or item.get("type") not in SYNC_TYPES:
            continue
        event_id = str(item.get("id", ""))[:80]
        entity_id = str(item.get("entityId", ""))[:160]
        payload = item.get("payload")
        if not event_id or not entity_id or not isinstance(payload, dict):
            continue
        already = _rows(_query("""
            DECLARE $student_id AS Utf8; DECLARE $event_id AS Utf8;
            SELECT event_id FROM sync_events WHERE student_id = $student_id AND event_id = $event_id;
        """, student_id=student_id, event_id=event_id))
        if already:
            acknowledged.append(event_id)
            continue
        payload_json = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        event_type = item["type"]
        if event_type == "profile.upsert":
            display_name = str(payload.get("displayName", "")).strip()[:24]
            avatar = str(payload.get("avatar", "spark"))
            if display_name and avatar in ALLOWED_AVATARS:
                _query("""
                    DECLARE $wordcode_id AS Utf8; DECLARE $display_name AS Utf8; DECLARE $avatar AS Utf8; DECLARE $now AS Timestamp;
                    UPDATE students SET display_name = $display_name, avatar = $avatar, updated_at = $now WHERE wordcode_id = $wordcode_id;
                """, wordcode_id=identity["wordcodeId"], display_name=display_name, avatar=avatar, now=_utcnow())
        elif event_type == "progress.upsert":
            _query("""
                DECLARE $student_id AS Utf8; DECLARE $target_id AS Utf8; DECLARE $payload AS Json; DECLARE $now AS Timestamp;
                UPSERT INTO progress (student_id, target_id, payload, updated_at) VALUES ($student_id, $target_id, $payload, $now);
            """, student_id=student_id, target_id=entity_id, payload=payload_json, now=_utcnow())
        elif event_type == "rewards.upsert":
            _query("""
                DECLARE $student_id AS Utf8; DECLARE $payload AS Json; DECLARE $now AS Timestamp;
                UPSERT INTO rewards (student_id, payload, updated_at) VALUES ($student_id, $payload, $now);
            """, student_id=student_id, payload=payload_json, now=_utcnow())
        elif event_type == "session.completed":
            completed_at = datetime.fromisoformat(str(payload.get("completedAt", "")).replace("Z", "+00:00"))
            _query("""
                DECLARE $student_id AS Utf8; DECLARE $completed_at AS Timestamp; DECLARE $session_id AS Utf8; DECLARE $payload AS Json;
                UPSERT INTO training_sessions (student_id, completed_at, session_id, payload) VALUES ($student_id, $completed_at, $session_id, $payload);
            """, student_id=student_id, completed_at=completed_at, session_id=entity_id, payload=payload_json)
        _query("""
            DECLARE $student_id AS Utf8; DECLARE $event_id AS Utf8; DECLARE $now AS Timestamp;
            UPSERT INTO sync_events (student_id, event_id, received_at) VALUES ($student_id, $event_id, $now);
        """, student_id=student_id, event_id=event_id, now=_utcnow())
        acknowledged.append(event_id)
    return _response(200, {"acknowledgedIds": acknowledged})


def _teacher_dashboard(event):
    identity = _authenticate(event, "teacher")
    if not identity:
        return _response(401, {"message": "Teacher login required."})
    groups = _rows(_query("""
        DECLARE $join_code AS Utf8;
        SELECT group_id, display_name FROM groups WHERE join_code = $join_code;
    """, join_code=identity.get("joinCode", "")))
    if not groups:
        return _response(404, {"message": "Teacher group not found."})
    members = _rows(_query("""
        DECLARE $group_id AS Utf8;
        SELECT student_id, wordcode_id FROM group_members WHERE group_id = $group_id;
    """, group_id=_value(groups[0], "group_id")))
    default_reward = {"id": "current", "lifetimeEnergy": 0, "bonusEnergy": 0, "stability": 100, "lastActivityAt": None, "activeDays": [], "modeCounts": {}, "unlockedAccessories": []}
    students = []
    for member in members:
        student = _find_student(_value(member, "wordcode_id"))
        if not student:
            continue
        student_id = _value(member, "student_id")
        progress_rows = _rows(_query("""
            DECLARE $student_id AS Utf8;
            SELECT payload FROM progress WHERE student_id = $student_id;
        """, student_id=student_id))
        reward_rows = _rows(_query("""
            DECLARE $student_id AS Utf8;
            SELECT payload FROM rewards WHERE student_id = $student_id;
        """, student_id=student_id))
        session_rows = _rows(_query("""
            DECLARE $student_id AS Utf8;
            SELECT payload FROM training_sessions WHERE student_id = $student_id ORDER BY completed_at DESC LIMIT 30;
        """, student_id=student_id))
        students.append({
            "profile": _student_profile(student),
            "progress": [json.loads(_value(row, "payload")) for row in progress_rows],
            "reward": json.loads(_value(reward_rows[0], "payload")) if reward_rows else default_reward,
            "sessions": [json.loads(_value(row, "payload")) for row in session_rows],
        })
    return _response(200, {
        "group": {"joinCode": identity.get("joinCode", ""), "displayName": _value(groups[0], "display_name")},
        "students": students,
    })


def handler(event, context):
    del context
    try:
        method, path, data = _method(event), _path(event), _body(event)
        if method == "OPTIONS":
            return _response(204, {})
        if method == "GET" and path == "/health":
            return _response(200, {"ok": True, "service": "word-code-sync"})
        if method == "POST" and path == "/student/register":
            return _register_student(data)
        if method == "POST" and path == "/student/login":
            return _login_student(data)
        if method == "POST" and path == "/student/pin":
            return _change_pin(event, data)
        if method == "POST" and path == "/teacher/login":
            return _login_teacher(data)
        if method == "GET" and path == "/teacher/dashboard":
            return _teacher_dashboard(event)
        if method == "POST" and path == "/sync/events":
            return _sync_events(event, data)
        if method == "POST" and path == "/setup/teacher":
            return _bootstrap_teacher(event, data)
        return _response(404, {"message": "Route not found."})
    except KeyError as error:
        return _response(500, {"message": f"Missing function setting: {error.args[0]}"})
    except Exception as error:
        print(f"WORD_CODE_ERROR {type(error).__name__}: {error}", flush=True)
        traceback.print_exc()
        return _response(500, {"message": "Cloud service error. Local learning data is still safe."})
