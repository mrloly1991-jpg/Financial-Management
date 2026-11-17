---
name: interactive-edtech-engine
description: Skill khusus untuk membangun modul pembelajaran keuangan interaktif (simulasi anggaran, studi kasus, kuis) dan rekomendasi edukasi kontekstual berdasarkan kondisi laporan keuangan.
---

# Skill 3: Sistem Edukasi Keuangan Interaktif & Kontekstual (EdTech Engine)

## Peran & Fokus Utama
Memastikan web **Financial Management** berfungsi sebagai media pembelajaran dan literasi finansial yang aktif, bukan sekadar pencatat uang. Seluruh materi edukasi wajib disajikan secara interaktif.

## Aturan Teknis & Fitur Wajib
1. **Simulasi Interaktif (Learning by Doing)**:
   - Sediakan **Simulator Anggaran 50/30/20**: Pengguna dapat memasukkan angka uang saku/gaji atau menggeser *slider* interaktif untuk melihat pembagian ideal antara Kebutuhan (50%), Keinginan (30%), dan Tabungan (20%) secara langsung.
   - Sediakan **Studi Kasus Interaktif**: Skenario nyata (misalnya: "Memilih antara membeli barang diskon sekarang atau menabung untuk kebutuhan mendesak") di mana pilihan pengguna menghasilkan dampak visual pada simulasi saldo.

2. **Kuis Literasi Finansial dengan Umpan Balik Instan**:
   - Setiap modul materi dilengkapi kuis pilihan ganda (3-5 soal).
   - Saat pengguna memilih jawaban, tampilkan *feedback* langsung (Benar/Kurang Tepat) beserta penjelasan edukatifnya dan skor akhir.

3. **Rekomendasi Edukasi Kontekstual (Contextual Trigger)**:
   - Sistem wajib membaca kondisi laporan keuangan pengguna dan memunculkan kartu peringatan/saran belajar secara otomatis di Dashboard:
     - **Kondisi Defisit (Pengeluaran > Pemasukan)**: Munculkan modul *"Strategi Menghentikan Kebocoran Uang & Evaluasi Pengeluaran"*.
     - **Pos Keinginan > 30%**: Munculkan modul *"Cara Membedakan Kebutuhan vs Keinginan & Mengatasi Impulsive Buying"*.
     - **Tabungan < 20% atau Target Barang Terlambat**: Munculkan modul *"Tips Menabung Konsisten dengan Metode Pay Yourself First"*.
