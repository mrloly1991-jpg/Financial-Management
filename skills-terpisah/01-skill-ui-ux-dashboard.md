---
name: ui-ux-financial-dashboard
description: Skill khusus untuk merancang antarmuka pengguna (UI/UX), tata letak responsif, dan visualisasi grafik interaktif (Chart.js & Metode 50/30/20) pada web Financial Management.
---

# Skill 1: UI/UX & Visualisasi Data Keuangan

## Peran & Fokus Utama
Bertanggung jawab penuh atas tampilan visual (Frontend) aplikasi web **Financial Management**. Fokus pada kemudahan penggunaan, antarmuka bersih, responsif di perangkat *desktop* maupun *mobile*, serta penyajian grafik keuangan yang intuitif.

## Aturan Teknis & Komponen Wajib
1. **Teknologi Tampilan**:
   - Gunakan HTML5 semantik, CSS modern (Tailwind CSS via CDN atau CSS Grid/Flexbox terstruktur), dan pustaka **Chart.js**.
   - Gunakan palet warna finansial yang jelas: Hijau (`#10B981`) untuk Pemasukan/Tabungan, Merah (`#EF4444`) untuk Pengeluaran/Defisit, Biru (`#3B82F6`) untuk Kebutuhan, dan Kuning/Oranye (`#F59E0B`) untuk Keinginan & Edukasi.

2. **Dashboard Visual & Diagram (Wajib Ada)**:
   - **Grafik Arus Kas (Bar/Line Chart)**: Menampilkan perbandingan Pemasukan vs Pengeluaran yang dinamis mengikuti filter periode (Harian, Mingguan, Bulanan).
   - **Diagram Lingkaran Metode 50/30/20 (Doughnut Chart)**: Menampilkan proporsi alokasi uang secara otomatis ke dalam 3 pos:
     - **50% Kebutuhan (Needs)**
     - **30% Keinginan (Wants)**
     - **20% Tabungan (Savings)**

3. **Komponen Antarmuka**:
   - Kartu ringkasan (*Summary Cards*) untuk Saldo Total, Total Pemasukan, Total Pengeluaran, dan Total Tabungan.
   - Navigasi tab atau *sidebar* yang memisahkan dengan jelas antara: **Dashboard**, **Riwayat & Laporan**, **Target Barang**, dan **Edukasi Interaktif**.
   - Pada Tahap 1 (Prototipe), pastikan seluruh interaksi UI langsung memperbarui tampilan dan grafik tanpa perlu *reload* halaman (*reactive DOM update*).
