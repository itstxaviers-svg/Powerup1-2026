#!/usr/bin/env python3
"""Create the initial WORD//CODE teacher account without echoing secrets."""

import getpass
import json
import subprocess
import sys
import tempfile


API_URL = "https://d5d0g9d295rp9cg59nvd.qsvaa8tq.apigw.yandexcloud.net/setup/teacher"


def ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    value = input(f"{prompt}{suffix}: ").strip()
    return value or default


def main() -> int:
    print("WORD//CODE — создание аккаунта учителя")
    print("Пароль и секрет не отображаются на экране.\n")

    email = ask("Email учителя")
    display_name = ask("Имя учителя", "Sophie")
    group_name = ask("Название группы", "Power Up 1")
    join_code = ask("Код группы для учеников", "POWERUP1").upper()
    password = getpass.getpass("Пароль учителя (минимум 10 символов): ")
    bootstrap_secret = getpass.getpass("BOOTSTRAP_SECRET из личной заметки: ")

    payload = json.dumps(
        {
            "email": email,
            "displayName": display_name,
            "groupName": group_name,
            "joinCode": join_code,
            "password": password,
        }
    ).encode("utf-8")
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8") as config:
            escaped_secret = bootstrap_secret.replace("\\", "\\\\").replace('"', '\\"')
            config.write(f'header = "X-Bootstrap-Secret: {escaped_secret}"\n')
            config.flush()
            completed = subprocess.run(
                [
                    "curl",
                    "-sS",
                    "--max-time",
                    "30",
                    "--config",
                    config.name,
                    "--request",
                    "POST",
                    "--header",
                    "Content-Type: application/json",
                    "--data-binary",
                    "@-",
                    "--write-out",
                    "\n%{http_code}",
                    API_URL,
                ],
                input=payload,
                capture_output=True,
                check=False,
            )
        if completed.returncode != 0:
            detail = completed.stderr.decode("utf-8", errors="replace").strip()
            print(f"\nНе удалось подключиться: {detail}")
            return 1
        response_body, status_text = completed.stdout.rsplit(b"\n", 1)
        status = int(status_text)
        result = json.loads(response_body.decode("utf-8"))
        if status >= 400:
            print(f"\nОшибка сервера ({status}): {result}")
            return 1
    except Exception as error:
        print(f"\nНе удалось подключиться: {error}")
        return 1

    if result.get("ok"):
        print(f"\nГотово! Аккаунт учителя и группа {result['joinCode']} созданы.")
        return 0

    print(f"\nНеожиданный ответ: {result}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
