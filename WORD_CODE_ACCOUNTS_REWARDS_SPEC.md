# WORD//CODE — система аккаунтов, прогресса и наград

## Цель

Расширить существующий проект WORD//CODE системой ученических аккаунтов, облачного прогресса, учительской панели и единой игровой системой наград.

Важно: не переделывать существующую учебную механику, структуру юнитов, игровые режимы, дизайн, PWA и адаптивность. Новая система должна быть надстройкой над уже работающим приложением.

---

# 0. Визуальный референс и правила реализации дизайна

К этой инструкции будет приложена **референсная картинка финального экрана наград WORD//CODE**.

Она является **главным визуальным источником истины** для новой системы наград.

При реализации необходимо:

- максимально точно повторить композицию, визуальную иерархию, настроение, плотность интерфейса и пропорции элементов из референса;
- сохранить существующий визуальный язык WORD//CODE;
- не создавать новый стиль приложения;
- не заменять референс собственными дизайнерскими решениями без необходимости;
- не уходить в тёмный cyberpunk / hacker UI;
- сохранить светлый premium techno-fantasy/anime стиль;
- использовать существующие цвета WORD//CODE: cyan, sky blue, deep blue, violet, lavender, soft pink, white glow и небольшие золотые акценты;
- сохранить мягкие glassmorphism-панели, rounded cards, glow, crystal-tech детали и воздушный фон;
- интерфейс должен выглядеть как естественное продолжение уже существующего WORD//CODE, а не как отдельный продукт.

## 0.1. Что брать непосредственно из референса

Референс определяет:

- расположение главных блоков страницы Rewards;
- масштаб и позицию Code Spirit;
- расположение Crystal Cores;
- отображение World Restored;
- расположение My Artifacts;
- визуальный блок Stability / Spirit Signal;
- Energy bar;
- карточки unlock-аксессуаров;
- общую плотность и размеры элементов;
- радиусы карточек;
- glow и blur;
- отступы;
- визуальный баланс между фоном и UI;
- характер подсветки активного раздела Rewards.

Не нужно буквально превращать весь референс в одну картинку. Интерфейс должен оставаться настоящим HTML/CSS/React UI.

## 0.2. Что реализовать через CSS / UI, а не изображениями

Следующие элементы **не являются отдельными ассетами** и должны создаваться средствами CSS, HTML и обычных SVG/UI-иконок:

- панели;
- карточки;
- рамки;
- border;
- border-radius;
- box-shadow;
- glow;
- blur;
- glassmorphism;
- progress bars;
- Energy bar;
- Stability bar;
- Crystal progress;
- кнопки;
- tabs;
- navigation;
- lock-state;
- disabled-state;
- hover-state;
- active-state;
- badges;
- rarity colors;
- обычные UI-иконки;
- звёзды рейтинга;
- проценты;
- подписи;
- модальные окна;
- overlay;
- locked mist / затемнение;
- линии и соединители между этапами;
- простые sparkles/particles, если они могут быть сделаны CSS без тяжёлых изображений.

Не генерировать дополнительные изображения для того, что можно аккуратно сделать CSS.

## 0.3. Работа с папкой assets

Все подготовленные художественные изображения пользователь помещает в:

```text
/assets
```

Перед началом реализации необходимо **один раз** проверить реальные имена файлов в папке `/assets` и связать их с семантическими ключами из списка ассетов ниже.

Если реальные имена файлов немного отличаются от предложенных в этой инструкции:

- не создавать дубликаты;
- не генерировать новые изображения;
- не переименовывать пользовательские файлы без необходимости;
- использовать существующий подходящий файл;
- создать единый `assetManifest` / объект-конфигурацию и хранить соответствие имён в одном месте.

Пример:

```js
const rewardsAssets = {
  spirit: {
    spark: "/assets/spirit-spark.png",
    sprite: "/assets/spirit-sprite.png",
    spirit: "/assets/spirit-spirit.png",
    guardian: "/assets/spirit-guardian.png",
    master: "/assets/spirit-master.png",
  }
}
```

Не разбрасывать пути к файлам по множеству компонентов.

---

# 1. Общая игровая система

Использовать четыре связанные системы:

