// ============================================
// middleware.ts (root of project)
// ============================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// CONFIGURATION - Convention-based approach
// ============================================
const AUTH_CONFIG = {
  // Cookie name used by Better Auth
  sessionCookie: 'better-auth.session_token',
  
  // Where to redirect after login
  defaultAuthRedirect: '/dashboard',
  
  // Where to redirect when not authenticated
  signInPage: '/signin',
  
  // ============================================
  // CONVENTION 1: Route prefixes that require auth
  // Any route starting with these prefixes requires authentication
  // ============================================
  protectedPrefixes: [
    // Add specific prefixes if needed, e.g., '/admin'
    // Most routes will use folder naming convention instead
  ],
  
  // ============================================
  // CONVENTION 2: Route prefixes that are always public
  // These override protectedPrefixes if there's overlap
  // ============================================
  publicPrefixes: [
    '/api/public',  // Public API routes
    '/blog',        // Blog pages
    '/docs',        // Documentation
    '/help',        // Help center
    // Add more as needed
  ],
  
  // ============================================
  // Specific public routes (for root-level pages)
  // ============================================
  publicRoutes: [
    '/',
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
  
  // ============================================
  // Auth pages (redirect to dashboard if already logged in)
  // ============================================
  authPages: ['/signin', '/signup', '/forgot-password','reset-password'],
  
  // ============================================
  // CONVENTION 3: File/folder naming conventions
  // Routes matching these patterns are automatically handled
  // ============================================
  conventions: {
    // Any route with (public) in folder name is public
    // Example: app/(public)/marketing/page.tsx → /marketing is public
    publicFolderPattern: /\/\(public\)\//,
    
    // Any route with (auth) or (protected) in folder name requires auth
    // Example: app/(auth)/settings/page.tsx → /settings is protected
    protectedFolderPattern: /\/\((auth|protected)\)\//,
    
    // API routes starting with /api/auth are always allowed (Better Auth needs this)
    authApiPattern: /^\/api\/auth($|\/)/,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a route matches any prefix in the list
 */
function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => 
    pathname === prefix || pathname.startsWith(prefix + '/')
  );
}

/**
 * Check if a route is public based on all rules
 */
function isPublicRoute(pathname: string): boolean {
  const { publicRoutes, publicPrefixes, conventions } = AUTH_CONFIG;
  
  // 1. Always allow Better Auth API routes
  if (conventions.authApiPattern.test(pathname)) {
    return true;
  }
  
  // 2. Check exact public routes
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // 3. Check public prefixes
  if (matchesPrefix(pathname, publicPrefixes)) {
    return true;
  }
  
  // 4. Check folder naming convention (if using Next.js route groups)
  if (conventions.publicFolderPattern.test(pathname)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  const { protectedPrefixes, conventions } = AUTH_CONFIG;
  
  // 1. Check protected prefixes
  if (matchesPrefix(pathname, protectedPrefixes)) {
    return true;
  }
  
  // 2. Check folder naming convention (if using Next.js route groups)
  if (conventions.protectedFolderPattern.test(pathname)) {
    return true;
  }
  
  return false;
}

/**
 * Check if route is an auth page (signin/signup)
 */
function isAuthPage(pathname: string): boolean {
  return AUTH_CONFIG.authPages.includes(pathname);
}

// ============================================
// MIDDLEWARE LOGIC
// ============================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token from cookies
  const sessionToken = request.cookies.get(AUTH_CONFIG.sessionCookie)?.value;
  const isAuthenticated = !!sessionToken;

  // 1. Check if route is explicitly public
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const url = new URL(AUTH_CONFIG.signInPage, request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. Handle auth pages (redirect if already logged in)
  if (isAuthPage(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(AUTH_CONFIG.defaultAuthRedirect, request.url)
      );
    }
    return NextResponse.next();
  }

  // 4. Default: Allow everything else
  // This means new routes don't break - they're accessible by default
  // To protect a route, add it to protectedPrefixes or use folder conventions
  return NextResponse.next();
}

// ============================================
// MATCHER CONFIGURATION
// ============================================
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
};

