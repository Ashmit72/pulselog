// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   EMAIL SENDER WITH PROPER ERROR HANDLING
========================= */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Log in development
  // console.log(`📧 Attempting to send: ${subject} -> ${to}`);

  if (!process.env.RESEND_API_KEY) {
    // console.log(`⚠️ DEV MODE (no RESEND_API_KEY):\n${html}`);
    return;
  }

  try {
    const result = await resend.emails.send({
      from: `RadianOS <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    // console.log("✅ Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error; // Re-throw so Better Auth knows it failed
  }
}

/* =========================
   AUTH CONFIG
========================= */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  /* ---------- Email & Password ---------- */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    
    sendResetPassword: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
      // console.log("🔐 Sending password reset to:", user.email);
      await sendEmail({
        to: user.email,
        subject: "Reset your password - RadianOS",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>You requested to reset your password. Click the button below:</p>
            <a href="${url}" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy this link: <br><code>${url}</code></p>
            <p style="color: #666; font-size: 12px;">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
    },
  },

  /* ---------- Email Verification ---------- */
  emailVerification: {
    enabled: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      // console.log("📨 Sending verification email:", {
      //   to: user.email,
      //   token: token.substring(0, 10) + "...",
      //   url,
      // });

      await sendEmail({
        to: user.email,
        subject: "Verify your email - RadianOS",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Welcome to RadianOS! Click the button below to verify your email:</p>
            <a href="${url}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Verify Email
            </a>
            <p>Or copy this link: <br><code>${url}</code></p>
            <p style="color: #666; font-size: 12px;">This link expires in 5 minutes.</p>
          </div>
        `,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  /* ---------- Social Providers ---------- */
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/github`,
    },
  },

  /* ---------- Magic Link ---------- */
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
      // console.log("🔗 Sending magic link to:", email);
      await sendEmail({
        to: email,
        subject: "Sign in to RadianOS",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Sign In</h2>
            <p>Click the button below to sign in to your account:</p>
            <a href="${url}" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Sign In
            </a>
            <p>Or copy this link: <br><code>${url}</code></p>
          </div>
        `,
      });
    },
  },

  /* ---------- Session ---------- */
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Session = typeof auth.$Infer.Session;