1. **CODE SPIRIT** — главный персонаж ученика.
2. **CRYSTAL CORES** — кристаллы за прохождение юнитов.
3. **SECRET WORLD** — открытие новых территорий мира.
4. **ARTIFACT COLLECTION** — редкие коллекционные награды.

Общая игровая петля:

**DO TASKS → GET ENERGY → RESTORE CRYSTALS → OPEN WORLDS → EVOLVE CODE SPIRIT → FIND ARTIFACTS**

Ошибки в заданиях не должны наказываться. Учебный прогресс не должен уменьшаться из-за ошибок или отсутствия активности.

---

# 2. CODE SPIRIT

У каждого ученика после регистрации появляется собственный Code Spirit.

Он развивается по мере занятий.

Пример этапов:

- Spark
- Sprite
- Spirit
- Guardian
- Master Spirit

По мере развития Code Spirit может визуально получать:

- более сильное свечение;
- новые ауры;
- кристалл;
- крылья;
- techno/fantasy-аксессуары;
- дополнительные визуальные эффекты.

Главный ресурс развития — **Energy**.

Пример:

```text
LEVEL 12

██████████░░ 820 / 1000 Energy
```

После тренировки ученик получает Energy.

Пример экрана:

```text
TRAINING COMPLETE

+85 Energy
+1 Crystal Fragment

Unit 3 Crystal: 75%

Your Code Spirit is getting stronger.

Next evolution: 140 Energy
```

Уровни Code Spirit не должны уменьшаться из-за отсутствия активности.

---

# 3. CRYSTAL CORES

У каждого юнита есть собственный кристалл.

За прохождение частей юнита кристалл постепенно восстанавливается.

Например, если в юните четыре части:

```text
Part 1 → 25%
Part 2 → 50%
Part 3 → 75%
Part 4 → 100%
```

Если частей две:

```text
Part 1 → 50%
Part 2 → 100%
```

Предусмотреть два состояния:

- **Restored** — все части юнита завершены;
- **Mastered** — материал юнита достаточно устойчиво освоен.

Нельзя отнимать уже полученный Crystal Core.

---

# 4. SECRET WORLD

Каждый восстановленный Crystal Core открывает новую территорию мира.

Финальная карта территорий:

```text
Hello! → Gateway
Unit 1 → Crystal Academy
Unit 2 → Mirror Garden
Unit 3 → Sky Farm
Unit 4 → Floating Café
Unit 5 → Starlight Library
Unit 6 → Sun Pyramid Oasis
Unit 7 → Cosmic Harbor
Unit 8 → Tropical Coding Cove
Unit 9 → Aurora Peaks
```

Эти названия использовать как стабильные внутренние названия территорий и как основу для связи с подготовленными world-assets.

На карте курса ученик должен визуально видеть:

- открытые территории;
- текущую территорию;
- закрытые территории;
- восстановленные Crystal Cores.

После завершения юнита можно показывать:

```text
CRYSTAL RESTORED

Unit 4 complete

New area unlocked:
FLOATING CAFÉ

New artifact:
WORD KEY
```

Открытые территории никогда не закрываются обратно из-за отсутствия активности.

---

# 5. ARTIFACT COLLECTION

В профиле ученика добавить раздел коллекционных артефактов.

Артефакты выдаются за разные типы учебных достижений.

Примеры:

- **Memory Crystal** — за SCAN / MEMORY;
- **Audio Orb** — за AUDIO CODE;
- **Repair Gear** — за REPAIR;
- **Decoder Lens** — за ERROR HUNT;
- **Sentence Core** — за SENTENCE BUILD;
- **Master Key** — за использование всех основных режимов;
- **Prism Fragment** — за освоение большого количества слов;
- **Ancient Code** — за Mastered Unit.

Артефакты не должны зависеть только от идеальных результатов.

Цель системы — мотивировать ученика использовать разные игровые режимы.

---

# 6. Система активности и наказания

Обязательно добавить наказание за отсутствие активности.

Наказание начинает действовать, если ученик **не заходил и не занимался 3 дня**.

При этом нельзя:

- удалять пройденные юниты;
- уменьшать mastery;
- отнимать Crystal Cores;
- закрывать открытые миры;
- удалять артефакты;
- откатывать уровень Code Spirit;
- изменять реальную учебную статистику.

Для наказания использовать игровую механику **Spirit Stability / CODE DECAY**.

---

## 6.1. Spirit Stability

