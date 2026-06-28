const sections = [
  {
    title: 'Ketentuan penggunaan',
    text: 'Dengan memakai Vinari, pengguna setuju menggunakan aplikasi untuk kebutuhan pencatatan dan pemahaman keuangan pribadi atau keluarga.'
  },
  {
    title: 'Tanggung jawab data',
    text: 'Pengguna bertanggung jawab atas data yang dimasukkan ke Vinari, termasuk catatan uang, dompet, target tabungan, dan hutang/cicilan.'
  },
  {
    title: 'Alat bantu pencatatan',
    text: 'Vinari hanya alat bantu pencatatan keuangan. Vinari bukan bank, bukan e-wallet, tidak menyimpan uang asli pengguna, dan bukan penasihat keuangan profesional.'
  },
  {
    title: 'Pembayaran premium manual',
    text: 'Upgrade premium dilakukan manual. Bukti pembayaran akan dicek admin sebelum paket premium diaktifkan.'
  },
  {
    title: 'Kebijakan pengembalian dana',
    text: 'Kebijakan pengembalian dana dapat berubah dan akan diinformasikan melalui halaman ini.'
  },
  {
    title: 'Larangan penyalahgunaan',
    text: 'Pengguna dilarang menyalahgunakan aplikasi, mengganggu sistem, atau memakai Vinari untuk aktivitas yang melanggar hukum.'
  },
  {
    title: 'Perubahan layanan',
    text: 'Vinari dapat memperbarui fitur, harga, atau ketentuan layanan untuk meningkatkan kualitas aplikasi.'
  },
  {
    title: 'Batasan tanggung jawab',
    text: 'Vinari tidak bertanggung jawab atas keputusan keuangan yang dibuat pengguna berdasarkan data yang dimasukkan sendiri.'
  }
];

export function TermsPage() {
  return (
    <main className="px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-primary">Terms of Service</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal sm:text-5xl">Ketentuan Layanan Vinari</h1>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          Ketentuan ini menjelaskan cara menggunakan Vinari dengan aman dan bertanggung jawab.
        </p>
        <div className="mt-8 grid gap-4">
          {sections.map((section) => (
            <article className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card" key={section.title}>
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.text}</p>
            </article>
          ))}
          <article className="rounded-2xl border border-border bg-primary-soft p-5 text-primary">
            <h2 className="font-semibold">Bantuan</h2>
            <p className="mt-2 text-sm leading-7">
              Butuh bantuan? Hubungi{' '}
              <a className="font-medium underline underline-offset-4" href="mailto:support@vinari.app">
                support@vinari.app
              </a>
              .
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
