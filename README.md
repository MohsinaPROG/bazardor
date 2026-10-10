# 🛒 বাজার দর (BazarDor)

> বাংলাদেশের নিত্যপ্রয়োজনীয় পণ্যের আজকের দাম এক নজরে — চাল, ডাল, তেল, সবজি, মাছ, মাংস ও ডিমের বাজারভিত্তিক দাম, সর্বনিম্ন-সর্বাধিক-গড় এবং দামের পরিবর্তন।

**Live:** _(deploy করার পর লিংক এখানে দিন)_
**Repository:** _(GitHub লিংক এখানে দিন)_

---

## ✨ Features

1. **লাইভ প্রাইস টিকার** — নেভবারের নিচে অবিরাম স্ক্রল করা পণ্যের দাম ও ▲/▼ পরিবর্তন (হোভারে থেমে যায়)।
2. **আজ দাম বেড়েছে / কমেছে সেকশন** — সর্বোচ্চ ৬টি পণ্য করে দামের বৃদ্ধি ও হ্রাস অনুযায়ী সাজানো।
3. **বিভাগভিত্তিক পণ্য তালিকা ও সাজানো** — বিভাগ পেজে ডিফল্ট / কম থেকে বেশি / বেশি থেকে কম দাম অনুযায়ী সাজানো (বাংলা সংখ্যা সঠিকভাবে সংখ্যামানে তুলনা হয়)।
4. **বাজারভিত্তিক বিস্তারিত পেজ** — প্রতিটি পণ্যের সর্বনিম্ন, সর্বাধিক, গড় দাম এবং বিভিন্ন বাজারের তুলনামূলক টেবিল।
5. **ইমেইল/পাসওয়ার্ড + Google/GitHub লগইন** — Better Auth দিয়ে সাইন ইন, সাইন আপ, প্রোফাইল ও নাম আপডেট; প্রোটেক্টেড রুটে টোস্টসহ রিডাইরেক্ট।
6. **সম্পূর্ণ রেসপনসিভ** — মোবাইল, ট্যাবলেট ও ডেস্কটপে কাজ করে; গ্রিড ও নেভবার স্ক্রিন অনুযায়ী বদলায়।
7. **স্কেলেটন লোডিং ও ফ্রেন্ডলি 404** — ডেটা লোড হওয়ার সময় স্কেলেটন, ভুল পৃষ্ঠায় বাংলায় 404 বার্তা।

## 🧰 Technologies Used

| Technology | Purpose |
| --- | --- |
| [Next.js 15](https://nextjs.org) (App Router) | UI, routing, server components |
| [React 19](https://react.dev) + TypeScript | Components and type safety |
| [Tailwind CSS v4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) | Styling and responsive design |
| [Better Auth](https://better-auth.com) | Email/password, Google & GitHub login, user update |
| SQLite (dev) / PostgreSQL (prod) | Auth database |
| [react-hot-toast](https://react-hot-toast.com) | Toast notifications |
| Hind Siliguri (Google Fonts) | Bangla typography |

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. Create env file
cp .env.example .env.local
# edit BETTER_AUTH_SECRET (openssl rand -base64 32)

# 3. Create the auth tables (SQLite by default)
npm run auth:migrate

# 4. Run
npm run dev
```

Open <http://localhost:3000>.

### Social login (optional)

- **Google:** Google Cloud Console → OAuth client → Redirect URI `http://localhost:3000/api/auth/callback/google`
- **GitHub:** Developer settings → OAuth App → Callback URL `http://localhost:3000/api/auth/callback/github`

Put the client ID / secret in `.env.local`. For production, use your deployed domain in the callback URLs and set `BETTER_AUTH_URL`.

## 🗄️ Database

- **Local:** leave `DATABASE_URL` empty — a SQLite file is created at `data/auth.db`.
- **Deployment:** serverless hosts do not keep local files, so set `DATABASE_URL` to a Postgres URL (e.g. [Neon](https://neon.tech)) and run `npm run auth:migrate` once against it.

## 📡 Product API

The app reads from the assignment API:

- `GET /products`, `GET /products?category=chal`, `GET /products/:id`
- `GET /categories`, `GET /categories/:slug`

If the API cannot be reached, the app falls back to built-in sample data and shows a warning, so the site keeps working.

## 📁 Project Structure

```
src/
├── app/                 # routes (App Router)
│   ├── page.tsx         # home: hero, risers/fallers, all products
│   ├── category/[slug]  # category list + sort + skeleton
│   ├── product/[slug]   # protected product detail
│   ├── signin/ signup/  # auth pages
│   ├── profile/         # profile + update (C3)
│   └── api/auth/        # Better Auth handler
├── components/          # navbar, ticker, cards, forms, footer…
├── lib/                 # auth config, API client, formatting, fallback data
└── middleware.ts        # protects /product/* and /profile/*
```

## 🌐 Deployment

Works on Vercel, Netlify, or Cloudflare Pages.

1. Push the repo to GitHub.
2. Import it in your host and add the env vars from `.env.example` (use `DATABASE_URL` for Postgres).
3. Set `BETTER_AUTH_URL` to the live URL and add the same domain to the Google/GitHub OAuth callback URLs.
4. Run `npm run auth:migrate` against the production database once.

## ✅ Notes

- Email verification and password reset are intentionally not included (per the brief).
- Bangla digits are parsed to numbers for sorting; prices are formatted in Bangla.
