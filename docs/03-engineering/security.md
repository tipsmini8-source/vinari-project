# Security

## Tujuan

Dokumen ini mendefinisikan fondasi keamanan Vinari sebagai produk SaaS yang menangani data finansial sensitif.

## Latar Belakang

Produk finansial memerlukan standar keamanan tinggi sejak awal. Kesalahan authorization, RLS, logging, atau data sharing dapat merusak kepercayaan pengguna secara permanen.

## Prinsip Keamanan

- Security by design.
- Privacy by default.
- Least privilege.
- Explicit authorization.
- Secure auditability.
- Safe AI data handling.

## Area Keamanan

- Autentikasi.
- Authorization.
- Row Level Security.
- Data privacy.
- Secrets management.
- Logging.
- Billing security.
- AI data boundary.
- Incident response.

## Autentikasi

Vinari direncanakan menggunakan Supabase Auth.

Kebutuhan:

- Sign up.
- Sign in.
- Password reset.
- Email verification.
- Session management.
- Account deletion policy.

## Authorization

Authorization harus mempertimbangkan:

- User.
- Workspace.
- Role.
- Entitlement.
- Ownership record.

## Aturan Bisnis

- RLS wajib aktif untuk data user dan workspace.
- User tidak boleh mengakses data workspace tanpa membership aktif.
- Role family workspace harus jelas sebelum fitur dibuat.
- Data finansial tidak boleh muncul di log tanpa redaksi.
- AI tidak boleh menerima data yang tidak diperlukan.

## Catatan Teknis

- Secrets harus disimpan di environment platform, bukan repository.
- Audit log harus dirancang untuk aktivitas sensitif.
- Security review diperlukan sebelum production release.

## Pengembangan Masa Depan

- Membuat threat model.
- Membuat RLS policy detail.
- Membuat checklist security review.
- Membuat incident response playbook.
- Membuat privacy policy draft.
