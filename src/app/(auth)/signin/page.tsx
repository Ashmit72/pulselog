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

import Image from "next/image";
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
    email: z.string(),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.email.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Email is required",
        path: ["email"],
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      ctx.addIssue({
        code: "custom",
        message: "Please enter a valid email address",
        path: ["email"],
      });
      return;
    }

    if (!data.password.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required",
        path: ["password"],
      });
    }
  });

/* =========================
   PAGE
========================= */
export default function SignInPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (res.error) {
        form.setError("email", {
          message: res.error.message ?? "Invalid email or password",
        });
        return;
      }

      router.push("/dashboard");
    } catch {
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-elevation-negative px-5">
      <div className="w-90 lg:w-200 flex rounded-2xl border border-border bg-bg">
        <div className="flex-1 py-8 px-6 lg:px-7 flex flex-col gap-8">
          <Logo />

          <div className="flex gap-2 flex-col">
            <h1 className="heading-5">Sign In</h1>
            <p className="text-fg-secondary text-sm">
              Don&apos;t have an account?{" "}
              <Button variant="link" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {form.formState.errors.root && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}

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
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Button variant="link" asChild>
                        <Link href="/forgot-password">
                          Forgot Password?
                        </Link>
                      </Button>
                    </div>

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
                {isLoading ? <Spinner /> : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="flex flex-col gap-6">
            <div className="flex gap-1.5 items-center">
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
                variant="outline"
                color="neutral"
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

        <div className="w-100 hidden lg:block">
          <Image
            className="h-full w-full rounded-r-2xl"
            src="/signin-01/bg.png"
            alt="Background Image"
            width={400}
            height={400}
            priority
          />
        </div>
      </div>
    </div>
  );
}
