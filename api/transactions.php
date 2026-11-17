<?php
session_start();
require_once 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? (int)($_GET['user_id'] ?? 1);

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY tanggal DESC, transaction_id DESC");
    $stmt->execute([$userId]);
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'save';

    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?");
        $stmt->execute([$input['transaction_id'], $userId]);
        echo json_encode(['status' => 'success']);
        exit;
    }

    $jenis = $input['jenis'] ?? 'pengeluaran';
    // Sesuai ERD: kategori_503020 NULL jika pemasukan
    $kategori = ($jenis === 'pemasukan') ? null : ($input['kategori_503020'] ?? 'needs');

    if (!empty($input['transaction_id'])) {
        $stmt = $pdo->prepare("UPDATE transactions SET tanggal = ?, judul = ?, jenis = ?, kategori_503020 = ?, nominal = ?, catatan = ? WHERE transaction_id = ? AND user_id = ?");
        $stmt->execute([
            $input['tanggal'],
            $input['judul'],
            $jenis,
            $kategori,
            $input['nominal'],
            $input['catatan'] ?? null,
            $input['transaction_id'],
            $userId
        ]);
        echo json_encode(['status' => 'success', 'transaction_id' => $input['transaction_id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, tanggal, judul, jenis, kategori_503020, nominal, catatan) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['tanggal'],
            $input['judul'],
            $jenis,
            $kategori,
            $input['nominal'],
            $input['catatan'] ?? null
        ]);
        echo json_encode(['status' => 'success', 'transaction_id' => $pdo->lastInsertId()]);
    }
    exit;
}
