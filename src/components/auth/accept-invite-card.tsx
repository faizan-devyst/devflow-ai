"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PiSpinner, PiWarning, PiEye, PiEyeSlash, PiUsersThree } from "react-icons/pi";

interface InviteContext {
  email: string;
  teamName: string;
  roleLabel: string;
}

const acceptSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AcceptValues = z.infer<typeof acceptSchema>;

export function AcceptInviteCard({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "invalid">("loading");
  const [invite, setInvite] = useState<InviteContext | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptValues>({ resolver: zodResolver(acceptSchema) });

  useEffect(() => {
    apiFetch<InviteContext>(`/api/invitations/token/${token}`)
      .then((data) => {
        setInvite(data);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const onSubmit = async (values: AcceptValues) => {
    setSubmitting(true);
    try {
      await apiFetch(`/api/invitations/token/${token}/accept`, {
        method: "POST",
        body: JSON.stringify({ name: values.name, password: values.password }),
      });
      toast.success("Welcome to the team!", { description: "Your account is ready." });
      // Full navigation so the freshly-set session cookie is picked up.
      window.location.assign("/dashboard");
    } catch {
      toast.error("Could not accept the invitation", {
        description: "The link may be invalid, or you may already have an account.",
      });
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-10">
          <PiSpinner className="size-8 animate-spin text-primary-solid" />
        </CardContent>
      </Card>
    );
  }

  if (status === "invalid" || !invite) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center pt-6 text-center">
          <PiWarning size={40} className="mb-6 text-alert-solid" />
          <CardTitle className="text-2xl">Invitation unavailable</CardTitle>
          <CardDescription className="mt-2">
            This invitation is invalid, has expired, or was already used.
          </CardDescription>
          <Link href="/sign-in" className="mt-8 text-sm font-medium text-primary-text hover:underline">
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-6 flex items-center gap-0.5">
          <span className="text-xl font-semibold text-canvas-text-contrast">DevFlow</span>
          <span className="text-xl font-semibold text-primary-solid">AI</span>
        </Link>
        <CardTitle className="text-2xl">Accept your invitation</CardTitle>
        <CardDescription className="flex flex-wrap items-center justify-center gap-1.5">
          <PiUsersThree className="size-4 text-primary-text" />
          {invite.teamName}
          <Badge variant="secondary">{invite.roleLabel}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={invite.email} disabled readOnly />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" placeholder="Jane Doe" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-xs text-alert-text">{errors.name.message}</p>}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-text transition-colors hover:text-canvas-text-contrast"
              >
                {showPassword ? <PiEyeSlash size={18} /> : <PiEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-alert-text">{errors.password.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-alert-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? (
              <>
                <PiSpinner className="mr-2 size-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              "Accept & continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
