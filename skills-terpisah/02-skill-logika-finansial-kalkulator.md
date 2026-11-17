---
name: financial-logic-calculator
description: Skill khusus untuk menangani logika pencatatan transaksi, filter laporan multi-periode (harian/mingguan/bulanan), dan algoritma kalkulator target tabungan barang.
---

# Skill 2: Mesin Logika Finansial & Kalkulator Target Dinamis

## Peran & Fokus Utama
Bertanggung jawab atas seluruh perhitungan matematika, manipulasi tanggal, filter periode laporan keuangan, serta logika estimasi tabungan untuk membeli barang incaran.

## Aturan Teknis & Logika Wajib
1. **Pencatatan & Riwayat Transaksi**:
   - Setiap transaksi wajib menyimpan atribut: `id`, `tanggal`, `jenis` (Pemasukan / Pengeluaran), `kategori_50_30_20` (Kebutuhan / Keinginan / Tabungan), `nominal`, dan `catatan`.
   - Sediakan log riwayat transaksi lengkap dengan fitur pencarian, filter jenis transaksi, serta tombol hapus/edit.

2. **Laporan Multi-Periode (Harian, Mingguan, Bulanan)**:
   - **Filter Harian**: Menampilkan rekapitulasi uang masuk, uang keluar, dan selisih per tanggal spesifik (hari ini atau pilih tanggal).
   - **Filter Mingguan**: Mengelompokkan transaksi dalam rentang 7 hari terakhir atau per minggu dalam bulan berjalan.
   - **Filter Bulanan**: Mengelompokkan total arus kas berdasarkan bulan dan tahun.

3. **Algoritma Kalkulator Target Barang & Tabungan**:
   - Input pengguna: `Nama Barang`, `Harga Barang (Rp)`, `Uang Terkumpul Saat Ini (Rp)`, serta `Tenggat Waktu` dalam satuan **Hari**, **Minggu**, atau **Bulan**.
   - Konversi tenggat waktu ke total hari:
     - Jika satuan Minggu: `Total Hari = Jumlah Minggu * 7`
     - Jika satuan Bulan: `Total Hari = Jumlah Bulan * 30`
   - Rumus Sisihan Harian:
     `Nominal Harian = (Harga Barang - Uang Terkumpul) / Sisa Hari`
   - **Fitur Penyesuaian Otomatis (Auto-Recalculate)**:
     - Tampilkan *progress bar* persentase (`(Uang Terkumpul / Harga Barang) * 100%`).
     - Jika pengguna melewatkan setoran harian (absen menabung pada hari tertentu), hitung ulang otomatis beban tabungan harian di sisa hari yang ada atau berikan estimasi mundurnya tenggat waktu.
