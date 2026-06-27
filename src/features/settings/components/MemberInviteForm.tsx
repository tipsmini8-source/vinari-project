import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { memberInviteSchema } from '@features/settings/schemas/settings.schemas';
import type { MemberInviteSubmitInput } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70';

export function MemberInviteForm({
  disabled,
  isSubmitting,
  onSubmit
}: {
  disabled?: boolean;
  isSubmitting: boolean;
  onSubmit: (input: MemberInviteSubmitInput) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<MemberInviteSubmitInput>({
    resolver: zodResolver(memberInviteSchema),
    defaultValues: {
      email: '',
      role: 'member'
    }
  });

  const submit = async (input: MemberInviteSubmitInput) => {
    await onSubmit(input);
    reset({
      email: '',
      role: 'member'
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div className="space-y-2">
          <Label htmlFor="memberEmail">Email anggota</Label>
          <Input
            disabled={disabled || isSubmitting}
            id="memberEmail"
            placeholder="nama@email.com"
            type="email"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="memberRole">Role</Label>
          <select className={selectClassName} disabled={disabled || isSubmitting} id="memberRole" {...register('role')}>
            <option value="partner">Partner</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
        </div>
      </div>

      <Button disabled={disabled || isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Kirim Undangan
      </Button>
    </form>
  );
}