После нормальной активности:

```text
STABILITY 100%
```

Логика:

- 1 день без активности — без наказания;
- 2 дня без активности — без наказания;
- с 3-го дня запускается **CODE DECAY**.

После этого Stability может уменьшаться, например, на 10% за каждый дополнительный день отсутствия.

Минимальное значение — например 20%.

Пример:

```text
CODE SPIRIT SIGNAL WEAK

Stability: 60%
```

Визуально при низкой Stability:

- Code Spirit светится слабее;
- кристалл становится тусклее;
- уменьшается количество декоративных эффектов;
- появляется лёгкий digital static;
- может временно отключаться бонусная idle-анимация.

Не делать интерфейс страшным, мрачным или тревожным.

---

## 6.2. Восстановление Stability

После возвращения ученика Stability должна быстро восстанавливаться.

Например:

```text
Complete one training
+30 Stability
```

Пример:

```text
20% → 50%
50% → 80%
80% → 100%
```

После полного восстановления:

```text
FULL SIGNAL RESTORED

+20 Energy
```

---

## 6.3. Energy Bank

Можно дополнительно использовать мягкое наказание через бонусную Energy.

После 3 дней отсутствия начинает уменьшаться только **непотраченная бонусная Energy**.

Например:

```text
-20 Energy per inactive day
```

При этом:

- уже полученные уровни Code Spirit не уменьшаются;
- открытые награды не удаляются;
- учебный прогресс не изменяется.

---

# 7. Learning Rhythm / Active Days

Добавить статистику активности.

Варианты отображения:

```text
Active this week: 2 / 3
```

или:

```text
7 Active Days
```

Можно использовать streak, но потеря streak не должна отнимать основные награды.

Лучше использовать формулировки:

- Learning Rhythm
- Active Days
- Signal Days

---

# 8. Архитектура: два frontend-host, одна база

Использовать одну общую облачную базу данных и два отдельных интерфейса.

```text
                    WORD//CODE DATABASE
                           │
               ┌───────────┴───────────┐
               │                       │
        STUDENT APP               TEACHER APP
```

## Student host

Ученик видит только:

- Login / Register
- Home
- Course Map
- Unit
- Training
- My Progress
- My Rewards
- My Collection
- My Account
- Settings

## Teacher host

Учитель видит:

- Dashboard
- Groups
- Students
- Course Progress
- Problem Words
- Activity
- Rewards
- Student Profile
- Account management
- Settings

Student frontend не должен содержать Teacher Mode или маршруты учительской панели.

---

# 9. Регистрация ученика

Не использовать email ребёнка.

Регистрация должна быть максимально простой.

Поля:

1. **Name / nickname**
2. **Group**
3. **Avatar**
4. **6-digit PIN**

---

## 9.1. Name

Поле:

```text
Your name

[ Sasha ]
```

Это display name.

Ученик позже может изменить отображаемое имя.

---

## 9.2. Group

Группа должна **впечатываться учеником вручную**.

Не использовать dropdown.

Лучший вариант — разделить:

- отображаемое название группы;
- короткий Join Code.

Учитель создаёт, например:

```text
Display name:
Power Up 1 — Monday

Join code:
PU1-MON
```

Ученик при регистрации видит:

```text
Your group

[ PU1-MON ]

Enter the group exactly as your teacher gave it to you.
```

После ввода система проверяет существование группы.

Если группа найдена:

```text
✓ Group found
```

Если нет:

```text
Group not found.
Check the group name with your teacher.
```

Поиск должен быть устойчив к:

- регистру;
- случайным пробелам в начале и конце.

Например:

```text
pu1-mon
PU1-MON
 PU1-MON
```

должны находить одну и ту же группу.

Но внутри базы должна использоваться реальная `group_id`.

После регистрации ученик не должен самостоятельно менять группу.

В Account:

```text
Group
Power Up 1 — Monday

Locked
Ask your teacher to change your group.
```

Изменить группу может только учитель.

---

## 9.3. Avatar

Во время регистрации ученик выбирает Code Avatar.

Позже Avatar можно изменить в Account.

---

## 9.4. PIN

Использовать 6-значный PIN вместо длинного password.

Регистрация:

```text
Create your PIN

[ • • • • • • ]

Repeat PIN

[ • • • • • • ]
```

