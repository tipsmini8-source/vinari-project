# Vinari Project

## Gambaran Project

Vinari Project adalah fondasi awal untuk membangun produk SaaS profesional bernama sementara Vinari. Vinari dirancang sebagai Personal & Family Financial Operating System, bukan sekadar aplikasi pencatatan pengeluaran.

Vinari membantu pengguna mencatat keuangan, memahami kondisi finansial, membuat budget, mengelola hutang, mengatur target, berkolaborasi dengan pasangan atau keluarga, dan mengambil keputusan finansial yang lebih baik.

## Visi

Menjadi sistem operasi finansial pribadi dan keluarga yang membantu pengguna mengambil keputusan keuangan dengan lebih jelas, tenang, dan terarah.

## Misi

- Membantu pengguna mencatat aktivitas finansial secara mudah dan konsisten.
- Membantu pengguna memahami kondisi keuangan secara sederhana namun akurat.
- Membantu pengguna membuat rencana budget, target, dan pelunasan hutang.
- Membantu pengguna mensimulasikan keputusan finansial sebelum bertindak.
- Membantu pengguna membangun kebiasaan finansial yang lebih sehat dari waktu ke waktu.

## Target Pengguna

- Individu yang ingin mengatur keuangan pribadi.
- Pasangan yang ingin mengelola keuangan bersama.
- Keluarga yang membutuhkan perencanaan dan transparansi finansial.
- Pemilik usaha kecil sebagai target pengembangan masa depan.

## Nilai Jual Utama

- Bukan hanya mencatat transaksi, tetapi membantu pengguna memahami kondisi keuangan.
- Mendukung lima pilar produk: Record, Understand, Plan, Decide, dan Grow.
- Dirancang untuk kebutuhan personal dan keluarga.
- Memiliki arah pengembangan freemium SaaS yang berkelanjutan.
- Siap dikembangkan dengan fondasi keamanan, struktur data, dan arsitektur modern.

## Tech Stack Rencana

### Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- PWA.

### Backend

- Supabase.
- PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Row Level Security.

### Hosting

- Vercel.

### Repository

- GitHub.

## Roadmap Besar

### Fase 0: Foundation

Membuat dokumentasi produk, bisnis, engineering, desain, dan roadmap sebagai single source of truth sebelum pengembangan aplikasi dimulai.

### Fase 1: MVP Personal Finance

Membangun fondasi autentikasi, akun finansial, transaksi, kategori, budget dasar, target, dan ringkasan kondisi finansial.

### Fase 2: Planning dan Insight

Mengembangkan Financial Health Score, debt planning, cashflow overview, dan insight finansial yang membantu pengguna memahami kondisi keuangan.

### Fase 3: Family Workspace

Mendukung kolaborasi pasangan dan keluarga melalui workspace bersama, role, approval, family budget, dan meeting finansial keluarga.

### Fase 4: Premium SaaS

Mengaktifkan model freemium dan premium dengan fitur lanjutan seperti AI Financial Insight, export, recurring transaction, subscription manager, dan cashflow prediction.

## Daftar Dokumentasi

- [Dokumentasi Index](docs/README.md)
- [Foundation Manifesto](docs/00-foundation/manifesto.md)
- [Development Constitution](docs/00-foundation/development-constitution.md)
- [Vision](docs/00-foundation/vision.md)
- [Mission](docs/00-foundation/mission.md)
- [Product Principles](docs/00-foundation/product-principles.md)
- [PRD](docs/01-product/prd.md)
- [Feature Catalog](docs/01-product/feature-catalog.md)
- [User Persona](docs/01-product/user-persona.md)
- [User Journey](docs/01-product/user-journey.md)
- [Information Architecture](docs/01-product/information-architecture.md)
- [Business Model](docs/02-business/business-model.md)
- [Free vs Premium](docs/02-business/free-vs-premium.md)
- [Pricing](docs/02-business/pricing.md)
- [Database](docs/03-engineering/database.md)
- [Domain Model](docs/03-engineering/domain-model.md)
- [ERD](docs/03-engineering/erd.md)
- [API](docs/03-engineering/api.md)
- [Security](docs/03-engineering/security.md)
- [Architecture](docs/03-engineering/architecture.md)
- [Design System](docs/04-design/design-system.md)
- [UI Guideline](docs/04-design/ui-guideline.md)
- [Wireframe](docs/04-design/wireframe.md)
- [Roadmap](docs/05-development/roadmap.md)
- [Sprint](docs/05-development/sprint.md)
- [Changelog](docs/05-development/changelog.md)

## Aturan Pengembangan

- Jangan membuat kode aplikasi sebelum dokumentasi terkait disetujui.
- Jangan membuat schema database final tanpa review arsitektur dan keamanan.
- Setiap fitur harus merujuk pada PRD, feature catalog, dan aturan bisnis.
- Setiap keputusan teknis harus mempertimbangkan keamanan, skalabilitas, maintainability, dan pengalaman pengguna.
- Dokumentasi ini menjadi single source of truth untuk seluruh pengembangan Vinari.
- Perubahan besar harus dicatat di changelog dan roadmap.
