import { createContext } from 'react';

export type ToastVariant = 'default' | 'destructive';

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

export type ToastContextValue = {
  toast: (toast: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
