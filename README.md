# 🔐 Next.js Auth Template

Production-ready authentication starter with Better Auth, OAuth providers, and email verification. Built with Next.js 15, Radix UI, and Drizzle ORM.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

## ✨ Features

<div align="center">

| 🔐 Authentication | 👤 User Management | 📧 Email System |
|-------------------|-------------------|-----------------|
| OAuth (Google, GitHub) | Profile with avatars | Email verification |
| Email/Password | Secure sessions | Magic link login |
| Session management | Multiple auth providers | Password reset |

</div>

### What's Included

✅ **Multiple sign-in methods** - Email/password, Google OAuth, GitHub OAuth  
✅ **Email verification** - Powered by Nodemailer<br>
✅ **Session management** - Token-based with device tracking  
✅ **Password reset flow** - Secure token-based reset  
✅ **Profile management** - Update name, email, profile picture  
✅ **Type-safe** - Full TypeScript + Drizzle ORM  
✅ **Modern UI** - Radix UI components + Tailwind CSS  
✅ **Production-ready** - Error handling, validation, security best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) for free)
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/Radian-os/radian-auth-template.git
   cd radian-auth-template
   pnpm install
```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   
   # Better Auth
   BETTER_AUTH_SECRET="run: openssl rand -base64 32"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # GitHub OAuth (optional)
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # SMTP (for emails with Nodemailer)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-smtp-username"
   SMTP_PASS="your-smtp-password"
   EMAIL_FROM="noreply@example.com"
```

3. **Run database migrations**
```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:push
   pnpm db:studio
```

4. **Start the development server**
```bash
   pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
```
   http://localhost:3000/api/auth/callback/google
```
7. Copy **Client ID** and **Client Secret** to `.env.local`

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Generate a **Client Secret**
6. Copy **Client ID** and **Client Secret** to `.env.local`

### Nodemailer SMTP Setup

1. Get SMTP credentials from your email provider
2. Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` to `.env.local`
3. Use `SMTP_SECURE="true"` for port `465`; use `SMTP_SECURE="false"` for ports like `587`
4. Make sure `EMAIL_FROM` is allowed by your SMTP provider

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Authentication**: [Better Auth](https://better-auth.com)
- **Database**: [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Email**: [Nodemailer](https://nodemailer.com)
- **Deployment**: [Vercel](https://vercel.com)

## 📊 Database Schema

<details>
<summary>View ER Diagram</summary>

![Preview](public/er.png)


### Table Overview

- **USER** - Core user profiles (email, name, profile picture)
- **SESSION** - Active login sessions with device tracking
- **ACCOUNT** - OAuth connections (Google, GitHub) + password storage
- **VERIFICATION** - Temporary tokens for email verification, magic links, password resets

</details>


**Important:** 
- Update OAuth redirect URIs in Google/GitHub to your production URL
- Use a different `NEXT_PUBLIC_APP_URL` for production

## 🔒 Security Features

✅ **Password hashing** - Bcrypt with proper salting  
✅ **CSRF protection** - Built into Better Auth  
✅ **Session tokens** - Secure, revocable tokens instead of JWT  
✅ **Email verification** - Required before full access  
✅ **Rate limiting** - Built-in protection against brute force  
✅ **Secure cookies** - HttpOnly, Secure, SameSite flags

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this template for your projects!

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) for the authentication library
- [Radix UI](https://www.radix-ui.com) for accessible components
- [shadcn/ui](https://ui.shadcn.com) for component inspiration

---
