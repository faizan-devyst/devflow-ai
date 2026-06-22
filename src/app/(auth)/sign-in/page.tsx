import { constructMetadata } from "@/lib/metadata";
import { SignInCard } from "@/components/auth/sign-in-card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata = constructMetadata({
  title: "Sign In",
  description: "Sign in to your DevFlow AI account.",
});

export default async function SignInPage() {

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 flex items-center justify-center">
      <SignInCard />
    </div>
  );
}