PIN необходимо безопасно хранить, не сохранять его как обычный открытый текст.

---

# 10. WORD//CODE ID

После регистрации система автоматически создаёт уникальный идентификатор ученика.

Например:

```text
YOUR WORD//CODE ID

SASHA-482
```

Этот ID:

- используется для входа;
- отображается в Teacher Panel;
- не меняется при смене display name;
- должен быть уникальным.

В одной группе могут быть несколько учеников с одинаковым именем, поэтому внутренний `student_id` и WORD//CODE ID обязательны.

---

# 11. Вход ученика

Экран:

```text
WELCOME BACK

WORD//CODE ID
[ SASHA-482 ]

PIN
[ •••••• ]

[ ENTER ]
```

Добавить:

```text
Remember me
```

На личном устройстве ученик может оставаться авторизованным.

---

# 12. Восстановление PIN

Не использовать восстановление через email.

На student host:

```text
Forgot your PIN?

Ask your teacher to reset it.
```

В Teacher Panel:

```text
Student → Account → Reset PIN
```

Учитель может создать временный PIN.

Например:

```text
Temporary PIN:
428191
```

После первого входа с временным PIN ученик должен задать новый PIN.

---

# 13. Account ученика

Раздел **MY ACCOUNT**.

Разрешить менять:

- Avatar;
- Display name;
- PIN.

Не разрешать менять:

- WORD//CODE ID;
- Group.

Пример:

```text
PROFILE

Avatar
[ CHANGE ]

Display name
Sasha
[ EDIT ]

ACCOUNT

WORD//CODE ID
SASHA-482
Locked

Group
Power Up 1 — Monday
Locked

PIN
[ CHANGE PIN ]
```

---

# 14. Settings ученика

Account и Settings должны быть разными разделами.

В Settings:

## Sound

```text
ON / OFF
```

## Music

```text
ON / OFF
```

## Animations

```text
FULL / REDUCED
```

## Text size

```text
NORMAL / LARGE
```

## Vibration

Если устройство поддерживает:

```text
ON / OFF
```

## British voice

Для AUDIO CODE:

```text
VOICE
[ TEST ]
```

Сохранять British English.

---

# 15. Что ученик не должен видеть

Student host не должен показывать:

- Teacher Mode;
- список других учеников;
- чужой прогресс;
- группы других учеников;
- рейтинги класса;
- чужие награды;
- общую аналитику;
- CRUD курса;
- teacher routes.

---

# 16. Teacher Dashboard

Главная учительская панель должна содержать:

- Groups
- Students
- Course Progress
- Problem Words
- Activity
- Rewards
- Account management

---

# 17. Groups

Учитель может:

- создавать группу;
- редактировать отображаемое название;
- задавать Join Code;
- видеть количество учеников;
- открывать список учеников;
- переносить ученика в другую группу.

Пример:

```text
GROUPS

Power Up 1 — Monday
Join code: PU1-MON
12 students

Power Up 1 — Wednesday
Join code: PU1-WED
9 students

A2 Group
Join code: A2-01
7 students
```

---

# 18. Students

Общий список:

```text
Student    Current    Progress    Mastered    Last activity
Sasha      Unit 6     64%         211         Today
Varya      Unit 4     43%         157         Yesterday
Misha      Unit 7     72%         249         Today
```

Должны быть фильтры как минимум по группе.

---

# 19. Course Progress

Добавить общую карту прогресса класса.

Пример:

```text
           H  U1 U2 U3 U4 U5 U6 U7 U8 U9

Sasha      ✓  ✓  ✓  ✓  ●  ○  ○  ○  ○  ○
Varya      ✓  ✓  ✓  ●  ○  ○  ○  ○  ○  ○
Misha      ✓  ✓  ✓  ✓  ✓  ✓  ●  ○  ○  ○
Arina      ✓  ✓  ●  ○  ○  ○  ○  ○  ○  ○
```

Состояния:

- mastered;
- completed;
- learning;
- started;
- not started.

---

# 20. Problem Words

Teacher Dashboard должен автоматически агрегировать самые сложные слова и фразы.

Пример:

```text
Most difficult this week

1. vegetables      11 students
2. cupboard         9 students
3. trousers         8 students
4. favourite        7 students
5. beautiful        7 students
```

По возможности учитывать:

