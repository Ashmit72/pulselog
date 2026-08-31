"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Divider } from "@/components/ui/divider";
import { Spinner } from "@/components/ui/spinner";
import { GmailIcon } from "@/components/GmailIcon";
import { OutlookIcon } from "@/components/OutlookIcon";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client"; // make sure this is imported

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email.trim().toLowerCase(),
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link");
      } else {
        toast.success("Reset link sent! Check your email.");
        form.reset();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openGmail = () => window.open("https://mail.google.com", "_blank");
  const openOutlook = () => window.open("https://outlook.live.com", "_blank");

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
      <div className="w-100 flex bg-bg">
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <Logo />
          </div>

          <div className="flex gap-2 flex-col">
            <h1 className="heading-5">Reset password</h1>
            <p className="text-fg-secondary text-sm">
              Enter the email address you registered with and we&apos;ll send you
              the reset instructions
            </p>
          </div>

          <Form {...form}>
            <form
              className="flex gap-4 flex-col"
              onSubmit={form.handleSubmit(onSubmit)}
            >
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

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner variant="default" /> : "Send Reset Instructions"}
              </Button>

              <Divider className="my-2.5" />

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
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
