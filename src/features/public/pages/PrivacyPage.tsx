import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';

const sections = [
  {
    title: 'Data yang disimpan',
    text: 'Vinari menyimpan data akun, workspace, dompet, transaksi, kategori, target, hutang/cicilan, dan pembayaran premium agar fitur aplikasi bisa berjalan.'
  },
  {
    title: 'Penggunaan data',
    text: 'Data digunakan untuk menjalankan fitur seperti dashboard, laporan, budget, goal, debt, premium, dan pengaturan workspace.'
  },
  {
    title: 'Data tidak dijual',
    text: 'Vinari tidak menjual data pengguna ke pihak lain.'
  },
  {
    title: 'Keamanan akun',
    text: 'User bertanggung jawab menjaga keamanan email, password, dan akses akun.'
  },
  {
    title: 'Bukan lembaga keuangan',
    text: 'Vinari bukan bank, e-wallet, atau lembaga keuangan. Vinari tidak menyimpan uang asli user.'
  }
];

export function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Kebijakan Privasi Vinari"
      description="Kami memakai bahasa sederhana agar kamu mudah memahami bagaimana data dipakai di Vinari."
    >
      {sections.map((section) => (
        <article className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card" key={section.title}>
          <h2 className="font-semibold">{section.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.text}</p>
        </article>
      ))}
      <article className="rounded-2xl border border-border bg-primary-soft p-5 text-primary">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Kontak support</h2>
            <p className="mt-2 text-sm leading-7">
              Untuk pertanyaan privasi, hubungi{' '}
              <a className="font-medium underline underline-offset-4" href="mailto:support@vinari.app">
                support@vinari.app
              </a>
              .
            </p>
          </div>
        </div>
      </article>
    </LegalPage>
  );
}

function LegalPage({
  children,
  description,
  eyebrow,
  title
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base leading-8 text-muted-foreground">{description}</p>
        <div className="mt-8 grid gap-4">{children}</div>
      </section>
    </main>
  );
}
