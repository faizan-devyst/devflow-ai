import SettingsPage from "@/components/pages/settings-page";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Settings",
  description: "Manage your account settings, profile, and security.",
});

export default function Settings() {
  return <SettingsPage />;
}