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
✅ **Email verification** - Powered by Resend  
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
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   pnpm install
```

2. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   
   # Better Auth
   BETTER_AUTH_SECRET="run: openssl rand -base64 32"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # GitHub OAuth (optional)
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   
   # Resend (for emails)
   RESEND_API_KEY="your-resend-api-key"
```

3. **Run database migrations**
```bash
   pnpm db:push
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

### Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add it to `.env.local`
4. (Optional) Verify your domain for production emails

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Authentication**: [Better Auth](https://better-auth.com)
- **Database**: [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Email**: [Resend](https://resend.com)
- **Deployment**: [Vercel](https://vercel.com)

## 📊 Database Schema

<details>
<summary>View ER Diagram</summary>
```mermaid
erDiagram
    USER ||--o{ SESSION : "has many"
    USER ||--o{ ACCOUNT : "has many"
    USER }o..o{ VERIFICATION : "verifies via identifier"

    USER {
        text id PK
        text email UK "unique"
        text name
        text image "profile pic"
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }

    SESSION {
        text id PK
        text user_id FK "CASCADE delete"
        text token UK "unique session token"
        timestamp expires_at "when session expires"
        text ip_address "optional tracking"
        text user_agent "browser info"
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNT {
        text id PK
        text user_id FK "CASCADE delete"
        text provider_id "google/github/credential"
        text account_id "ID from provider"
        text access_token "OAuth token"
        text refresh_token "OAuth refresh"
        text id_token "OpenID token"
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope "OAuth permissions"
        text password "for email/pass auth"
        timestamp created_at
        timestamp updated_at
    }

    VERIFICATION {
        text id PK
        text identifier "email/phone"
        text value "verification code/token"
        timestamp expires_at "token expiry"
        timestamp created_at
        timestamp updated_at
    }
```

### Table Overview

- **USER** - Core user profiles (email, name, profile picture)
- **SESSION** - Active login sessions with device tracking
- **ACCOUNT** - OAuth connections (Google, GitHub) + password storage
- **VERIFICATION** - Temporary tokens for email verification, magic links, password resets

</details>

## 📁 Project Structure
```
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   ├── (dashboard)/         # Protected routes
│   │   ├── dashboard/
│   │   └── profile/
│   ├── api/
│   │   └── auth/[...all]/   # Better Auth API routes
│   └── layout.tsx
├── components/
│   ├── ui/                  # Radix UI components
│   └── auth/                # Auth-specific components
├── lib/
│   ├── auth.ts              # Better Auth configuration
│   ├── db.ts                # Database connection
│   └── schema.ts            # Drizzle schema
└── drizzle.config.ts
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - Update `BETTER_AUTH_URL` to your production URL
   - Add all OAuth credentials
   - Add `RESEND_API_KEY`
   - Add `DATABASE_URL`
4. Deploy!

### Environment Variables for Production
```env
DATABASE_URL="your-production-db-url"
BETTER_AUTH_SECRET="generate-new-secret-for-production"
BETTER_AUTH_URL="https://your-domain.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
RESEND_API_KEY="..."
```

**Important:** 
- Update OAuth redirect URIs in Google/GitHub to your production URL
- Use a different `BETTER_AUTH_SECRET` for production

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

Built with ❤️ by [Your Name](https://github.com/YOUR_USERNAME)

**Need help?** [Open an issue](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues)
