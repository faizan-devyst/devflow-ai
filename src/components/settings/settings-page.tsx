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
import { Label } from "@/components/ui/label";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, updatePassword } from "@/store/slices/profileSlice";

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
  const dispatch = useAppDispatch();
  const { updatingProfile, updatingPassword } = useAppSelector((state) => state.profile);

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
    try {
      await dispatch(updateProfile(values)).unwrap();
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const onUpdatePassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      await dispatch(
        updatePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();
      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
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
        <PiSpinner className="w-8 h-8 animate-spin text-primary-text" />
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-canvas-text-contrast">Account Settings</h1>
        <p className="text-canvas-text text-sm mt-1">
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
                <PiUser className="text-primary-text" size={20} />
                <h2 className="font-semibold text-canvas-text-contrast">Profile</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-14 h-14 rounded-full bg-primary-bg-subtle text-primary-text font-semibold text-lg flex items-center justify-center border border-canvas-border/50 shrink-0">
                  {initials}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="font-semibold text-canvas-text-contrast">{user?.name}</p>
                  <p className="text-sm text-canvas-text">{user?.email}</p>

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
                          <Label htmlFor="profile-name">Name</Label>
                          <Input id="profile-name" {...profileForm.register("name")} />
                          {profileForm.formState.errors.name && (
                            <p className="text-xs text-alert-text">
                              {profileForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={updatingProfile}>
                            {updatingProfile && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
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
                <PiLockKey className="text-primary-text" size={20} />
                <h2 className="font-semibold text-canvas-text-contrast">Security</h2>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between py-2 group">
                    <span className="text-sm">Change password</span>
                    <PiCaretRight className="group-hover:text-canvas-text-contrast transition-colors" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="pb-0">
                  <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>Update your account password.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          {...passwordForm.register("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-text"
                        >
                          {showCurrentPassword ? <PiEyeSlash size={16} /> : <PiEye size={16} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-alert-text">{passwordForm.formState.errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          {...passwordForm.register("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-canvas-text"
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
                                    ? "bg-alert-solid"
                                    : strength === 2
                                    ? "bg-warning-solid"
                                    : strength === 3
                                    ? "bg-primary-solid"
                                    : "bg-success-solid"
                                  : "bg-canvas-bg"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-alert-text">{passwordForm.formState.errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input id="confirm-password" type="password" {...passwordForm.register("confirmPassword")} />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-alert-text">{passwordForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={updatingPassword}>
                        {updatingPassword && <PiSpinner className="mr-2 h-4 w-4 animate-spin" />}
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
                <PiPlugs className="text-primary-text" size={20} />
                <h2 className="font-semibold text-canvas-text-contrast">Connected Accounts</h2>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-canvas-border/50 flex items-center justify-center bg-canvas-bg">
                    <PiGoogleLogo size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-canvas-text-contrast">Google</p>
                    <p className="text-xs text-canvas-text">Sign in with Google</p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="w-full">
          <Card className="h-full border-alert-border/50">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <PiWarning className="text-alert-text" size={20} />
                <h2 className="font-semibold text-alert-text">Danger Zone</h2>
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
                    <DialogTitle className="text-alert-text">Delete your account</DialogTitle>
                    <DialogDescription>
                      This action is permanent and cannot be undone. All your data will be deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-canvas-text">
                      Please type <span className="font-bold text-canvas-text-contrast">DELETE</span> to confirm.
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
