import { constructMetadata } from "@/lib/metadata";
import { ResetPasswordCard } from "@/components/auth/reset-password-card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Reset Password",
  description: "Set a new password for your DevFlow AI account.",
});

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 flex items-center justify-center">
      <ResetPasswordCard />
    </div>
  );
}
