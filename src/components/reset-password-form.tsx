"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheck, EyeIcon, EyeOffIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input, InputWrapper } from "@/components/ui/input";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

// Password validation schema
const FormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const passwordSchema = z
  .string()
  .min(8, { message: "At least 8 characters" })
  .regex(/\d/, { message: "At least one number" })
  .regex(/[a-z]/, { message: "At least one lowercase letter" })
  .regex(/[A-Z]/, { message: "At least one uppercase letter" });

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  // Mounted state to avoid blank screen due to client routing
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Redirect if token is missing
  useEffect(() => {
    if (mounted && !token) {
      router.replace("/forgot-password");
    }
  }, [mounted, token, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };
  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = form.watch("password");

  const validation = useMemo(() => passwordSchema.safeParse(password), [password]);

  const errors = useMemo(() => {
    if (validation.success) return [];
    return validation.error.issues.map((e) => e.message);
  }, [validation]);

  const progress = useMemo(() => {
    const totalChecks = 4;
    const passedChecks = totalChecks - errors.length;
    return (passedChecks / totalChecks) * 100;
  }, [errors]);

  const isValid = (message: string) => !errors.includes(message);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!token) return;
    setIsLoading(true);

    try {
      const res = await authClient.resetPassword({
        token,
        newPassword: data.password,
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully!");
      router.push("/signin");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering until mounted and token is available
  if (!mounted || !token) return null;

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
      <div className="w-100 flex bg-bg">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <Logo />
            </div>
            <div className="flex gap-2 flex-col">
              <h1 className="heading-5">Change Your Password</h1>
              <p className="text-fg-secondary text-sm">
                Enter a new password below to change your password.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-4 flex-col">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <InputWrapper>
                          <Input
                            {...field}
                            ref={inputRef}
                            className="peer"
                            type={showPassword ? "text" : "password"}
                          />
                          <IconComponent
                            className="hover:text-fg cursor-pointer"
                            onMouseDown={togglePasswordVisibility}
                          />
                        </InputWrapper>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Re-enter new password</FormLabel>
                      <div className="flex flex-col gap-4">
                        <FormControl>
                          <InputWrapper>
                            <Input
                              {...field}
                              ref={inputRef}
                              className="peer"
                              type={showPassword ? "text" : "password"}
                            />
                            <IconComponent
                              className="hover:text-fg cursor-pointer"
                              onMouseDown={togglePasswordVisibility}
                            />
                          </InputWrapper>
                        </FormControl>
                        <div className="body-13 flex w-full flex-col gap-1.5">
                          <Progress value={progress} />
                          <p className="text-sm font-semibold">Your Password must contain</p>
                          {[
                            "At least 8 characters",
                            "At least one number",
                            "At least one lowercase letter",
                            "At least one uppercase letter",
                          ].map((label) => (
                            <p key={label} className="text-fg-tertiary flex items-center gap-2">
                              <CircleCheck
                                className={`size-4 ${isValid(label) ? "text-success-text" : ""}`}
                              />
                              {label}
                            </p>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner variant="default" /> : "Reset password"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}