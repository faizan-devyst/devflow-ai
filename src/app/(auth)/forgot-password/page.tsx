import { constructMetadata } from "@/lib/metadata";
import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Forgot Password",
  description: "Reset your DevFlow AI account password.",
});

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 flex items-center justify-center">
      <ForgotPasswordCard />
    </div>
  )
};