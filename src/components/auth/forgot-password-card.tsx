"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { requestPasswordReset } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PiCheckCircle, PiSpinner } from "react-icons/pi";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema as any),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    setSubmittedEmail(values.email);
    try {
      await requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      }, {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success("Reset link sent!", {
            description: "Please check your inbox for the password reset link.",
          });
        },
        onError: (ctx: any) => {
          toast.error("Request failed", {
            description: ctx.error.message || "Something went wrong.",
          });
        }
      });
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center pt-6">
          <PiCheckCircle size={40} className="text-success-solid mb-6" />
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription className="mt-2">
            We sent a reset link to <span className="text-canvas-text-contrast font-medium">{submittedEmail}</span>
          </CardDescription>
          <Link
            href="/sign-in"
            className="mt-8 text-primary-text font-medium hover:underline text-sm"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto flex items-center gap-0.5 mb-6">
          <span className="text-canvas-text-contrast font-semibold text-xl">DevFlow</span>
          <span className="text-primary-solid font-semibold text-xl">AI</span>
        </Link>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">


          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-alert-text">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <PiSpinner className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-none bg-transparent">
        <Link href="/sign-in" className="text-canvas-text text-sm hover:text-canvas-text-contrast transition-colors">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
