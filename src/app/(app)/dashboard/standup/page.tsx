import { constructMetadata } from "@/lib/metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiNotebook } from "react-icons/pi";

export const metadata = constructMetadata({
    title: "Standup",
    description: "Daily standup for remote dev teams and startups.",
});

export default function StandupPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-medium tracking-tight text-canvas-text-contrast">Daily Standups</h1>
                <p className="text-canvas-text mt-2">
                    Share your progress and stay connected with your team.
                </p>
            </div>

            <Card className="border-canvas-border/50 bg-canvas-bg-subtle">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-bg">
                            <PiNotebook className="w-5 h-5 text-primary-solid" />
                        </div>
                        <CardTitle className="text-xl">Feature Coming Soon</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-canvas-text">
                        We're building an amazing daily standup experience for your team. This feature will help you:
                    </p>
                    <ul className="space-y-2 text-canvas-text">
                        <li className="flex gap-3">
                            <span className="text-primary-solid mt-1">•</span>
                            <span>Share what you accomplished today</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-primary-solid mt-1">•</span>
                            <span>Plan your work for tomorrow</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-primary-solid mt-1">•</span>
                            <span>Flag blockers and get help from the team</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-primary-solid mt-1">•</span>
                            <span>Auto-generate weekly sprint digests</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}