- количество учеников, у которых цель нестабильна;
- число ошибок;
- число повторных попыток;
- текущий mastery.

---

# 21. Inactive Students

Обязательный блок Teacher Dashboard.

Если ученик не проявлял учебной активности 3 дня, он получает статус:

```text
INACTIVE
```

Пример:

```text
NEEDS ATTENTION — 4

Student    Group    Last activity
Sasha      PU1-A    3 days ago
Misha      PU1-A    5 days ago
Varya      PU1-B    8 days ago
```

Этот статус должен быть связан с ученической механикой CODE DECAY.

---

# 22. Профиль ученика для учителя

Пример:

```text
SASHA

WORD//CODE ID:
SASHA-482

Group:
PU1-MON

Last activity:
Today

Joined:
14 Aug 2026
```

## Course

```text
████████████░░ 68%

Units completed: 6 / 10
Words mastered: 217
Current Unit: Unit 7
```

## Activity

```text
Today — 18 min
12 Aug — 24 min
9 Aug — 15 min
```

## Spirit

```text
Level 4 — Guardian
Stability 100%
Energy 840
```

## Rewards

```text
6 Crystal Cores
7 Worlds
14 Artifacts
```

## Needs Practice

```text
cupboard
vegetables
trousers
Would you like...?
```

---

# 23. Данные прогресса

Сохранять прогресс не только на уровне юнита.

Нужна структура:

```text
Student
 ├── Hello
 ├── Unit 1
 │    ├── Part 1
 │    ├── Part 2
 │    ├── Part 3
 │    └── Part 4
 ├── Unit 2
 └── ...
```

Для каждой учебной цели хранить минимум:

```text
target
attempts
correct
lastResult
mastery
lastPractisedAt
```

Пример:

```text
school

attempts: 8
correct: 6
lastResult: correct
mastery: 0.81
```

Также хранить историю тренировок.

---

# 24. Основные сущности базы

Рекомендуемая логическая структура:

```text
teachers
groups
students
student_accounts
student_settings
training_sessions
target_progress
unit_progress
rewards
student_rewards
spirit_state
activity_log
```

Минимально студент должен иметь:

```text
student_id
wordcode_id
display_name
group_id
avatar
created_at
last_activity
```

Не использовать имя ученика как уникальный идентификатор.

---

# 25. Безопасность

Ученик должен иметь доступ только к собственным данным.

Teacher должен иметь доступ только к данным, которые относятся к его системе / группам.

Недостаточно просто скрыть Teacher Page в React.

Ограничение доступа должно существовать на уровне backend/database.

Не хранить PIN в открытом виде.

Не позволять student client самостоятельно присваивать себе teacher role.

---

# 26. Технологическое направление

Для облачной части проекта оптимально использовать backend с:

- Authentication;
- PostgreSQL или аналогичной структурированной базой;
- серверными правилами доступа;
- role-based access;
- realtime/cloud sync при необходимости.

Предпочтительное направление — Supabase или эквивалентное решение.

При реализации не ломать существующую локальную IndexedDB сразу.

Желательно сохранить IndexedDB как:

- локальный cache;
- offline fallback;
- временное хранилище до синхронизации.

При восстановлении сети локальные результаты должны синхронизироваться с облачной базой.

---

# 27. Итоговая модель WORD//CODE

## Регистрация

```text
Name
→ Group / Join Code
→ Avatar
→ 6-digit PIN
→ generated WORD//CODE ID
```

## Ученик

```text
Course
+ Training
+ Progress
+ Rewards
+ Collection
+ Account
+ Settings
```

## Награды

```text
Energy
+ Code Spirit
+ Crystal Cores
+ Secret Worlds
+ Artifacts
```

## Отсутствие 3 дня

```text
CODE DECAY
→ Stability decreases
→ bonus Energy may decrease
```

При этом никогда не уменьшается реальный учебный прогресс.

## Учитель

```text
Groups
→ Students
→ Progress
→ Problem Words
→ Activity
→ Inactive Students
→ Rewards
→ Account Management
```

---

# 28. Главный принцип реализации

WORD//CODE должен оставаться прежде всего учебным приложением.

Геймификация должна:

- мотивировать регулярно возвращаться;
- давать чувство развития;
- показывать визуальный результат работы;
- не заставлять бояться ошибок;
- не искажать учебную статистику;
- не создавать публичного соревнования между детьми;
- не отнимать уже заработанные знания и постоянные достижения.