// ============================================
// USAGE EXAMPLES & DOCUMENTATION
// ============================================
/*

## 🎯 Convention-Based Auth - How It Works

This middleware uses **conventions over configuration**. You don't hardcode routes!

### Method 1: Prefix-Based (Recommended)

Organize your app with clear prefixes:

```
app/
  (marketing)/          → Public (home, about, pricing)
  (auth)/              → Auth pages (signin, signup)
  app/                 → Protected (all /app/* routes)
    dashboard/
    settings/
    projects/
```

**Configuration:**
```typescript
protectedPrefixes: ['/app'],     // Everything under /app/* is protected
publicPrefixes: ['/blog', '/docs'], // Everything under /blog/* and /docs/* is public
```

### Method 2: Folder Naming Convention

Use Next.js route groups with naming conventions:

```
app/
  (public)/
    blog/page.tsx           → /blog (public)
    pricing/page.tsx        → /pricing (public)
  
  (auth)/
    dashboard/page.tsx      → /dashboard (protected)
    settings/page.tsx       → /settings (protected)
```

Routes in `(public)` folders are automatically public.
Routes in `(auth)` or `(protected)` folders are automatically protected.

### Method 3: Mix Both

```typescript
protectedPrefixes: ['/app', '/admin'],
publicPrefixes: ['/blog', '/docs'],
publicRoutes: ['/', '/pricing', '/about'], // Root-level pages
```

## 🚀 Real-World Examples

### SaaS App Structure
```
app/
  page.tsx                 → / (public)
  pricing/page.tsx         → /pricing (public)
  about/page.tsx           → /about (public)
  
  app/                     → /app/* (protected by prefix)
    dashboard/page.tsx     → /app/dashboard
    projects/page.tsx      → /app/projects
    settings/page.tsx      → /app/settings
```

**Config:**
```typescript
protectedPrefixes: ['/app'],
publicRoutes: ['/', '/pricing', '/about'],
```

### Multi-Section App
```
app/
  blog/                    → /blog/* (public by prefix)
  docs/                    → /docs/* (public by prefix)
  dashboard/               → /dashboard/* (protected by prefix)
  admin/                   → /admin/* (protected by prefix)
```

**Config:**
```typescript
protectedPrefixes: ['/dashboard', '/admin'],
publicPrefixes: ['/blog', '/docs'],
```

### Marketing + App Combo
```
app/
  (public)/               → Everything here is public
    page.tsx              → /
    features/page.tsx     → /features
    pricing/page.tsx      → /pricing
  
  (app)/                  → Everything here is protected
    dashboard/page.tsx    → /dashboard
    settings/page.tsx     → /settings
```

**Config:**
```typescript
// No need to list routes! Folder conventions handle it
protectedPrefixes: [],  // Empty, using folder convention
publicPrefixes: [],     // Empty, using folder convention
```

## 🎨 Which Approach Should You Use?

### For Templates (Your Use Case):
**Use prefix-based with `/app` folder:**

```typescript
protectedPrefixes: ['/app'],  // All app routes protected
publicRoutes: ['/', '/pricing', '/about'], // Root pages public
```

**Folder structure:**
```
app/
  page.tsx              → / (public)
  pricing/page.tsx      → /pricing (public)
  signin/page.tsx       → /signin (public)
  
  app/                  → /app/* (all protected)
    dashboard/
    settings/
    [anything-new]/     → Automatically protected!
```

**Benefits:**
- ✅ New routes under /app/* are auto-protected
- ✅ Marketing pages stay public
- ✅ Clear separation
- ✅ No middleware changes needed

### For Large Apps:
**Combine prefixes + folder conventions:**

```typescript
protectedPrefixes: ['/app', '/admin'],
publicPrefixes: ['/blog', '/docs', '/help'],
```

## 🔧 Adding New Routes

### Add a new protected page:
1. Create `app/app/new-feature/page.tsx`
2. Done! It's automatically protected (under `/app` prefix)

### Add a new public page:
1. Create `app/new-public/page.tsx`
2. Add to `publicRoutes: ['/new-public']`
   OR add to `publicPrefixes: ['/new-public']` if it has sub-pages

### Add a new section:
1. Create `app/new-section/...`
2. Add `/new-section` to either `protectedPrefixes` or `publicPrefixes`

## 📝 Migration from Hardcoded Routes

**Before (hardcoded):**
```typescript
protectedRoutes: [
  '/dashboard',
  '/settings',
  '/profile',
  '/admin',
  '/analytics',
  '/billing',
  // ... keeps growing
],
```

**After (convention-based):**
```typescript
protectedPrefixes: ['/app'],  // One line protects everything
```

Just move all those routes under `/app/*` and you're done!

*/