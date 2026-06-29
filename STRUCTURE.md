# DealFeed — Структура проєкту

## Tech Stack

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| React | ^19.2.0 | UI-фреймворк |
| TypeScript | ~5.9.3 | Строга типізація |
| Vite | ^7.2.4 | Збірник |
| Tailwind CSS | ^3.4.17 | Стилі |
| Supabase JS | ^2.95.2 | БД + авторизація |
| Vitest | ^4.1.9 | Тести |

## Scripts

| Команда | Опис |
|---------|------|
| `npm run dev` | Запуск dev-сервера (localhost:5173) |
| `npm run build` | Продакшн-збірка |
| `npm run preview` | Попередній перегляд збірки |
| `npm run lint` | Перевірка ESLint |
| `npm run test` | Запуск тестів |
| `npm run test:watch` | Тести в watch-режимі |
| `npm run type-check` | Перевірка TypeScript |

---

## Дерево файлів

```
calm-meadow/
│
├── src/                          # Основний код додатку
│   ├── main.tsx                  # Точка входу React
│   ├── App.tsx                   # Кореневий компонент (роутинг)
│   ├── index.css                 # Глобальні стилі (Tailwind)
│   │
│   ├── components/               # UI-компоненти
│   │   ├── AuthModal.tsx         #   Модалка логіну/реєстрації
│   │   ├── CommentsSection.tsx   #   Секція коментарів до поста
│   │   ├── CreateDealForm.tsx    #   Форма створення поста
│   │   ├── DealCard.tsx          #   Картка поста в стрічці
│   │   ├── DealCard.test.tsx     #   Тест DealCard
│   │   ├── DealList.tsx          #   Список постів
│   │   ├── ErrorBoundary.tsx     #   Обробка помилок React
│   │   ├── Header.tsx            #   Шапка сайту
│   │   ├── NotificationDropdown.tsx # Сповіщення
│   │   ├── Sidebar.tsx           #   Бічна панель (категорії)
│   │   └── VoteButtons.tsx       #   Кнопки голосування (+/-)
│   │
│   ├── pages/                    # Сторінки
│   │   ├── HomePage.tsx          #   Головна (стрічка постів)
│   │   ├── DealPage.tsx          #   Сторінка одного поста
│   │   ├── AdminPage.tsx         #   Адмін-панель (модерація)
│   │   └── ProfilePage.tsx       #   Профіль користувача
│   │
│   ├── contexts/                 # React Context (стан)
│   │   ├── AuthContext.tsx        #   Авторизація (login/logout/signup)
│   │   ├── ThemeContext.tsx       #   Темна/світла тема
│   │   ├── SearchContext.tsx      #   Пошук постів
│   │   └── NotificationContext.tsx #  Сповіщення
│   │
│   ├── hooks/                    # Кастомні хуки
│   │   ├── useDeals.ts           #   Завантаження постів з Supabase
│   │   ├── useFilteredDeals.ts   #   Фільтрація постів
│   │   └── useUserRole.ts        #   Отримання ролі користувача
│   │
│   ├── lib/                      # утиліти
│   │   ├── supabase.ts           #   Supabase-клієнт (+ mock mode)
│   │   ├── sanitize.ts           #   Очищення HTML (XSS)
│   │   └── utils.ts              #   Допоміжні функції
│   │
│   ├── types/                    # TypeScript-типи
│   │   ├── deal.ts               #   Тип Deal (фронтенд)
│   │   ├── user.ts               #   Тип UserProfile
│   │   ├── database.ts           #   Типи рядків БД + мапери
│   │   └── database.test.ts      #   Тест маперів
│   │
│   ├── data/                     # Мок-дані (для offline/demo)
│   │   ├── mockDeals.ts          #   5 тестових постів
│   │   └── mockUser.ts           #   Тестовий користувач
│   │
│   ├── constants/                # Константи
│   │   └── categories.ts         #   Список категорій
│   │
│   ├── test/                     # Тестові налаштування
│   │   └── setup.ts              #   Vitest setup
│   │
│   └── assets/                   # Статичні файли
│       └── react.svg
│
├── supabase/                     # Налаштування Supabase
│   └── migrations/               # SQL-міграції (БД)
│       ├── 001_initial_schema.sql           # ❌ Застарілий — НЕ запускати
│       ├── 002_rbac_schema.sql              # Таблиці, RLS, тригери, ролі
│       ├── 003_indexes_and_constraints.sql  # Індекси, обмеження, повнотекстовий пошук
│       ├── 004_deal_status_and_constraints.sql # Статуси постів (pending/approved/rejected)
│       └── 005_secure_role_update.sql       # Безпечна зміна ролей (RPC)
│
├── public/                       # Публічні файли
│   └── vite.svg
│
├── .agents/                      # AI-skills (Supabase)
│   └── skills/
│       ├── supabase/             # Supabase agent skill
│       └── supabase-postgres-best-practices/ # PostgreSQL best practices
│
├── .env.local                    # 🔑 Ключі Supabase (не комітити!)
├── .env.example                  # Шаблон змінних оточення
├── .gitignore
│
├── package.json                  # Залежності та скрипти
├── package-lock.json
├── vite.config.ts                # Конфігурація Vite
├── vitest.config.ts              # Конфігурація Vitest
├── tsconfig.json                 # TypeScript (кореневий)
├── tsconfig.app.json             # TypeScript (додаток)
├── tsconfig.node.json            # TypeScript (Node/Vite)
├── tailwind.config.js            # Конфігурація Tailwind
├── postcss.config.js             # PostCSS
├── eslint.config.js              # ESLint
├── index.html                    # HTML-шаблон
└── README.md
```

---

## Архітектура даних

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React App  │────▶│  Supabase    │────▶│  PostgreSQL     │
│  (Vite)     │     │  API         │     │  + RLS          │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                    │
       │              ┌─────┴──────┐
       │              │  GoTrue    │
       │              │  Auth      │
       │              └────────────┘
       │
  ┌────┴─────┐
  │ Mock     │  (якщо немає ключів)
  │ Mode     │
  └──────────┘
```

## Таблиці БД

| Таблиця | Опис |
|---------|------|
| `profiles` | Профілі користувачів (роль, username, avatar) |
| `deals` | Пости/пропозиції |
| `comments` | Коментарі до постів |
| `votes` | Голоси (+/-) |
| `saved_deals` | Збережені пости |
| `deal_images` | Зображення до постів |

## Ролі

| Роль | Можливості |
|------|------------|
| `user` | Створювати пости, голосувати, коментувати |
| `moderator` | Редагувати/видаляти будь-які пости |
| `super_admin` | Повний доступ + зміна ролей |

## Потік створення поста

```
Користувач → CreateDealForm → Supabase API → deals (status: 'pending')
                                                    ↓
                                              Модератор/Адмін
                                              схвалює → 'approved'
                                                    ↓
                                              З'являється в стрічці
```