Основная формула продукта:

**LEARN → MASTER → RESTORE → EVOLVE → DISCOVER**

---

# 29. Полный список художественных ассетов Rewards

Все перечисленные ниже изображения уже подготовлены пользователем и должны находиться в папке:

```text
/assets
```

Ниже указаны **рекомендуемые канонические имена**. Если пользовательские файлы уже называются немного иначе, необходимо один раз сопоставить их в `assetManifest`, а не создавать копии.

---

## 29.1. Code Spirit — 5 стадий

Используются как основные визуальные стадии развития персонажа.

```text
spirit-spark.png
spirit-sprite.png
spirit-spirit.png
spirit-guardian.png
spirit-master.png
```

Семантика:

| Asset | Стадия |
|---|---|
| `spirit-spark.png` | Spark |
| `spirit-sprite.png` | Sprite |
| `spirit-spirit.png` | Spirit |
| `spirit-guardian.png` | Guardian |
| `spirit-master.png` | Master Spirit |

Не пытаться дорисовывать эти стадии CSS-фильтрами. Использовать соответствующий готовый asset.

---

## 29.2. Unlock-аксессуары Code Spirit — 5

```text
spirit-crystal-core.png
spirit-neon-wings.png
spirit-star-aura.png
spirit-decoder-halo.png
spirit-prism-trail.png
```

Семантика:

| Asset | Unlock |
|---|---|
| `spirit-crystal-core.png` | Crystal Core |
| `spirit-neon-wings.png` | Neon Wings |
| `spirit-star-aura.png` | Star Aura |
| `spirit-decoder-halo.png` | Decoder Halo |
| `spirit-prism-trail.png` | Prism Trail |

В интерфейсе хранить состояние:

```text
locked
unlocked
equipped
```

Если аксессуар заблокирован, использовать тот же asset с CSS-overlay / opacity / lock badge. Не создавать отдельную картинку locked-версии.

---

## 29.3. Артефакты — 8

```text
artifact-memory-crystal.png
artifact-audio-orb.png
artifact-repair-gear.png
artifact-decoder-lens.png
artifact-sentence-core.png
artifact-master-key.png
artifact-prism-fragment.png
artifact-ancient-code.png
```

Семантика:

| Asset | Артефакт | Связь с обучением |
|---|---|---|
| `artifact-memory-crystal.png` | Memory Crystal | SCAN / MEMORY |
| `artifact-audio-orb.png` | Audio Orb | AUDIO CODE |
| `artifact-repair-gear.png` | Repair Gear | REPAIR |
| `artifact-decoder-lens.png` | Decoder Lens | ERROR HUNT |
| `artifact-sentence-core.png` | Sentence Core | SENTENCE BUILD |
| `artifact-master-key.png` | Master Key | использование всех основных режимов |
| `artifact-prism-fragment.png` | Prism Fragment | крупный milestone по словам / mastery |
| `artifact-ancient-code.png` | Ancient Code | редкая награда за Mastered Unit / высокий milestone |

Locked-версию артефакта делать CSS:

```text
opacity
blur
grayscale / saturate
lock overlay
```

Не хранить отдельный locked PNG.

---

## 29.4. Миры / территории — 10

```text
world-gateway.png
world-crystal-academy.png
world-mirror-garden.png
world-sky-farm.png
world-floating-cafe.png
world-starlight-library.png
world-sun-pyramid-oasis.png
world-cosmic-harbor.png
world-tropical-coding-cove.png
world-aurora-peaks.png
```

Связь с курсом:

| Course | World | Asset |
|---|---|---|
| Hello! | Gateway | `world-gateway.png` |
| Unit 1 | Crystal Academy | `world-crystal-academy.png` |
| Unit 2 | Mirror Garden | `world-mirror-garden.png` |
| Unit 3 | Sky Farm | `world-sky-farm.png` |
| Unit 4 | Floating Café | `world-floating-cafe.png` |
| Unit 5 | Starlight Library | `world-starlight-library.png` |
| Unit 6 | Sun Pyramid Oasis | `world-sun-pyramid-oasis.png` |
| Unit 7 | Cosmic Harbor | `world-cosmic-harbor.png` |
| Unit 8 | Tropical Coding Cove | `world-tropical-coding-cove.png` |
| Unit 9 | Aurora Peaks | `world-aurora-peaks.png` |

