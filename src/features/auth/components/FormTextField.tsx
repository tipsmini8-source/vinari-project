import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type FormTextFieldProps = {
  error?: FieldError;
  label: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  type?: 'email' | 'password' | 'text';
};

export function FormTextField({
  error,
  label,
  placeholder,
  registration,
  type = 'text'
}: FormTextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={registration.name}>{label}</Label>
      <Input
        aria-invalid={Boolean(error)}
        autoCapitalize="none"
        autoCorrect="off"
        id={registration.name}
        placeholder={placeholder}
        type={type}
        {...registration}
      />
      {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    </div>
  );
}
