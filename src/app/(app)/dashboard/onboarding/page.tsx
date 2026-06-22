import { constructMetadata } from "@/lib/metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PiUserPlus } from "react-icons/pi";

export const metadata = constructMetadata({
    title: "Onboarding",
    description: "Onboarding for new joiners in dev teams",
});

export default function OnboardingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-medium tracking-tight text-canvas-text-contrast">Codebase Onboarding</h1>
                <p className="text-canvas-text mt-2">
                    Get new team members up to speed quickly with AI-powered onboarding.
                </p>
            </div>

            <Card className="border-canvas-border/50 bg-canvas-bg-subtle">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary-bg">
                            <PiUserPlus className="w-5 h-5 text-secondary-solid" />
                        </div>
                        <CardTitle className="text-xl">Feature Coming Soon</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-canvas-text">
                        We're building an intelligent onboarding agent that will transform how your team gets familiar with codebases.
                    </p>
                    <ul className="space-y-2 text-canvas-text">
                        <li className="flex gap-3">
                            <span className="text-secondary-solid mt-1">•</span>
                            <span>Connect GitHub repositories</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-secondary-solid mt-1">•</span>
                            <span>Auto-generate interactive onboarding docs</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-secondary-solid mt-1">•</span>
                            <span>AI-powered codebase Q&A chat</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-secondary-solid mt-1">•</span>
                            <span>Understand architecture and patterns instantly</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}