Для locked-состояния:

- не использовать отдельную картинку;
- применять CSS-opacity;
- уменьшать saturation;
- добавлять soft blue mist;
- отображать lock icon;
- сохранять силуэт мира видимым, чтобы ребёнку хотелось его открыть.

Для unlocked:

- full color;
- обычное мягкое glow.

Для mastered:

- тот же asset;
- добавить CSS prismatic / gold glow;
- при необходимости небольшой animated halo.

---

## 29.5. Фон страницы Rewards — 1

Рекомендуемое имя:

```text
rewards-sanctuary-bg.webp
```

или, если пользователь сохранил PNG:

```text
rewards-sanctuary-bg.png
```

Это полноэкранный фон страницы наград: светлый floating crystal sanctuary / reward arena над облаками.

Использовать как background для Rewards.

Требования:

- `background-size: cover`;
- центрировать корректно;
- сохранять читаемость UI;
- добавить при необходимости лёгкий CSS overlay;
- не затемнять фон слишком сильно;
- на мобильных использовать подходящий `background-position`;
- UI не должен сливаться с фоном.

---

# 30. Рекомендуемый asset manifest

Создать один файл, например:

```text
src/config/rewardsAssets.ts
```

Пример структуры:

```ts
export const rewardsAssets = {
  background: "/assets/rewards-sanctuary-bg.webp",

  spirit: {
    spark: "/assets/spirit-spark.png",
    sprite: "/assets/spirit-sprite.png",
    spirit: "/assets/spirit-spirit.png",
    guardian: "/assets/spirit-guardian.png",
    master: "/assets/spirit-master.png",
  },

  accessories: {
    crystalCore: "/assets/spirit-crystal-core.png",
    neonWings: "/assets/spirit-neon-wings.png",
    starAura: "/assets/spirit-star-aura.png",
    decoderHalo: "/assets/spirit-decoder-halo.png",
    prismTrail: "/assets/spirit-prism-trail.png",
  },

  artifacts: {
    memoryCrystal: "/assets/artifact-memory-crystal.png",
    audioOrb: "/assets/artifact-audio-orb.png",
    repairGear: "/assets/artifact-repair-gear.png",
    decoderLens: "/assets/artifact-decoder-lens.png",
    sentenceCore: "/assets/artifact-sentence-core.png",
    masterKey: "/assets/artifact-master-key.png",
    prismFragment: "/assets/artifact-prism-fragment.png",
    ancientCode: "/assets/artifact-ancient-code.png",
  },

  worlds: {
    gateway: "/assets/world-gateway.png",
    crystalAcademy: "/assets/world-crystal-academy.png",
    mirrorGarden: "/assets/world-mirror-garden.png",
    skyFarm: "/assets/world-sky-farm.png",
    floatingCafe: "/assets/world-floating-cafe.png",
    starlightLibrary: "/assets/world-starlight-library.png",
    sunPyramidOasis: "/assets/world-sun-pyramid-oasis.png",
    cosmicHarbor: "/assets/world-cosmic-harbor.png",
    tropicalCodingCove: "/assets/world-tropical-coding-cove.png",
    auroraPeaks: "/assets/world-aurora-peaks.png",
  },
}
```

Если фактическое расширение или имя отличается — заменить путь только здесь.

---

# 31. Как должна выглядеть Rewards Page по референсу

На desktop использовать структуру, близкую к приложенному референсу:

```text
┌──────────────┬───────────────────────────────┬─────────────────────────┐
│              │                               │ Crystal Cores           │
│ Navigation   │       CODE SPIRIT             ├─────────────────────────┤
│              │       Evolution               │ World Restored          │
│              │                               ├─────────────────────────┤
│              │       Energy                  │ Stability / Signal      │
├──────────────┴───────────────────────────────┴─────────────────────────┤
│                         MY ARTIFACTS                                  │
└───────────────────────────────────────────────────────────────────────┘
```

Это не жёсткая pixel-perfect grid, но общая композиция должна быть очень близкой к референсу.

## Центральный блок

Главный визуальный герой:

```text
CODE SPIRIT
GUARDIAN
LEVEL 4
```

Вокруг:

