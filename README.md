# Pursuit

A job application tracker and networking CRM. Track every job you apply to, the people you know at each company, and when to follow up.

Built with React, Vite, Tailwind CSS, and Supabase.

## Getting it running on your Mac

You only do steps 1 to 4 once.

### 1. Install Node.js

Download the LTS version from [nodejs.org](https://nodejs.org) and run the installer. To check it worked, open **Terminal** and run:

```
node -v
```

You should see a version number like `v22.x.x`.

### 2. Create your Supabase project

1. Sign up at [supabase.com](https://supabase.com) (the free plan is plenty).
2. Click **New project**, name it `pursuit`, set a database password (save it somewhere), and pick the US East region.
3. Wait a minute or two for it to finish setting up.

### 3. Create the database tables

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project, copy everything, paste it in, and click **Run**.
4. Open **Table Editor**. You should see `applications`, `contacts`, `application_contacts`, and `interactions`.

### 4. Connect the app to Supabase

1. In this project folder, duplicate `.env.example` and rename the copy to `.env`.
   (Files starting with a dot are hidden in Finder. Press **Cmd + Shift + .** to show them.)
2. In Supabase, go to **Project Settings > API Keys**. Copy the **publishable** key into `.env`.
3. Go to **Project Settings > Data API** and copy the **Project URL** into `.env`.

### 5. Start the app

In Terminal, go to the project folder and run:

```
npm install
npm run dev
```

Open the link it prints (usually http://localhost:5173). Create an account, confirm your email, and log in.

Next time you only need `npm run dev`.

## How the code is organized

```
src/
  main.jsx               Starts React
  App.jsx                The map of URLs to pages
  index.css              Colors and fonts (design tokens)
  lib/supabase.js        Connection to the database
  context/AuthContext.jsx  Who is logged in, shared with every page
  components/            Pieces used on many pages (layout, empty states)
  pages/                 One file per screen
supabase/
  schema.sql             The database tables and security rules
```

## How data stays private

Every table uses Supabase **Row Level Security**. Each row stores the `user_id` of the person who created it, and the database itself refuses to show or change rows that belong to anyone else. Even if someone found the publishable key, they could only ever see their own data.

## Roadmap

- [x] Step 1: Project setup, login, database, app layout
- [x] Step 2: Applications kanban board (add, edit, drag between stages) and visual refresh
- [ ] Step 3: Contacts CRM and linking contacts to applications
- [ ] Step 4: Today view with follow-ups and stats
- [ ] Step 5: Deploy to Vercel and add to madisonhueston.com
