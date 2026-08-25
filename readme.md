# LangClub

Веб-платформа для поиска языковых клубов и записи на разговорные встречи.

LangClub — fullstack-платформа для поиска языковых клубов и записи на разговорные встречи. Реализовал на Next.js 16 + React 19 + TypeScript с Server Actions, Supabase (PostgreSQL, Auth, RLS), Tailwind CSS v4 и shadcn/ui. Покрыл unit-тестами (Vitest) и E2E (Playwright). Архитектура: слоистая, с триггерами БД, миграциями и денормализацией для оптимизации RLS-запросов.

---

## Содержание

- [Стек](#стек)
- [Структура проекта](#структура-проекта)
- [Запуск](#запуск)
- [Переменные окружения](#переменные-окружения)
- [Роли пользователей](#роли-пользователей)
- [Архитектура](#архитектура)
- [База данных](#база-данных)
- [Тесты](#тесты)
- [Отчёт (LaTeX)](#отчёт-latex)

---

## Стек

| | |
|---|---|
| **Next.js 16** (App Router) | Fullstack-фреймворк, Server Components, Server Actions |
| **React 19** + **TypeScript** | UI, строгая типизация |
| **Supabase** | PostgreSQL, Auth (email/password), Storage |
| **Tailwind CSS v4** + **shadcn/ui** | Стили и UI-компоненты |
| **Zod** + **react-hook-form** | Валидация форм |
| **Vitest** + **Playwright** | Unit и E2E тесты |
| **Vercel** | Деплой |

---

## Структура проекта

```
Web_CP_2026/
├── web/            — Next.js приложение
└── latex/          — LaTeX-исходники отчёта
```

```
web/
├── app/
│   ├── (app)/              — protected routes (требуют авторизации)
│   │   ├── meetings/       — каталог встреч + запись
│   │   ├── clubs/          — управление клубами и встречами
│   │   ├── organizer/      — панель организатора
│   │   ├── admin/          — панель администратора
│   │   └── profile/        — профиль пользователя
│   ├── (auth)/             — публичные роуты
│   │   ├── login/
│   │   └── register/
│   └── api/
│       └── meetings/[id]/export/  — CSV-выгрузка участников
├── components/
│   ├── meetings/           — карточки, фильтры, кнопка записи
│   ├── clubs/              — формы клубов и встреч
│   ├── organizer/          — панель, фильтр, прогресс-бар мест
│   ├── profile/            — редактор профиля
│   ├── admin/              — кнопки блокировки/скрытия
│   └── ui/                 — shadcn-компоненты
├── lib/
│   ├── services/           — весь доступ к Supabase (слой логики)
│   ├── validators/         — Zod-схемы
│   ├── utils/              — csv.ts, formatters.ts
│   ├── types.ts            — доменные типы
│   └── logger.ts           — логирование
└── supabase/
    └── migrations/         — SQL-миграции (001–007)
```

---

## Запуск

```bash
cd web
npm install
npm run dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000).

---

## Переменные окружения

Создать файл `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Оба значения берутся из настроек проекта в Supabase Dashboard → Project Settings → API.

---

## Роли пользователей

В БД хранятся только две роли: `member` и `admin`.

| Роль | Как получить | Что может |
|------|-------------|-----------|
| **member** | Регистрация | Смотреть клубы и встречи, записываться на встречи, вести профиль |
| **Организатор** | Создал хотя бы один клуб | Всё выше + CRUD своих клубов и встреч, выгрузка участников в CSV |
| **admin** | Вручную через БД (`profiles.role = 'admin'`) | Всё выше + блокировка пользователей, скрытие клубов |

Организатор — не роль в базе, а статус: `clubs.owner_id = auth.uid()`.

---

## Архитектура

**Слои:**
```
Компоненты  →  Server Actions / API Routes  →  lib/services/  →  Supabase
```

Компоненты никогда не обращаются к Supabase напрямую. Весь доступ к данным — через `lib/services/`.

**Мутации** — только Server Actions. Исключение: CSV-выгрузка через Route Handler (`GET /api/meetings/[id]/export`).

**Безопасность** — RLS на уровне БД. Middleware занимается только редиректами.

**Ошибки** из сервисов возвращаются в виде:
```ts
{ data: T; error: null } | { data: null; error: string }
```

**Счётчик мест** (`seats_taken`) хранится денормализованно в таблице `meetings` и обновляется триггером. Причина: RLS на `registrations` скрывает чужие записи, поэтому обычный `COUNT(*)` возвращал бы 0.

---

## База данных

### Таблицы

```
profiles       — профили пользователей (name, bio, cefr_level, role, is_active)
clubs          — языковые клубы (owner_id, name, description, is_active)
meetings       — встречи (club_id, title, date, location, cefr_level, seats_total, seats_taken)
registrations  — записи на встречи (user_id, meeting_id) UNIQUE
```

### Миграции

| Файл | Что добавляет |
|------|--------------|
| `001_init.sql` | Базовая схема, RLS, триггер создания профиля при регистрации |
| `002_add_is_active.sql` | `is_active` в `profiles` |
| `003_seats_taken.sql` | `seats_taken` в `meetings`, триггер обновления при записи/отмене |
| `004_seats_guard.sql` | BEFORE INSERT триггер — блокирует запись при полном зале |
| `005_admin_profiles_rls.sql` | RLS-политика для администраторов |
| `006_fix_admin_rls_recursion.sql` | SECURITY DEFINER функция `is_admin()` — убирает рекурсию в RLS |
| `007_meeting_description.sql` | Колонка `description` в `meetings` |

### Применить миграции

```bash
supabase db push
# или вручную через Supabase Dashboard → SQL Editor
```

---

## Тесты

```bash
# Unit-тесты (Vitest)
npm run test

# Watch-режим
npm run test:watch

# E2E-тесты (Playwright)
npm run test:e2e
```

---

## Отчёт (LaTeX)

Исходники в `latex/`. Для сборки нужен установленный MiKTeX или TeX Live.

```bash
cd latex && make
```

Готовый PDF: `latex/paper.pdf`.

| Файл | Содержимое |
|------|-----------|
| `intro.tex` | Введение |
| `chapter1.tex` | Аналоги, стек, цель и задачи |
| `chapter2.tex` | Аудитория, функциональность, ER-диаграмма, wireframes |
| `chapter3.tex` | Разработка |
| `conclusion.tex` | Заключение |
| `refs.bib` | Список литературы |
