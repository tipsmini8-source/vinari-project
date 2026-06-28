import {
  BarChart3,
  Brain,
  CreditCard,
  Download,
  Landmark,
  Lightbulb,
  ReceiptText,
  Repeat,
  ShieldCheck,
  Tags,
  Target,
  Users,
  WalletCards
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

const groups: Array<{
  title: string;
  description: string;
  items: Array<{ icon: LucideIcon; title: string; text: string }>;
}> = [
  {
    title: 'Keuangan Harian',
    description: 'Untuk mencatat uang yang masuk dan keluar setiap hari.',
    items: [
      { icon: ReceiptText, title: 'Catatan Uang', text: 'Catat uang masuk, uang keluar, dan pindah saldo dengan cepat.' },
      { icon: WalletCards, title: 'Dompet', text: 'Pantau cash, rekening, dan e-wallet dalam satu tampilan.' },
      { icon: Tags, title: 'Kategori', text: 'Rapikan transaksi dengan kategori yang mudah dipahami.' }
    ]
  },
  {
    title: 'Rencana Keuangan',
    description: 'Bantu uang kamu punya arah yang lebih jelas.',
    items: [
      { icon: BarChart3, title: 'Batas Pengeluaran', text: 'Buat batas uang keluar supaya tidak kebablasan.' },
      { icon: Target, title: 'Target Tabungan', text: 'Pantau progres tujuan seperti liburan, gadget, atau dana darurat.' },
      { icon: Landmark, title: 'Hutang/Cicilan', text: 'Lihat sisa hutang dan catatan pembayaran.' },
      { icon: Repeat, title: 'Transaksi Rutin', text: 'Simpan catatan pengeluaran atau pemasukan yang berulang.' },
      { icon: CreditCard, title: 'Langganan', text: 'Pantau biaya rutin seperti internet, streaming, atau BPJS.' }
    ]
  },
  {
    title: 'Ringkasan & Insight',
    description: 'Lihat kondisi uang tanpa laporan yang rumit.',
    items: [
      { icon: BarChart3, title: 'Ringkasan Bulanan', text: 'Lihat pemasukan, pengeluaran, dan cashflow dalam periode tertentu.' },
      { icon: Brain, title: 'Kondisi Keuangan', text: 'Cek skor sederhana untuk memahami kesehatan finansial.' },
      { icon: Lightbulb, title: 'Insight', text: 'Dapatkan saran berbasis aturan dari data keuanganmu.' },
      { icon: ShieldCheck, title: 'Simulator Keputusan', text: 'Coba dampak keputusan besar sebelum benar-benar dilakukan.' },
      { icon: Download, title: 'Export CSV', text: 'Export transaksi dan laporan sederhana untuk kebutuhan pribadi.' }
    ]
  },
  {
    title: 'Premium & Family',
    description: 'Untuk kebutuhan pribadi yang lebih lengkap dan keluarga kecil.',
    items: [
      { icon: CreditCard, title: 'Upgrade Premium', text: 'Buka fitur tambahan dengan proses upgrade manual.' },
      { icon: CreditCard, title: 'Pembayaran Manual QRIS', text: 'Upload bukti pembayaran lalu tunggu approval admin.' },
      { icon: Users, title: 'Anggota Workspace', text: 'Kelola keuangan bersama pasangan atau keluarga.' },
      { icon: ShieldCheck, title: 'Admin Approval', text: 'Pembayaran premium dicek manual oleh admin Vinari.' }
    ]
  }
];

export function FeaturesPage() {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Fitur Vinari</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            Fitur lengkap untuk uang harian yang lebih rapi.
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Vinari menggabungkan catatan uang, dompet, rencana, ringkasan, dan premium family dalam satu pengalaman yang mudah dipakai.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {groups.map((group) => (
            <section className="rounded-[1.75rem] border border-border bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.07)] dark:bg-card" key={group.title}>
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{group.description}</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map(({ icon: Icon, text, title }) => (
                  <article className="rounded-2xl border border-border bg-[#F8FBFF] p-4 dark:bg-background" key={title}>
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-[1.75rem] bg-[linear-gradient(135deg,#0F172A_0%,#1D4ED8_55%,#06B6D4_100%)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <h2 className="text-2xl font-semibold">Siap mulai mencatat uang dengan lebih mudah?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
            Mulai gratis, lalu upgrade saat kamu butuh fitur tambahan.
          </p>
          <Button asChild className="mt-5 rounded-2xl bg-white text-[#0F172A] hover:bg-white/90">
            <Link to="/register">Mulai Gratis</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
