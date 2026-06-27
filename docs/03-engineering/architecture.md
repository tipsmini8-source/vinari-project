# Architecture

## Tujuan

Dokumen ini mendefinisikan arsitektur teknis awal Vinari pada level konsep tanpa membuat kode aplikasi.

## Latar Belakang

Vinari akan dikembangkan sebagai SaaS modern dengan frontend React, backend Supabase, deployment Vercel, dan repository GitHub. Arsitektur harus mendukung PWA, keamanan data, premium entitlement, dan pengembangan bertahap.

## Stack Rencana

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

### Hosting dan Repository

- Vercel.
- GitHub.

## Prinsip Arsitektur

- Modular.
- Secure by default.
- Documentation-driven.
- Scalable untuk personal dan family workspace.
- Siap mendukung premium dan AI.
- Mudah diuji dan dirawat.

## Komponen Sistem

- Web application.
- Supabase Auth.
- PostgreSQL database.
- Supabase Storage.
- Row Level Security.
- Edge Functions.
- Billing integration.
- AI integration.
- Export service.

## Aturan Bisnis

- Tidak ada fitur yang boleh melewati authorization.
- Arsitektur harus mendukung workspace sebagai boundary data.
- Premium entitlement harus dapat dicek konsisten di frontend dan backend.
- Fitur AI harus memiliki boundary data dan audit.

## Catatan Teknis

- Dokumen ini belum membuat struktur folder aplikasi.
- Struktur source code akan dibuat pada fase development setelah dokumentasi disetujui.
- Arsitektur final harus disertai decision record.

## Pengembangan Masa Depan

- Membuat architecture decision record.
- Membuat diagram sistem.
- Membuat deployment strategy.
- Membuat observability plan.
- Membuat testing strategy.
