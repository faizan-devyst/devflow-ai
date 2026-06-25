"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { PiSpinner } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createStandup, updateStandup } from "@/store/slices/standupSlice";
import type { StandupWithAuthor } from "@/types";

const formSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  yesterday: z.string().trim().min(1, "Tell the team what you did"),
  today: z.string().trim().min(1, "Tell the team what's planned"),
  blockers: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StandupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  mode: "create" | "edit";
  standup?: StandupWithAuthor | null;
}

export function StandupFormDialog({
  open,
  onOpenChange,
  teamId,
  mode,
  standup,
}: StandupFormDialogProps) {
  const dispatch = useAppDispatch();
  const saving = useAppSelector((state) => state.standups.saving);
  const isEdit = mode === "edit";

  // Computed once on mount; the parent remounts this component per open.
  const defaultValues: FormValues = {
    date: standup
      ? new Date(standup.date).toISOString().slice(0, 10)
      : format(new Date(), "yyyy-MM-dd"),
    yesterday: standup?.yesterday ?? "",
    today: standup?.today ?? "",
    blockers: standup?.blockers ?? "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues });

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && standup) {
        await dispatch(
          updateStandup({
            id: standup.id,
            yesterday: values.yesterday,
            today: values.today,
            blockers: values.blockers?.trim() ? values.blockers : null,
          })
        ).unwrap();
        toast.success("Standup updated");
      } else {
        await dispatch(
          createStandup({
            teamId,
            date: values.date,
            yesterday: values.yesterday,
            today: values.today,
            blockers: values.blockers?.trim() ? values.blockers : undefined,
          })
        ).unwrap();
        toast.success("Standup posted");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit standup" : "New standup"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your standup for this day." : "Share your progress with the team."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="standup-date">Date</Label>
            <Input id="standup-date" type="date" disabled={isEdit} {...register("date")} />
            {errors.date && <p className="text-xs text-alert-text">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="standup-yesterday">Yesterday</Label>
            <Textarea
              id="standup-yesterday"
              placeholder="What did you get done?"
              {...register("yesterday")}
            />
            {errors.yesterday && (
              <p className="text-xs text-alert-text">{errors.yesterday.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="standup-today">Today</Label>
            <Textarea
              id="standup-today"
              placeholder="What are you working on?"
              {...register("today")}
            />
            {errors.today && <p className="text-xs text-alert-text">{errors.today.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="standup-blockers">
              Blockers <span className="text-canvas-text">(optional)</span>
            </Label>
            <Textarea
              id="standup-blockers"
              placeholder="Anything in your way?"
              {...register("blockers")}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <PiSpinner className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Post standup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
