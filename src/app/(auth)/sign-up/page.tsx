import { constructMetadata } from "@/lib/metadata";
import { SignUpCard } from "@/components/auth/sign-up-card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Sign Up",
  description: "Create your DevFlow AI account.",
});

export default async function SignUpPage() {

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 flex items-center justify-center">
      <SignUpCard />
    </div>
  );
}
