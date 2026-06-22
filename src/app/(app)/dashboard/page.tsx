import { DashboardContent } from "@/components/pages/dashboard/dashboard-content"
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Dashboard",
  description: "Manage and Navigate through the app feature here.",
});

export default function DashboardPage() {
  return <DashboardContent />
}
