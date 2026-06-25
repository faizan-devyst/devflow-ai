"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PiNotebook, PiUserPlus, PiGear } from "react-icons/pi"

export function DashboardContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-canvas-text-contrast">Dashboard</h1>
        <p className="text-canvas-text mt-2">
          Welcome back! Here's an overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/standup">
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between group-hover:text-primary-solid    transition-colors">
              <CardTitle >Standups</CardTitle>
              <PiNotebook className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">Daily Updates</div>
              <p className="text-sm text-canvas-text mt-1">
                Share what you're working on today.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/onboarding">
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between group-hover:text-primary-solid transition-colors">
              <CardTitle>Onboarding</CardTitle>
              <PiUserPlus className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">New Members</div>
              <p className="text-sm text-canvas-text mt-1">
                Guide your team through the process.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settings">
          <Card className="group">
            <CardHeader className="flex flex-row items-center justify-between group-hover:text-primary-solid transition-colors">
              <CardTitle>Settings</CardTitle>
              <PiGear className="size-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-medium">Account</div>
              <p className="text-sm text-canvas-text mt-1">
                Manage your profile and preferences.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
