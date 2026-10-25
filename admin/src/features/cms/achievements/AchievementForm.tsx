import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { useIsDirty, useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import type { CmsAchievement } from "./types";
import { createAchievementPayloadSchema, updateAchievementPayloadSchema, type CreateAchievementPayloadInput, type UpdateAchievementPayloadInput } from "./schema";
import { createAchievement, updateAchievement } from "./api";

export interface AchievementFormProps {
  achievement: CmsAchievement | null;
  onCancel: () => void;
  onSaved: (achievement: CmsAchievement) => void;
}

export function AchievementForm({ achievement, onCancel, onSaved }: AchievementFormProps) {
  const isEdit = achievement !== null;
  const schema = isEdit ? updateAchievementPayloadSchema : createAchievementPayloadSchema;
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<CreateAchievementPayloadInput | UpdateAchievementPayloadInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      value: achievement?.value ?? "",
      label: { fa: achievement?.label?.fa ?? "", en: achievement?.label?.en ?? "" },
      icon: achievement?.icon ?? "",
    },
  });

  const { isConfirmOpen, guardedAction, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  const onSubmit = async (data: any) => {
    try {
      if (isEdit && achievement) {
        const res = await updateAchievement(achievement.id, data);
        onSaved(res);
      } else {
        const res = await createAchievement(data as CreateAchievementPayloadInput);
        onSaved(res);
      }
      reset();
    } catch (e: any) {
      // error handled by caller / page
    }
  };

  return (
    <form dir="rtl" onSubmit={handleSubmit(guardedAction(onSubmit))} className="space-y-4">
      <div>
        <label htmlFor="value" className="block text-sm font-medium">مقدار</label>
        <input id="value" {...register("value")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        {errors.value && <span className="text-red-600 text-xs">{String(errors.value.message)}</span>}
      </div>
      <div>
        <label htmlFor="label.fa" className="block text-sm font-medium">برچسب (فارسی)</label>
        <input id="label.fa" {...register("label.fa")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
        {errors.label && (errors.label as any).fa && <span className="text-red-600 text-xs">{String((errors.label as any).fa.message)}</span>}
      </div>
      <div>
        <label htmlFor="label.en" className="block text-sm font-medium">برچسب (انگلیسی)</label>
        <input id="label.en" {...register("label.en")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="icon" className="block text-sm font-medium">آیکون</label>
        <input id="icon" {...register("icon")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-white">ذخیره</button>
        <button type="button" onClick={onCancel} className="rounded-md bg-gray-200 px-4 py-2">لغو</button>
      </div>
      <UnsavedChangesDialog open={isConfirmOpen} onConfirm={confirmLeave} onCancel={cancelLeave} />
    </form>
  );
}
