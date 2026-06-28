import { cn } from '@shared/lib/utils';

export type SectionStatusTabOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SectionStatusTabsProps<TValue extends string> = {
  options: Array<SectionStatusTabOption<TValue>>;
  onChange: (value: TValue) => void;
  value: TValue;
};

export function SectionStatusTabs<TValue extends string>({
  onChange,
  options,
  value
}: SectionStatusTabsProps<TValue>) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted/70 p-1 text-xs font-semibold shadow-inner sm:inline-grid sm:min-w-72">
      {options.map((option) => (
        <button
          className={cn(
            'h-10 rounded-xl px-3 transition-all',
            option.value === value
              ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
