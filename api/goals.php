<?php
session_start();
require_once 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? (int)($_GET['user_id'] ?? 1);

if ($method === 'GET') {
    // Ambil semua saving_goals beserta total setoran dari saving_logs + transactions dan riwayat goal_recalculations
    $sql = "
        SELECT 
            g.*,
            COALESCE(SUM(t.nominal), 0) AS total_setoran_log,
            (SELECT COALESCE(SUM(r.hari_terlewat), 0) FROM goal_recalculations r WHERE r.goal_id = g.goal_id) AS total_hari_terlewat
        FROM saving_goals g
        LEFT JOIN saving_logs sl ON sl.goal_id = g.goal_id
        LEFT JOIN transactions t ON t.transaction_id = sl.transaction_id
        WHERE g.user_id = ?
        GROUP BY g.goal_id
        ORDER BY g.goal_id DESC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'create';

    if ($action === 'create') {
        $nilai = (int)($input['tenggat_nilai'] ?? 1);
        $satuan = $input['tenggat_satuan'] ?? 'bulan';
        $totalHari = $nilai;
        if ($satuan === 'minggu') $totalHari = $nilai * 7;
        if ($satuan === 'bulan') $totalHari = $nilai * 30;

        $targetDate = date('Y-m-d', strtotime("+$totalHari days"));

        $stmt = $pdo->prepare("INSERT INTO saving_goals (user_id, nama_barang, harga_barang, uang_awal, tenggat_nilai, tenggat_satuan, tanggal_target_awal, tanggal_target, mode_penyesuaian, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmt->execute([
            $userId,
            $input['nama_barang'],
            $input['harga_barang'],
            $input['uang_awal'] ?? 0,
            $nilai,
            $satuan,
            $targetDate,
            $targetDate,
            $input['mode_penyesuaian'] ?? 'tambah_nominal'
        ]);
        echo json_encode(['status' => 'success', 'goal_id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'deposit') {
        // 1. Buat transaksi di tabel transactions (kategori_503020 = 'savings')
        $pdo->beginTransaction();
        $stmtTx = $pdo->prepare("INSERT INTO transactions (user_id, tanggal, judul, jenis, kategori_503020, nominal, catatan) VALUES (?, CURDATE(), ?, 'pengeluaran', 'savings', ?, 'Setoran tabungan target barang')");
        $stmtTx->execute([$userId, 'Setoran Tabungan: ' . ($input['nama_barang'] ?? 'Target Barang'), $input['nominal']]);
        $txId = $pdo->lastInsertId();

        // 2. Hubungkan di tabel saving_logs (sesuai ERD: saving_id, goal_id, transaction_id UNIQUE)
        $stmtLog = $pdo->prepare("INSERT INTO saving_logs (goal_id, transaction_id) VALUES (?, ?)");
        $stmtLog->execute([$input['goal_id'], $txId]);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'transaction_id' => $txId]);
        exit;
    }

    if ($action === 'recalculate') {
        // Catat ke tabel goal_recalculations sesuai ERD
        $stmt = $pdo->prepare("INSERT INTO goal_recalculations (goal_id, tanggal_hitung, hari_terlewat, setoran_harian_baru, tanggal_target_baru) VALUES (?, CURDATE(), ?, ?, ?)");
        $stmt->execute([
            $input['goal_id'],
            $input['hari_terlewat'] ?? 1,
            $input['setoran_harian_baru'],
            $input['tanggal_target_baru']
        ]);
        echo json_encode(['status' => 'success', 'recalc_id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM saving_goals WHERE goal_id = ? AND user_id = ?");
        $stmt->execute([$input['goal_id'], $userId]);
        echo json_encode(['status' => 'success']);
        exit;
    }
}
