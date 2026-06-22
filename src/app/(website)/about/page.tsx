import { constructMetadata } from "@/lib/metadata";
import AboutClient from "./about-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";


export const metadata = constructMetadata({
  title: "About",
  description: "Built for developers, by developers. Open source and free forever.",
});

export default async function AboutPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
    if (session) {
      redirect("/dashboard");
    }
  return <AboutClient />;
}
