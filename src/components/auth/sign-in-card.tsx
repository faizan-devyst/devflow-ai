"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "@/lib/auth-client";
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
import { PiGoogleLogo, PiEye, PiEyeSlash, PiSpinner } from "react-icons/pi";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema as any),
  });

  const onSubmit = async (values: SignInValues) => {
    setIsLoading(true);
    try {
      await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard/settings",
      }, {
        onSuccess: () => {
          toast.success("Welcome back!", {
            description: "You have successfully signed in.",
          });
        },
        onError: (ctx) => {
          const message = ctx.error.message || "Something went wrong. Please try again.";
          
          if (message.includes("email") || message.includes("verify")) {
            toast.error("Verification Required", {
              description: "Please verify your email before signing in. Check your inbox for a verification link.",
            });
          } else {
            toast.error("Sign in failed", {
              description: message,
            });
          }
        }
      });
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard/settings",
      });
    } catch (err) {
      toast.error("Google sign in failed", {
        description: "Could not connect to Google. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto flex items-center gap-0.5 mb-6">
          <span className="text-canvas-text-contrast font-semibold text-xl">DevFlow</span>
          <span className="text-primary-solid font-semibold text-xl">AI</span>
        </Link>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={handleGoogleSignIn}
        >
          <PiGoogleLogo className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-4 w-full">
          <span className="h-px w-full bg-canvas-border/50" />
          <span className="text-xs text-canvas-text uppercase tracking-wider">or</span>
          <span className="h-px w-full bg-canvas-border/50" />
        </div>

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

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-primary-text text-sm hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
            {errors.password && (
              <p className="text-xs text-alert-text">{errors.password.message}</p>
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-none bg-transparent">
        <p className="text-sm text-canvas-text">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary-text font-medium hover:underline">
            Signup
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
