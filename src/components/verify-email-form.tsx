"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/title";
import { OutlookIcon } from "@/components/OutlookIcon";
import { GmailIcon } from "@/components/GmailIcon";
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import Logo from "@/components/Logo";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [verificationEnabled, setVerificationEnabled] = useState(true);

  // Redirect if no email param
  useEffect(() => {
    if (!emailFromUrl) {
      router.replace("/signup");
    }
  }, [emailFromUrl, router]);

  // Auto-check email verification
  useEffect(() => {
    const checkVerification = async () => {
      if (!verificationEnabled || !emailFromUrl) return;

      setChecking(true);
      try {
        const session = await authClient.getSession();
        if (session?.data?.user?.emailVerified) {
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to check verification";
        if (message.includes("Verification email isn't enabled")) {
          setVerificationEnabled(false);
        } else {
          setError(message);
        }
      } finally {
        setChecking(false);
      }
    };

    checkVerification();
  }, [router, verificationEnabled, emailFromUrl]);

  // Resend verification email
  const handleResend = async () => {
    if (!verificationEnabled || !emailFromUrl) return;

    setResending(true);
    setError("");

    try {
      const res = await authClient.sendVerificationEmail({
        email: emailFromUrl.trim(),
        callbackURL: "/dashboard",
      });

      if (res.error) {
        setError(res.error.message ?? "Failed to resend email");
        return;
      }

      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      setError("Failed to resend email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const openGmail = () => window.open("https://mail.google.com", "_blank");
  const openOutlook = () => window.open("https://outlook.live.com", "_blank");

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
      <div className="w-100 flex bg-bg">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex gap-2.5 items-center text-fg">
            <Logo />
            <Title />
          </div>

          <div className="flex gap-2 flex-col">
            <h1 className="heading-5">Verify your email</h1>
            <p className="text-fg-secondary text-sm">
              We just sent an email to{" "}
              <span className="text-fg font-medium">{emailFromUrl}</span>. Click the link in the email to verify your account.
            </p>
          </div>

          {/* Status Messages */}
          {checking && verificationEnabled && (
            <div className="flex items-center gap-2 text-sm text-fg-secondary -mt-4">
              <Spinner className="w-4 h-4" />
              <span>Checking verification status...</span>
            </div>
          )}

          {resent && verificationEnabled && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm -mt-4">
              ✓ Verification email sent!
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm -mt-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={handleResend}
              disabled={resending || resent || !verificationEnabled}
            >
              {resending
                ? <Spinner />
                : resent
                ? "Email sent!"
                : "Resend email"}
            </Button>
          </div>

          <Divider />

          <div className="flex gap-3">
            <Button
              variant="outline"
              color="neutral"
              className="w-full text-fg-secondary"
              onClick={openGmail}
            >
              <GmailIcon />
              Open Gmail
            </Button>
            <Button
              variant="outline"
              color="neutral"
              className="w-full text-fg-secondary"
              onClick={openOutlook}
            >
              <OutlookIcon />
              Open Outlook
            </Button>
          </div>

          <p className="text-xs text-fg-secondary text-center -mt-4">
            {verificationEnabled
              ? "The verification link expires in 24 hours."
              : "Email verification is currently disabled."}
          </p>
        </div>
      </div>
    </div>
  );
}
