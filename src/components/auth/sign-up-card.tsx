"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUp, signIn } from "@/lib/auth-client";
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
import { PiGoogleLogo, PiEye, PiEyeSlash, PiSpinner, PiWarning, PiEnvelope, PiArrowRight } from "react-icons/pi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getPasswordStrength } from "@/lib/password-strength";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema as any),
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  const onSubmit = async (values: SignUpValues) => {
    setIsLoading(true);
    try {
      await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/dashboard/settings",
      }, {
        onSuccess: () => {
          setVerificationEmail(values.email);
          setVerificationPending(true);
          toast.success("Account created!", {
            description: "Please check your email to verify your account.",
          });
        },
        onError: (ctx) => {
          toast.error("Registration failed", {
            description: ctx.error.message || "Something went wrong. Please try again.",
          });
        }
      });
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
        <CardTitle className="text-2xl">
          {verificationPending ? "Check your email" : "Create your account"}
        </CardTitle>
        <CardDescription>
          Start your free DevFlow AI workspace
        </CardDescription>
      </CardHeader>

      {verificationPending ? (
        <CardContent className="grid gap-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-solid/20 rounded-full blur-lg" />
              <div className="relative bg-primary-bg rounded-full p-4">
                <PiEnvelope size={32} className="text-primary-solid" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-canvas-text">
              We sent a verification email to:
            </p>
            <p className="text-sm font-medium text-canvas-text-contrast">
              {verificationEmail}
            </p>
          </div>

          <div className="bg-primary-bg border border-primary-border/50 rounded-lg p-4 text-sm text-canvas-text space-y-2">
            <p className="font-medium text-canvas-text-contrast">What's next?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Click the link in your email to verify</li>
              <li>Sign In to Start using DevFlow AI</li>
            </ul>
          </div>

          <div className="pt-4">
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="w-full"
              >
                Go to sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleSignUp}
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
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-alert-text">{errors.name.message}</p>
                )}
              </div>

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
                <Label htmlFor="password">Password</Label>
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
                    <p className={cn(
                      "text-[10px] font-medium uppercase tracking-wider",
                      strength === 1 ? "text-alert-text" :
                        strength === 2 ? "text-warning-text" :
                          strength === 3 ? "text-primary-text" :
                            strength === 4 ? "text-success-text" :
                              "text-canvas-text"
                    )}>
                      {strength === 1 && "Weak"}
                      {strength === 2 && "Fair"}
                      {strength === 3 && "Good"}
                      {strength === 4 && "Strong"}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-alert-text">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pr-10"
                    aria-invalid={!!errors.confirmPassword}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-text hover:text-canvas-text-contrast transition-colors"
                  >
                    {showConfirmPassword ? <PiEyeSlash size={18} /> : <PiEye size={18} />}
                  </button>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <PiArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-none bg-transparent">
            <p className="text-sm text-canvas-text">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary-text font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
