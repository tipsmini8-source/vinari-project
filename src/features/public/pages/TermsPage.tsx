const sections = [
  {
    title: 'Ketentuan penggunaan',
    text: 'Dengan memakai Vinari, user setuju menggunakan aplikasi untuk kebutuhan pencatatan dan pemahaman keuangan pribadi atau keluarga.'
  },
  {
    title: 'Tanggung jawab data',
    text: 'User bertanggung jawab atas data yang dimasukkan ke Vinari, termasuk transaksi, dompet, target, dan hutang.'
  },
  {
    title: 'Alat bantu pencatatan',
    text: 'Vinari hanya alat bantu pencatatan keuangan. Vinari bukan bank, bukan e-wallet, tidak menyimpan uang asli user, dan bukan penasihat keuangan profesional.'
  },
  {
    title: 'Pembayaran premium manual',
    text: 'Upgrade premium dilakukan manual. Bukti pembayaran akan dicek admin sebelum subscription diaktifkan.'
  },
  {
    title: 'Refund policy',
    text: 'Kebijakan refund dapat berubah dan akan diinformasikan melalui halaman ini.'
  },
  {
    title: 'Larangan penyalahgunaan',
    text: 'User dilarang menyalahgunakan aplikasi, mengganggu sistem, atau memakai Vinari untuk aktivitas yang melanggar hukum.'
  },
  {
    title: 'Perubahan layanan',
    text: 'Vinari dapat memperbarui fitur, harga, atau ketentuan layanan untuk meningkatkan kualitas aplikasi.'
  },
  {
    title: 'Batasan tanggung jawab',
    text: 'Vinari tidak bertanggung jawab atas keputusan finansial yang dibuat user berdasarkan data yang dimasukkan sendiri.'
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
        </div>
      </section>
    </main>
  );
}
