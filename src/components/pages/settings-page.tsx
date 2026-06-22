"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession, signOut } from "@/lib/auth-client";
import { markSigningOut } from "@/components/providers/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PiUser,
  PiLockKey,
  PiPlugs,
  PiWarning,
  PiGoogleLogo,
  PiCaretRight,
  PiSignOut,
  PiTrash,
  PiSpinner,
  PiEye,
  PiEyeSlash,
} from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPasswordStrength } from "@/lib/password-strength";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } as const },
};

// ─── Settings Page Client Component ───────────────────────────────────────────

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const user = session?.user;

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordValue = passwordForm.watch("newPassword", "");
  const strength = getPasswordStrength(passwordValue);

  const onUpdateProfile = async (values: z.infer<typeof profileSchema>) => {
    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/update-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      if (res.ok) {
        toast.success("Password updated successfully");
        passwordForm.reset();
      } else {
        const error = await res.text();
        toast.error(error || "Failed to update password");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeletingAccount(true);
    try {
      toast.info("Account deletion is not yet fully implemented");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PiSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile, security, and account preferences.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Profile */}
        <motion.div variants={itemVariants} className="w-full">
          <Card className="h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <PiUser className="text-primary" size={20} />
                <h2 className="font-semibold">Profile</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-semibold text-lg flex items-center justify-center border shrink-0">
                  {initials}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-4">
                        Edit profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="pb-0">
                      <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label>Name</label>
                          <Input {...profileForm.register("name")} />
                          {profileForm.formState.errors.name && (
                            <p className="text-xs text-destructive">
                              {profileForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isUpdatingProfile}>
                            {isUpdatingProfile && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants} className="w-full">
          <Card className="h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <PiLockKey className="text-primary" size={20} />
                <h2 className="font-semibold">Security</h2>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between py-2 group">
                    <span className="text-sm">Change password</span>
                    <PiCaretRight className="group-hover:text-foreground transition-colors" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="pb-0">
                  <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>Update your account password.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current password</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          {...passwordForm.register("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showCurrentPassword ? <PiEyeSlash size={16} /> : <PiEye size={16} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">New password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          {...passwordForm.register("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showNewPassword ? <PiEyeSlash size={16} /> : <PiEye size={16} />}
                        </button>
                      </div>

                      {passwordValue.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i <= strength
                                  ? strength === 1
                                    ? "bg-destructive"
                                    : strength === 2
                                    ? "bg-yellow-500"
                                    : strength === 3
                                    ? "bg-primary"
                                    : "bg-emerald-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm new password</label>
                      <Input type="password" {...passwordForm.register("confirmPassword")} />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isUpdatingPassword}>
                        {isUpdatingPassword && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                        Update password
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </motion.div>

        {/* Connected Accounts */}
        <motion.div variants={itemVariants} className="w-full">
          <Card className="h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <PiPlugs className="text-primary" size={20} />
                <h2 className="font-semibold">Connected Accounts</h2>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center bg-muted">
                    <PiGoogleLogo size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google</p>
                    <p className="text-xs text-muted-foreground">Sign in with Google</p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="w-full">
          <Card className="h-full border-destructive/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <PiWarning className="text-destructive" size={20} />
                <h2 className="font-semibold text-destructive">Danger Zone</h2>
              </div>

              <Button
                onClick={() => {
                  markSigningOut();
                  signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
                }}
                variant="secondary"
              >
                <PiSignOut size={18} />
                Sign out
              </Button>

              <Separator className="my-3" />

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <PiTrash size={18} />
                    Delete account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-destructive">Delete your account</DialogTitle>
                    <DialogDescription>
                      This action is permanent and cannot be undone. All your data will be deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm">
                      Please type <span className="font-bold">DELETE</span> to confirm.
                    </p>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmation !== "DELETE" || isDeletingAccount}
                      onClick={handleDeleteAccount}
                    >
                      {isDeletingAccount && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
                      Delete account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}