"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input, InputWrapper } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { GoogleIcon } from "@/components/GoogleIcon";
import { GithubIcon } from "@/components/GithubIcon";
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Logo from "@/components/Logo";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

/* =========================
   VALIDATION
========================= */
const FormSchema = z
  .object({
    firstName: z.string(),
    email: z.string(),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.firstName.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "First name is required",
        path: ["firstName"],
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid email address",
        path: ["email"],
      });
    }

    if (data.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters long",
        path: ["password"],
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        path: ["password"],
      });
    }
  });

/* =========================
   PAGE
========================= */
export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const res = await authClient.signUp.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        name: data.firstName,
        callbackURL:'/signin'
      });

      if (res.error) {
        form.setError("email", {
          message: res.error.message ?? "Signup failed",
        });
        return;
      }

      // If user needs to verify email
      if (res.data?.user && !res.data.user.emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }

      // Already verified or email verification disabled
      router.push("/dashboard");
    } catch (err) {
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
      <div className="w-100 flex bg-bg border border-border rounded-2xl py-8 px-6">
        <div className="flex-1 flex flex-col gap-8">
          <Logo />

          <div className="flex gap-2 flex-col">
            <h1 className="heading-5">Sign Up</h1>
            <p className="text-fg-secondary text-sm">
              Already have an account?{" "}
              <Button variant="link" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input size="36" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input size="36" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <InputWrapper>
                        <Input
                          {...field}
                          ref={inputRef}
                          type={showPassword ? "text" : "password"}
                        />
                        <IconComponent
                          className="cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setShowPassword((p) => !p);
                          }}
                        />
                      </InputWrapper>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Create account"}
              </Button>

              <p className="text-fg-secondary text-[13px]">
                By signing up, you agree to Radian&apos;s{" "}
                <Link href="/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </Form>

          <div className="flex flex-col gap-6">
            <div className="flex gap-2 items-center">
              <Divider className="flex-1" />
              <span className="text-fg-secondary text-sm font-medium">
                Or continue with
              </span>
              <Divider className="flex-1" />
            </div>

            <div className="flex gap-3">
              <Button
                color="neutral"
                variant="outline"
                className="w-full"
                onClick={() =>
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  })
                }
              >
                <GoogleIcon />
                Google
              </Button>

              <Button
                color="neutral"
                variant="outline"
                className="w-full"
                onClick={() =>
                  authClient.signIn.social({
                    provider: "github",
                    callbackURL: "/dashboard",
                  })
                }
              >
                <GithubIcon />
                Github
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
