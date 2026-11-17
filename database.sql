-- ============================================================================
-- DATABASE DDL & SEED DATA: FINANCIAL MANAGEMENT WEB (XAMPP MySQL / MariaDB)
-- Disusun persis mengikuti 16 Tabel pada ERD Resmi
-- Cara Pakai: Buka http://localhost/phpmyadmin -> Import file database.sql ini
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `db_financial_management`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_financial_management`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel USERS
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel TRANSACTIONS
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `transaction_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `tanggal` DATE NOT NULL,
  `judul` VARCHAR(150) NOT NULL,
  `jenis` ENUM('pemasukan', 'pengeluaran') NOT NULL,
  `kategori_503020` ENUM('needs', 'wants', 'savings') NULL COMMENT 'NULL jika pemasukan',
  `nominal` DECIMAL(15,2) NOT NULL,
  `catatan` TEXT NULL,
  CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel SAVING_GOALS
DROP TABLE IF EXISTS `saving_goals`;
CREATE TABLE `saving_goals` (
  `goal_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `nama_barang` VARCHAR(150) NOT NULL,
  `harga_barang` DECIMAL(15,2) NOT NULL,
  `uang_awal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `tenggat_nilai` SMALLINT NOT NULL,
  `tenggat_satuan` ENUM('hari', 'minggu', 'bulan') NOT NULL DEFAULT 'hari',
  `tanggal_target_awal` DATE NOT NULL,
  `tanggal_target` DATE NOT NULL,
  `mode_penyesuaian` ENUM('tambah_nominal', 'mundur_tanggal') NOT NULL DEFAULT 'tambah_nominal',
  `status` ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel SAVING_LOGS (Menghubungkan setoran tabungan dengan transaksi)
DROP TABLE IF EXISTS `saving_logs`;
CREATE TABLE `saving_logs` (
  `saving_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `goal_id` INT NOT NULL,
  `transaction_id` BIGINT NOT NULL UNIQUE,
  CONSTRAINT `fk_saving_logs_goal` FOREIGN KEY (`goal_id`) REFERENCES `saving_goals`(`goal_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saving_logs_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`transaction_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel GOAL_RECALCULATIONS (Riwayat hitung ulang otomatis saat absen menabung)
DROP TABLE IF EXISTS `goal_recalculations`;
CREATE TABLE `goal_recalculations` (
  `recalc_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `goal_id` INT NOT NULL,
  `tanggal_hitung` DATE NOT NULL,
  `hari_terlewat` SMALLINT NOT NULL DEFAULT 1,
  `setoran_harian_baru` DECIMAL(15,2) NOT NULL,
  `tanggal_target_baru` DATE NOT NULL,
  CONSTRAINT `fk_recalc_goal` FOREIGN KEY (`goal_id`) REFERENCES `saving_goals`(`goal_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel BUDGET_SIMULATIONS (Simulasi Interaktif Metode 50/30/20)
DROP TABLE IF EXISTS `budget_simulations`;
CREATE TABLE `budget_simulations` (
  `simulation_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `pemasukan` DECIMAL(15,2) NOT NULL,
  `pct_needs` TINYINT NOT NULL DEFAULT 50,
  `pct_wants` TINYINT NOT NULL DEFAULT 30,
  `pct_savings` TINYINT NOT NULL DEFAULT 20,
  CONSTRAINT `fk_sim_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel EDUCATION_MODULES (Pusat Materi Edukasi Keuangan)
DROP TABLE IF EXISTS `education_modules`;
CREATE TABLE `education_modules` (
  `module_id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `isi` MEDIUMTEXT NOT NULL,
  `tingkat` ENUM('dasar', 'menengah', 'lanjut') NOT NULL DEFAULT 'dasar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabel USER_MODULE_PROGRESS (Progres Belajar Pengguna)
DROP TABLE IF EXISTS `user_module_progress`;
CREATE TABLE `user_module_progress` (
  `progress_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `module_id` INT NOT NULL,
  `status` ENUM('belum', 'sedang_belajar', 'selesai') NOT NULL DEFAULT 'belum',
  `selesai_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_prog_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prog_module` FOREIGN KEY (`module_id`) REFERENCES `education_modules`(`module_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Tabel QUIZ_QUESTIONS (Daftar Pertanyaan Kuis)
DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `question_id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NOT NULL,
  `pertanyaan` TEXT NOT NULL,
  `penjelasan` TEXT NOT NULL,
  CONSTRAINT `fk_quiz_q_module` FOREIGN KEY (`module_id`) REFERENCES `education_modules`(`module_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Tabel QUIZ_OPTIONS (Pilihan Jawaban Kuis)
DROP TABLE IF EXISTS `quiz_options`;
CREATE TABLE `quiz_options` (
  `option_id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `teks_opsi` VARCHAR(255) NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_quiz_opt_q` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Tabel QUIZ_ATTEMPTS (Riwayat Percobaan & Skor Kuis Pengguna)
DROP TABLE IF EXISTS `quiz_attempts`;
CREATE TABLE `quiz_attempts` (
  `attempt_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `module_id` INT NOT NULL,
  `jumlah_soal` TINYINT NOT NULL,
  `jumlah_benar` TINYINT NOT NULL,
  `skor` DECIMAL(5,2) NOT NULL,
  `taken_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attempt_module` FOREIGN KEY (`module_id`) REFERENCES `education_modules`(`module_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Tabel QUIZ_ANSWERS (Detail Jawaban per Soal dalam Kuis)
DROP TABLE IF EXISTS `quiz_answers`;
CREATE TABLE `quiz_answers` (
  `answer_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `attempt_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `option_id` INT NOT NULL,
  CONSTRAINT `fk_ans_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts`(`attempt_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ans_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`question_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ans_option` FOREIGN KEY (`option_id`) REFERENCES `quiz_options`(`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Tabel CASE_STUDIES (Studi Kasus Keputusan Finansial Interaktif)
DROP TABLE IF EXISTS `case_studies`;
CREATE TABLE `case_studies` (
  `case_id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NULL,
  `judul` VARCHAR(150) NOT NULL,
  `skenario` TEXT NOT NULL,
  `saldo_awal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT `fk_case_module` FOREIGN KEY (`module_id`) REFERENCES `education_modules`(`module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Tabel CASE_OPTIONS (Opsi Keputusan Studi Kasus & Dampaknya)
DROP TABLE IF EXISTS `case_options`;
CREATE TABLE `case_options` (
  `option_id` INT AUTO_INCREMENT PRIMARY KEY,
  `case_id` INT NOT NULL,
  `teks_opsi` VARCHAR(255) NOT NULL,
  `dampak_saldo` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `dampak_tabungan` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `analisis_dampak` TEXT NOT NULL,
  `arahkan_ke_kalkulator` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_case_opt_study` FOREIGN KEY (`case_id`) REFERENCES `case_studies`(`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Tabel USER_CASE_RESPONSES (Riwayat Pilihan Studi Kasus Pengguna)
DROP TABLE IF EXISTS `user_case_responses`;
CREATE TABLE `user_case_responses` (
  `response_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `case_id` INT NOT NULL,
  `option_id` INT NOT NULL,
  CONSTRAINT `fk_ucr_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ucr_case` FOREIGN KEY (`case_id`) REFERENCES `case_studies`(`case_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ucr_opt` FOREIGN KEY (`option_id`) REFERENCES `case_options`(`option_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Tabel CONTEXTUAL_TRIGGERS (Banner Rekomendasi Edukasi Otomatis di Dashboard)
DROP TABLE IF EXISTS `contextual_triggers`;
CREATE TABLE `contextual_triggers` (
  `trigger_id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode` ENUM('DEFISIT', 'WANTS_OVER_30', 'SAVINGS_UNDER_20', 'GOAL_DELAYED') NOT NULL UNIQUE,
  `judul` VARCHAR(150) NOT NULL,
  `ambang_persen` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `module_id` INT NULL,
  CONSTRAINT `fk_trigger_module` FOREIGN KEY (`module_id`) REFERENCES `education_modules`(`module_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- DATA AWAL (SEED DATA) UNTUK SIMULASI LANGSUNG DI XAMPP
-- ============================================================================

INSERT INTO `users` (`user_id`, `nama`, `email`, `password_hash`, `role`) VALUES
(1, 'Mahasiswa PTK 2025', 'mahasiswa@financial.local', '$2y$10$abcdefghijklmnopqrstuv', 'user');

INSERT INTO `transactions` (`transaction_id`, `user_id`, `tanggal`, `judul`, `jenis`, `kategori_503020`, `nominal`, `catatan`) VALUES
(1, 1, '2026-11-10', 'Uang Saku / Gaji Bulanan', 'pemasukan', NULL, 3500000.00, 'Pemasukan rutin awal bulan'),
(2, 1, '2026-11-11', 'Belanja Kebutuhan Pokok & Makan', 'pengeluaran', 'needs', 1200000.00, 'Kebutuhan makan dan kos'),
(3, 1, '2026-11-12', 'Nongkrong & Kopi Kekinian', 'pengeluaran', 'wants', 450000.00, 'Pengeluaran gaya hidup'),
(4, 1, '2026-11-14', 'Setoran Awal Tabungan Laptop', 'pengeluaran', 'savings', 500000.00, 'Disisihkan untuk target laptop'),
(5, 1, '2026-11-15', 'Langganan Streaming & Hiburan', 'pengeluaran', 'wants', 350000.00, 'Hiburan bulanan'),
(6, 1, '2026-11-16', 'Bonus Proyek Desain Web', 'pemasukan', NULL, 750000.00, 'Pemasukan tambahan');

INSERT INTO `saving_goals` (`goal_id`, `user_id`, `nama_barang`, `harga_barang`, `uang_awal`, `tenggat_nilai`, `tenggat_satuan`, `tanggal_target_awal`, `tanggal_target`, `mode_penyesuaian`, `status`) VALUES
(1, 1, 'Laptop Kerja / Kuliah', 7500000.00, 2000000.00, 100, 'hari', '2027-02-24', '2027-02-24', 'tambah_nominal', 'active'),
(2, 1, 'Dana Darurat Mahasiswa', 3000000.00, 1800000.00, 2, 'bulan', '2027-01-15', '2027-01-15', 'mundur_tanggal', 'active');

INSERT INTO `saving_logs` (`saving_id`, `goal_id`, `transaction_id`) VALUES
(1, 1, 4);

INSERT INTO `goal_recalculations` (`recalc_id`, `goal_id`, `tanggal_hitung`, `hari_terlewat`, `setoran_harian_baru`, `tanggal_target_baru`) VALUES
(1, 1, '2026-11-16', 2, 62500.00, '2027-02-24');

INSERT INTO `budget_simulations` (`simulation_id`, `user_id`, `pemasukan`, `pct_needs`, `pct_wants`, `pct_savings`) VALUES
(1, 1, 4000000.00, 50, 30, 20);

INSERT INTO `education_modules` (`module_id`, `judul`, `slug`, `isi`, `tingkat`) VALUES
(1, 'Menguasai Metode Anggaran 50/30/20', 'metode-50-30-20', 'Metode 50/30/20 membagi pemasukan bersih ke dalam 50% Kebutuhan Pokok (Needs), 30% Keinginan (Wants), dan 20% Tabungan (Savings).', 'dasar'),
(2, 'Strategi Menghentikan Kebocoran Uang & Defisit', 'menghentikan-defisit', 'Evaluasi pengeluaran bocor halus dengan mencatat setiap transaksi harian dan memangkas pos keinginan yang melebihi batas.', 'menengah'),
(3, 'Disiplin Menabung dengan Pay Yourself First', 'pay-yourself-first', 'Sisihkan uang tabungan barang incaran tepat di hari pertama menerima uang saku/gaji, bukan menunggu sisa uang di akhir bulan.', 'dasar');

INSERT INTO `user_module_progress` (`progress_id`, `user_id`, `module_id`, `status`, `selesai_at`) VALUES
(1, 1, 1, 'sedang_belajar', NULL);

INSERT INTO `quiz_questions` (`question_id`, `module_id`, `pertanyaan`, `penjelasan`) VALUES
(1, 1, 'Dalam metode pengelolaan keuangan 50/30/20, berapakah porsi minimal yang disarankan untuk Tabungan & Investasi?', 'Metode 50/30/20 membagi uang menjadi 50% Kebutuhan Pokok, 30% Keinginan, dan 20% Tabungan/Investasi.'),
(2, 3, 'Apa yang dimaksud dengan prinsip Pay Yourself First dalam menabung?', 'Pay Yourself First berarti mengamankan persentase tabungan tepat saat uang diterima di awal.'),
(3, 3, 'Jika harga barang Rp 1.500.000, tenggat 1 Bulan (30 hari), dan uang awal Rp 300.000, berapa setoran per hari?', 'Kekurangan Rp 1.200.000 dibagi 30 hari = Rp 40.000 per hari.');

INSERT INTO `quiz_options` (`option_id`, `question_id`, `teks_opsi`, `is_correct`) VALUES
(1, 1, '10% dari pemasukan', 0),
(2, 1, '20% dari pemasukan', 1),
(3, 1, '50% dari pemasukan', 0),
(4, 2, 'Membeli barang keinginan dahulu baru menabung sisanya', 0),
(5, 2, 'Menyisihkan uang tabungan langsung di awal saat menerima pemasukan', 1),
(6, 2, 'Meminjam uang untuk ditabung', 0),
(7, 3, 'Rp 30.000 / hari', 0),
(8, 3, 'Rp 40.000 / hari', 1),
(9, 3, 'Rp 50.000 / hari', 0);

INSERT INTO `case_studies` (`case_id`, `module_id`, `judul`, `skenario`, `saldo_awal`) VALUES
(1, 1, 'Godaan Flash Sale Saat Saldo Menipis', 'Hari ini Anda memiliki sisa uang Rp 600.000 untuk bertahan hidup 2 minggu ke depan. Toko online favorit menggelar Flash Sale sepatu impian Rp 450.000 (diskon 50%). Apa keputusan Anda?', 600000.00);

INSERT INTO `case_options` (`option_id`, `case_id`, `teks_opsi`, `dampak_saldo`, `dampak_tabungan`, `analisis_dampak`, `arahkan_ke_kalkulator`) VALUES
(1, 1, 'Beli Sekarang Mumpung Diskon Besar', -450000.00, 0.00, 'Saldo hidup Anda tersisa Rp 150.000 untuk 14 hari! Ini adalah contoh Impulsive Buying yang memicu defisit anggaran.', 0),
(2, 1, 'Tunda & Masukkan ke Kalkulator Target Barang', 0.00, 50000.00, 'Keputusan cerdas! Saldo kebutuhan pokok tetap aman, dan Anda dapat mencicil tabungan harian lewat fitur Target Barang.', 1);

INSERT INTO `contextual_triggers` (`trigger_id`, `kode`, `judul`, `ambang_persen`, `module_id`) VALUES
(1, 'DEFISIT', 'Strategi Menghentikan Kebocoran Uang & Evaluasi Pengeluaran', 100.00, 2),
(2, 'WANTS_OVER_30', 'Cara Membedakan Kebutuhan vs Keinginan (Wants > 30%)', 30.00, 1),
(3, 'SAVINGS_UNDER_20', 'Tips Menabung Konsisten dengan Pay Yourself First (Tabungan < 20%)', 20.00, 3),
(4, 'GOAL_DELAYED', 'Strategi Mengejar Ketertinggalan Target Tabungan Barang', 0.00, 3);
