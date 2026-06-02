# Языковые клубы

Курсовой проект по дисциплине «Разработка веб-приложений».  
Московский Политех, группа 241-3211, Стальмахов Иван Сергеевич.

Веб-платформа для поиска языковых клубов и записи на разговорные встречи.

---

## Стек

- **Next.js 15** (App Router) + **TypeScript**
- **Supabase** — PostgreSQL, Auth, Storage
- **Tailwind CSS** + **shadcn/ui**
- **Zod** + **react-hook-form**
- **Vitest** + **Playwright**
- Деплой на **Vercel**

## Структура

```
Web_CP_2026/
├── web/        — Next.js приложение
└── latex/      — LaTeX-исходники отчёта
```

## Запуск

```bash
cd web
npm install
npm run dev
```

Нужен `.env.local` с ключами Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Команды

```bash
npm run dev        # дев-сервер
npm run build      # продакшн-сборка
npm run test       # unit-тесты (Vitest)
npm run test:e2e   # e2e-тесты (Playwright)
```

## Роли

| Роль | Что может |
|------|-----------|
| member | Просматривать клубы, записываться на встречи |
| Организатор | Создавать клубы и встречи, выгружать участников в CSV |
| admin | Модерировать пользователей и клубы |

Организатор — не роль в БД, а статус: тот, кто создал клуб.

## Отчёт

```bash
cd latex && make
```
