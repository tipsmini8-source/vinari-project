import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

import { useAuth } from '@features/auth';
import { Button } from '@shared/ui/button';

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
    highlighted: true,
    features: ['Semua fitur Free', 'Export data', 'Insight lebih lengkap', 'Simulator keputusan', 'Fitur premium personal']
  },
  {
    name: 'Premium Family',
    price: 'Rp39.000/bulan',
    description: 'Untuk pasangan atau keluarga kecil.',
    features: ['Semua fitur Premium Personal', 'Anggota workspace', 'Kelola keuangan bersama', 'Cocok untuk keluarga']
  }
];

const faqs = [
  {
    question: 'Apakah Vinari gratis?',
    answer: 'Ya, kamu bisa mulai memakai Vinari gratis.'
  },
  {
    question: 'Apakah Vinari menyimpan uang saya?',
    answer: 'Tidak. Vinari hanya membantu mencatat dan memahami keuangan. Vinari bukan bank atau dompet digital.'
  },
  {
    question: 'Bagaimana cara upgrade?',
    answer: 'Upgrade dilakukan manual melalui QRIS, lalu bukti pembayaran dicek admin.'
  },
  {
    question: 'Apakah cocok untuk keluarga?',
    answer: 'Ya, paket Premium Family dibuat untuk pasangan atau keluarga kecil.'
  }
];

export function PricingPage() {
  const { user } = useAuth();
  const ctaHref = user ? '/app/upgrade' : '/register';

  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Harga</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">
            Pilih paket sesuai kebutuhan kamu.
          </h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Mulai dari gratis. Upgrade manual tersedia saat kamu butuh fitur premium.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className={
                plan.highlighted
                  ? 'rounded-[1.75rem] border border-primary/30 bg-white p-6 shadow-[0_24px_60px_rgba(29,78,216,0.18)] ring-2 ring-primary/10 dark:bg-card'
                  : 'rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] dark:bg-card'
              }
              key={plan.name}
            >
              {plan.highlighted ? (
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">Populer</span>
              ) : null}
              <h2 className="mt-4 text-xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li className="flex gap-2" key={feature}>
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full rounded-2xl" variant={plan.highlighted ? 'default' : 'outline'}>
                <Link to={ctaHref}>{user ? 'Upgrade di Aplikasi' : 'Mulai Gratis'}</Link>
              </Button>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card" key={faq.question}>
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