- evolution path;
- Spark;
- Sprite;
- Spirit;
- Guardian;
- Master;
- unlock accessories.

Ниже:

```text
840 / 1000 ENERGY
```

и:

```text
160 Energy until next evolution
```

## Правая верхняя карточка

```text
CRYSTAL CORES
```

Показывает текущие Unit crystals.

## Правая средняя карточка

```text
WORLD RESTORED
4 / 10
```

Использовать world-assets как реальные художественные изображения.

## Правая нижняя карточка

```text
SPIRIT SIGNAL
100%
Active today
```

При inactivity:

```text
CODE DECAY
```

Визуальная деградация должна быть мягкой.

## Нижняя секция

```text
MY ARTIFACTS
```

Показывает artifact-assets.

---

# 32. Responsive / Mobile

Rewards page должна корректно работать на любом размере экрана.

Desktop:

- использовать референсную многоколоночную композицию.

Tablet:

- центральный Code Spirit остаётся первым визуальным фокусом;
- Crystal Cores и World Restored можно размещать в двух карточках под ним;
- Artifacts ниже.

Mobile portrait:

```text
Header
↓
Code Spirit
↓
Energy / Stability
↓
Current Goal
↓
Crystal Cores
↓
World Restored
↓
Artifacts
↓
Account / navigation
```

На телефоне допускается вертикальная прокрутка.

Нельзя:

- пытаться ужать desktop layout до нечитаемого состояния;
- использовать горизонтальный overflow для основного контента;
- делать мелкий текст;
- обрезать Code Spirit;
- делать world-assets слишком маленькими.

---

# 33. Финальные ограничения для Codex

При выполнении задачи:

1. Не переписывать существующую игру.
2. Не менять существующие упражнения.
3. Не менять учебную структуру Units.
4. Не удалять IndexedDB до завершения cloud-sync.
5. Не заменять готовые assets генеративными placeholder.
6. Не использовать случайные картинки из интернета.
7. Не создавать дополнительные asset-файлы, если соответствующий файл уже существует в `/assets`.
8. Не превращать картинки в background там, где они являются интерактивным reward-object.
9. Не рисовать сложные уникальные артефакты CSS, если для них есть готовый asset.
10. Не делать отдельные PNG для UI-элементов, которые проще реализовать CSS.
11. Использовать приложенный reference image как визуальный ориентир №1.
12. Все новые элементы должны визуально совпадать с текущим WORD//CODE.
13. Ученик не должен иметь доступ к данным других учеников.
14. Teacher data должны быть защищены backend-правилами, а не только скрыты в frontend.
15. Сохранять все реальные учебные результаты независимо от reward-state.

---

# 34. Definition of Done для Rewards

Функция Rewards считается реализованной, если:

- страница визуально соответствует приложенному референсу;
- используются реальные assets из `/assets`;
- отображается актуальная стадия Code Spirit;
- работает Energy;
- работает evolution;
- работают unlock-аксессуары;
- отображаются Crystal Cores;
- показывается прогресс каждого Unit crystal;
- открываются соответствующие world-assets;
- работает World Restored `X / 10`;
- отображаются артефакты;
- locked/unlocked/mastered states работают без отдельных дублирующих PNG;
- работает Stability;
- после 3 дней неактивности запускается CODE DECAY;
- реальный учебный прогресс при этом не уменьшается;
- Rewards корректно работает на desktop, tablet и mobile;
- все пути к художественным файлам централизованы;
- приложение не падает при отсутствии одного необязательного asset;
- Teacher Dashboard видит reward-state и activity ученика;
- Student UI не показывает чужие данные.

---

# 35. Итоговая формула Rewards

```text
LEARN
  ↓
GET ENERGY
  ↓
RESTORE CRYSTALS
  ↓
OPEN WORLDS
  ↓
EVOLVE CODE SPIRIT
  ↓
UNLOCK ACCESSORIES
  ↓
COLLECT ARTIFACTS
```

При отсутствии активности:

```text
3 DAYS INACTIVE
  ↓
CODE DECAY
  ↓
STABILITY ↓
  ↓
RETURN TO TRAINING
  ↓
SIGNAL RESTORED
```

**Никогда не откатывать реальные знания, Mastery, завершённые Units, открытые Worlds, permanent Artifacts или достигнутую evolution-stage.**
