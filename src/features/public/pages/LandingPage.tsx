import {
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lightbulb,
  Target,
  Users,
  WalletCards
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

const problems = [
  'Pengeluaran kecil sering lupa dicatat.',
  'Saldo tersebar di cash, rekening, dan e-wallet.',
  'Cicilan dan langganan kadang terlewat.',
  'Target tabungan sulit dipantau.',
  'Laporan keuangan biasanya terlalu ribet.'
];

const solutions = [
  'Catat uang masuk dan keluar dengan cepat.',
  'Pantau semua dompet dalam satu tempat.',
  'Buat batas pengeluaran agar tidak kebablasan.',
  'Pantau target tabungan dan hutang/cicilan.',
  'Lihat ringkasan keuangan yang mudah dimengerti.'
];

const features = [
  {
    icon: ArrowDownCircle,
    title: 'Catat Uang Harian',
    text: 'Catat uang masuk, uang keluar, dan pindah saldo dengan cepat.'
  },
  {
    icon: WalletCards,
    title: 'Dompet',
    text: 'Pantau saldo cash, rekening, dan e-wallet.'
  },
  {
    icon: BarChart3,
    title: 'Batas Pengeluaran',
    text: 'Atur batas uang keluar agar tidak kebablasan.'
  },
  {
    icon: Target,
    title: 'Target Tabungan',
    text: 'Pantau progres tabungan untuk tujuan tertentu.'
  },
  {
    icon: Landmark,
    title: 'Hutang & Cicilan',
    text: 'Lihat sisa hutang dan catatan pembayaran.'
  },
  {
    icon: CreditCard,
    title: 'Ringkasan Keuangan',
    text: 'Pahami kondisi uang kamu tanpa laporan yang rumit.'
  },
  {
    icon: Lightbulb,
    title: 'Insight & Simulator',
    text: 'Dapatkan saran sederhana dan coba simulasi sebelum mengambil keputusan.'
  },
  {
    icon: Users,
    title: 'Family Workspace',
    text: 'Kelola keuangan bersama pasangan atau keluarga.'
  }
];

const plans = [
  {
    name: 'Free',
    price: 'Rp0',
    description: 'Cocok untuk mulai mencatat uang harian.',
    features: ['Catat uang masuk & keluar', 'Dompet dasar', 'Ringkasan sederhana', 'Cocok untuk penggunaan pribadi']
  },
  {
    name: 'Premium Personal',
    price: 'Rp19.000/bulan',
    description: 'Untuk pengguna pribadi yang ingin fitur lebih lengkap.',
    features: ['Semua fitur Free', 'Export data', 'Insight lebih lengkap', 'Simulator keputusan', 'Fitur premium personal']
  },
  {
    name: 'Premium Family',
    price: 'Rp39.000/bulan',
    description: 'Untuk pasangan atau keluarga kecil.',
    features: ['Semua fitur Premium Personal', 'Anggota workspace', 'Kelola keuangan bersama', 'Cocok untuk keluarga']
  }
];

export function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-10 size-80 -translate-x-1/2 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="relative z-10">
            <p className="inline-flex rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
              Tech premium untuk uang harian
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-[#0F172A] dark:text-foreground sm:text-5xl lg:text-6xl">
              Kelola uang harian jadi lebih mudah
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Vinari membantu kamu mencatat uang masuk, uang keluar, dompet, target tabungan, cicilan, dan ringkasan
              keuangan dalam satu aplikasi yang mudah dipahami.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-2xl bg-[linear-gradient(135deg,#1D4ED8_0%,#06B6D4_100%)] px-6 text-white shadow-lg shadow-blue-900/20">
                <Link to="/register">Mulai Gratis</Link>
              </Button>
              <Button asChild className="h-12 rounded-2xl px-6" variant="outline">
                <Link to="/login">Masuk</Link>
              </Button>
            </div>
          </div>

          <AppMockup />
        </div>
      </section>

      <Section
        eyebrow="Masalah sehari-hari"
        title="Sering bingung uang habis ke mana?"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {problems.map((item) => (
            <InfoCard key={item} text={item} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Solusi"
        title="Vinari dibuat untuk uang harian, bukan laporan yang rumit."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {solutions.map((item) => (
            <InfoCard key={item} positive text={item} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Fitur utama" title="Semua yang penting ada dalam satu tempat.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, text, title }) => (
            <article className="rounded-[1.5rem] border border-border bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] dark:bg-card" key={title}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Cara kerja" title="Mulai dalam 3 langkah">
        <div className="grid gap-4 md:grid-cols-3">
          {['Buat akun gratis', 'Catat uang masuk dan uang keluar', 'Lihat saldo, ringkasan, dan kondisi keuangan'].map((item, index) => (
            <article className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm dark:bg-card" key={item}>
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0F172A_0%,#1D4ED8_100%)] font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{item}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Harga" title="Mulai gratis, upgrade saat butuh.">
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-2xl bg-[linear-gradient(135deg,#1D4ED8_0%,#06B6D4_100%)] text-white">
            <Link to="/register">Mulai Gratis</Link>
          </Button>
          <Button asChild className="rounded-2xl" variant="outline">
            <Link to="/pricing">Lihat Harga</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}

function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)] dark:border-border dark:bg-card">
      <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#0F172A_0%,#1D4ED8_55%,#06B6D4_100%)] p-5 text-white shadow-xl">
        <div className="flex justify-between text-sm opacity-90">
          <span>Total Saldo</span>
          <span>Sehat</span>
        </div>
        <p className="mt-2 text-3xl font-semibold">Rp12.450.000</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniAction icon={ArrowDownCircle} label="Masuk" tone="income" />
        <MiniAction icon={ArrowUpCircle} label="Keluar" tone="expense" />
        <MiniAction icon={ArrowRightLeft} label="Pindah" tone="transfer" />
      </div>
      <div className="mt-4 rounded-[1.5rem] border border-border bg-[#F8FBFF] p-4 dark:bg-background">
        <h3 className="font-semibold">Fitur Keuangan</h3>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[WalletCards, BarChart3, Target, Landmark].map((Icon, index) => (
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary" key={index}>
              <Icon className="size-6" />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-[1.5rem] border border-border bg-white p-4 shadow-sm dark:bg-card">
        <h3 className="font-semibold">Bulan Ini</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <span className="text-success">Masuk<br />Rp8,2 jt</span>
          <span className="text-destructive">Keluar<br />Rp5,1 jt</span>
          <span>Sisa<br />Rp3,1 jt</span>
        </div>
      </div>
    </div>
  );
}

function MiniAction({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: 'income' | 'expense' | 'transfer' }) {
  const gradient =
    tone === 'income'
      ? 'linear-gradient(135deg,#16A34A,#22C55E)'
      : tone === 'expense'
        ? 'linear-gradient(135deg,#E11D48,#F43F5E)'
        : 'linear-gradient(135deg,#1D4ED8,#06B6D4)';

  return (
    <div className="rounded-2xl p-3 text-center text-xs font-semibold text-white shadow-sm" style={{ background: gradient }}>
      <Icon className="mx-auto mb-1 size-5" />
      {label}
    </div>
  );
}

function Section({ children, eyebrow, title }: { children: ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function InfoCard({ positive = false, text }: { positive?: boolean; text: string }) {
  return (
    <article className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm dark:bg-card">
      <CheckCircle2 className={positive ? 'size-5 text-success' : 'size-5 text-primary'} />
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}

function PricingCard({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] dark:bg-card">
      <h3 className="font-semibold">{plan.name}</h3>
      <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {plan.features.map((feature) => (
          <li className="flex gap-2" key={feature}>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
