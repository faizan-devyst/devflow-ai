"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PiSpinner, PiWarning, PiEye, PiEyeSlash } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/password-strength";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema as any),
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error("Invalid link", {
        description: "Your reset link is invalid or expired.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        newPassword: values.password,
        token,
      }, {
        onSuccess: () => {
          toast.success("Password updated!", {
            description: "You can now sign in with your new password.",
          });
          router.push("/sign-in");
        },
        onError: (ctx) => {
          toast.error("Update failed", {
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

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center pt-6">
          <PiWarning size={40} className="text-alert-solid mb-6" />
          <CardTitle className="text-2xl">Invalid Link</CardTitle>
          <CardDescription className="mt-2">
            This reset link is invalid or has expired.
          </CardDescription>
          <Link
            href="/forgot-password"
            className="mt-8 text-primary-text font-medium hover:underline text-sm"
          >
            Request a new link
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
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">


          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-text hover:text-canvas-text-contrast transition-colors"
              >
                {showPassword ? <PiEyeSlash size={18} /> : <PiEye size={18} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        i <= strength
                          ? strength === 1
                            ? "bg-alert-solid"
                            : strength === 2
                            ? "bg-warning-solid"
                            : strength === 3
                            ? "bg-primary-solid"
                            : "bg-success-solid"
                          : "bg-canvas-border/50"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-alert-text">{errors.password.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-alert-text">{errors.confirmPassword.message}</p>
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
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ResetPasswordCard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <PiSpinner className="h-8 w-8 animate-spin text-primary-solid" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
