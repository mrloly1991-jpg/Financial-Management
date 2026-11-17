---
name: xampp-backend-integration
description: Skill khusus untuk perancangan database MySQL/MariaDB (16 Tabel sesuai ERD resmi) di phpMyAdmin dan pembuatan backend PHP pada lingkungan lokal XAMPP.
---

# Skill 4: Integrasi Backend PHP & Database MySQL (16 Tabel ERD Resmi - Lingkungan XAMPP)

## Peran & Fokus Utama
Menangani arsitektur penyimpanan data permanen pada lingkungan server lokal **XAMPP** (Apache + MySQL/MariaDB + PHP) menggunakan skema **16 Tabel ERD Resmi** aplikasi **Financial Management**.

## Konfigurasi Lingkungan XAMPP
- **Lokasi Folder Proyek**: `C:/xampp/htdocs/financial-management/`
- **Akses Web Lokal**: `http://localhost/financial-management/`
- **Akses Database**: `http://localhost/phpmyadmin/`
- **Kredensial Koneksi Default XAMPP**:
  - Host: `localhost` (Port `3306`)
  - User: `root`
  - Password: `""` (kosong)
  - Database Name: `db_financial_management`

## Skema 16 Tabel Database (Sesuai ERD Resmi)

### A. Kelompok Pengguna & Transaksi Keuangan
1. **`users`**:
   - `user_id` (INT, AUTO_INCREMENT, PK)
   - `nama` (VARCHAR 100)
   - `email` (VARCHAR 150, UK)
   - `password_hash` (VARCHAR 255)
   - `role` (ENUM: `'user'`, `'admin'`)
2. **`transactions`**:
   - `transaction_id` (BIGINT, AUTO_INCREMENT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `tanggal` (DATE)
   - `judul` (VARCHAR 150)
   - `jenis` (ENUM: `'pemasukan'`, `'pengeluaran'`)
   - `kategori_503020` (ENUM: `'needs'`, `'wants'`, `'savings'`, NULLABLE jika pemasukan)
   - `nominal` (DECIMAL 15,2)
   - `catatan` (TEXT, NULLABLE)

### B. Kelompok Target Barang & Tabungan Dinamis
3. **`saving_goals`**:
   - `goal_id` (INT, AUTO_INCREMENT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `nama_barang` (VARCHAR 150)
   - `harga_barang` (DECIMAL 15,2)
   - `uang_awal` (DECIMAL 15,2)
   - `tenggat_nilai` (SMALLINT)
   - `tenggat_satuan` (ENUM: `'hari'`, `'minggu'`, `'bulan'`)
   - `tanggal_target_awal` (DATE)
   - `tanggal_target` (DATE)
   - `mode_penyesuaian` (ENUM: `'tambah_nominal'`, `'mundur_tanggal'`)
   - `status` (ENUM: `'active'`, `'completed'`, `'cancelled'`)
4. **`saving_logs`**:
   - `saving_id` (BIGINT, AUTO_INCREMENT, PK)
   - `goal_id` (INT, FK -> `saving_goals.goal_id`)
   - `transaction_id` (BIGINT, FK UNIQUE -> `transactions.transaction_id`)
5. **`goal_recalculations`**:
   - `recalc_id` (BIGINT, AUTO_INCREMENT, PK)
   - `goal_id` (INT, FK -> `saving_goals.goal_id`)
   - `tanggal_hitung` (DATE)
   - `hari_terlewat` (SMALLINT)
   - `setoran_harian_baru` (DECIMAL 15,2)
   - `tanggal_target_baru` (DATE)

### C. Kelompok Simulasi, Modul Edukasi, Kuis & Studi Kasus
6. **`budget_simulations`**:
   - `simulation_id` (INT, AUTO_INCREMENT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `pemasukan` (DECIMAL 15,2)
   - `pct_needs` (TINYINT)
   - `pct_wants` (TINYINT)
   - `pct_savings` (TINYINT)
7. **`education_modules`**:
   - `module_id` (INT, AUTO_INCREMENT, PK)
   - `judul` (VARCHAR 150)
   - `slug` (VARCHAR 150, UK)
   - `isi` (MEDIUMTEXT)
   - `tingkat` (ENUM: `'dasar'`, `'menengah'`, `'lanjut'`)
8. **`user_module_progress`**:
   - `progress_id` (INT, AUTO_INCREMENT, PK)
   - `user_id` (INT, FK -> `users.user_id`)
   - `module_id` (INT, FK -> `education_modules.module_id`)
   - `status` (ENUM: `'belum'`, `'sedang_belajar'`, `'selesai'`)
   - `selesai_at` (TIMESTAMP, NULLABLE)
9. **`quiz_questions`**:
   - `question_id` (INT, AUTO_INCREMENT, PK)
   - `module_id` (INT, FK -> `education_modules.module_id`)
   - `pertanyaan` (TEXT)
   - `penjelasan` (TEXT)
10. **`quiz_options`**:
    - `option_id` (INT, AUTO_INCREMENT, PK)
    - `question_id` (INT, FK -> `quiz_questions.question_id`)
    - `teks_opsi` (VARCHAR 255)
    - `is_correct` (TINYINT 1)
11. **`quiz_attempts`**:
    - `attempt_id` (INT, AUTO_INCREMENT, PK)
    - `user_id` (INT, FK -> `users.user_id`)
    - `module_id` (INT, FK -> `education_modules.module_id`)
    - `jumlah_soal` (TINYINT)
    - `jumlah_benar` (TINYINT)
    - `skor` (DECIMAL 5,2)
    - `taken_at` (TIMESTAMP)
12. **`quiz_answers`**:
    - `answer_id` (BIGINT, AUTO_INCREMENT, PK)
    - `attempt_id` (INT, FK -> `quiz_attempts.attempt_id`)
    - `question_id` (INT, FK -> `quiz_questions.question_id`)
    - `option_id` (INT, FK -> `quiz_options.option_id`)
13. **`case_studies`**:
    - `case_id` (INT, AUTO_INCREMENT, PK)
    - `module_id` (INT, FK NULLABLE -> `education_modules.module_id`)
    - `judul` (VARCHAR 150)
    - `skenario` (TEXT)
    - `saldo_awal` (DECIMAL 15,2)
14. **`case_options`**:
    - `option_id` (INT, AUTO_INCREMENT, PK)
    - `case_id` (INT, FK -> `case_studies.case_id`)
    - `teks_opsi` (VARCHAR 255)
    - `dampak_saldo` (DECIMAL 15,2)
    - `dampak_tabungan` (DECIMAL 15,2)
    - `analisis_dampak` (TEXT)
    - `arahkan_ke_kalkulator` (TINYINT 1)
15. **`user_case_responses`**:
    - `response_id` (INT, AUTO_INCREMENT, PK)
    - `user_id` (INT, FK -> `users.user_id`)
    - `case_id` (INT, FK -> `case_studies.case_id`)
    - `option_id` (INT, FK -> `case_options.option_id`)
16. **`contextual_triggers`**:
    - `trigger_id` (INT, AUTO_INCREMENT, PK)
    - `kode` (ENUM: `'DEFISIT'`, `'WANTS_OVER_30'`, `'SAVINGS_UNDER_20'`, `'GOAL_DELAYED'`, UK)
    - `judul` (VARCHAR 150)
    - `ambang_persen` (DECIMAL 5,2)
    - `module_id` (INT, FK NULLABLE -> `education_modules.module_id`)
