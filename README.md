# DealFeed 🚀

Community-driven platform for finding and sharing the best deals in Poland (zł). Built with React, TypeScript, and Supabase.

![DealFeed Screenshot](https://api.dicebear.com/7.x/shapes/svg?seed=dealfeed)

## ✨ Features

- **RBAC (Role-Based Access Control)**:
  - `user`: Post your own deals, upvote, and comment.
  - `moderator`: Help manage the community by editing/deleting any content.
  - `super_admin`: Full system access.
- **Authentication**:
  - Secure Email/Password login & signup.
  - Google OAuth integration.
  - Password reset flow.
- **Real-time Deals**:
  - Live temperature system (upvotes/downvotes).
  - Advanced filtering by category and search.
  - Image uploads and saved deals.
- **Premium UI**:
  - Modern Dark/Light mode support.
  - Responsive design for mobile and desktop.
  - Micro-animations and rich aesthetics.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite.
- **Styling**: Tailwind CSS, Lucide Icons.
- **Backend / Auth**: Supabase (PostgreSQL, GoTrue, RLS).
- **State Management**: React Context & Hooks.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Thinkincode22/Dealfeed.git
cd Dealfeed
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Execute the following SQL scripts in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rbac_schema.sql`

### 5. Run the application
```bash
npm run dev
```

## 🔒 Security

All data access is secured via **Supabase Row Level Security (RLS)**. Even if someone has the API keys, they can only perform actions allowed by their role on the database level.

## 🛡 License

MIT licensed. Feel free to use and contribute!
