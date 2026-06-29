import type { ReactNode } from 'react';

import type { ResultDetail, SimulationStatus } from '@features/decision-simulator/types/decision-simulator.types';
import { cn } from '@shared/lib/utils';

const statusClassName: Record<SimulationStatus, string> = {
  Aman: 'border-success/20 bg-success/10 text-success',
  Berisiko: 'border-destructive/20 bg-destructive/10 text-destructive',
  'Masih Bisa': 'border-primary/20 bg-primary/10 text-primary',
  'Perlu Dipikir Lagi': 'border-warning/30 bg-warning/15 text-warning'
};

const statusMessage: Record<SimulationStatus, string> = {
  Aman: 'Keputusan ini masih aman untuk kondisi keuanganmu.',
  Berisiko: 'Keputusan ini bisa membuat keuangan terlalu berat.',
  'Masih Bisa': 'Keputusan ini masih bisa dijalankan, tapi tetap perlu dijaga.',
  'Perlu Dipikir Lagi': 'Keputusan ini cukup berdampak. Pertimbangkan ulang atau ubah nominalnya.'
};

export function SimulationResultCard({
  children,
  details,
  recommendation,
  status,
  title
}: {
  children: ReactNode;
  details: ResultDetail[];
  recommendation: string;
  status: SimulationStatus;
  title: string;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Langkah 3</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-normal">{status}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {statusMessage[status]} Keputusan: <span className="font-semibold text-foreground">{title}</span>.
          </p>
        </div>
        <span className={cn('w-fit rounded-full border px-3 py-1 text-sm font-semibold', statusClassName[status])}>
          {status}
        </span>
      </div>

      <div className="mt-5 rounded-3xl bg-muted/45 p-4 text-sm leading-6 text-muted-foreground">
        <span className="font-semibold text-foreground">Alasannya, </span>
        {recommendation}
      </div>

      <div className="mt-5">
        <h3 className="font-semibold">Angka Penting</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>

      <details className="mt-5 rounded-3xl border border-border bg-background/60 p-4">
        <summary className="cursor-pointer select-none font-semibold">Lihat detail hitungan</summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {details.map((detail) => (
            <div className="rounded-2xl bg-muted/40 p-3" key={detail.label}>
              <p className="text-xs text-muted-foreground">{detail.label}</p>
              <p className="mt-1 font-semibold">{detail.value}</p>
            </div>
          ))}
        </div>
      </details>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Simulasi ini hanya perkiraan dan tidak mengubah catatan asli.
      </p>
    </section>
  );
}

export function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-background/60 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-tight">{value}</p>
    </div>
  );
}
