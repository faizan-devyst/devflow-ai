// CSR — renders an interactive client component; auth is enforced in the dashboard layout (SSR).
import SettingsPage from "@/components/settings/settings-page";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Settings",
  description: "Manage your account settings, profile, and security.",
});

export default function Settings() {
  return <SettingsPage />;
}
