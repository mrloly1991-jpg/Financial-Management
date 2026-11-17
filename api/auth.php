<?php
session_start();
require_once 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!empty($_SESSION['user'])) {
        echo json_encode(['status' => 'success', 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['status' => 'guest', 'user' => null]);
    }
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    // 1. REGISTER PENGGUNA BARU
    if ($action === 'register') {
        $nama     = trim($input['nama'] ?? '');
        $email    = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';
        $role     = in_array($input['role'] ?? 'user', ['user', 'admin']) ? $input['role'] : 'user';

        if ($nama === '' || $email === '' || strlen($password) < 6) {
            http_response_code(400);
            echo json_encode([
                'status'  => 'error',
                'message' => 'Nama, email wajib diisi dan password minimal 6 karakter.'
            ]);
            exit;
        }

        // Cek apakah email sudah terdaftar (UNIQUE KEY di tabel users)
        $stmtCheck = $pdo->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->fetch()) {
            http_response_code(409);
            echo json_encode([
                'status'  => 'error',
                'message' => 'Email tersebut sudah terdaftar. Silakan gunakan email lain atau Masuk.'
            ]);
            exit;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $stmtIns = $pdo->prepare("INSERT INTO users (nama, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmtIns->execute([$nama, $email, $passwordHash, $role]);
        $newUserId = (int)$pdo->lastInsertId();

        $userSession = [
            'user_id' => $newUserId,
            'nama'    => $nama,
            'email'   => $email,
            'role'    => $role
        ];
        $_SESSION['user_id'] = $newUserId;
        $_SESSION['user']    = $userSession;

        echo json_encode([
            'status'  => 'success',
            'message' => 'Registrasi berhasil!',
            'user'    => $userSession
        ]);
        exit;
    }

    // 2. LOGIN PENGGUNA
    if ($action === 'login') {
        $email    = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        $stmt = $pdo->prepare("SELECT user_id, nama, email, password_hash, role FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Validasi password_verify atau akun demo mahasiswa123
        $isDemoValid = ($user && $email === 'mahasiswa@financial.local' && $password === 'mahasiswa123');
        $isHashValid = ($user && password_verify($password, $user['password_hash']));

        if (!$user || (!$isHashValid && !$isDemoValid)) {
            http_response_code(401);
            echo json_encode([
                'status'  => 'error',
                'message' => 'Email atau password salah.'
            ]);
            exit;
        }

        $userSession = [
            'user_id' => (int)$user['user_id'],
            'nama'    => $user['nama'],
            'email'   => $user['email'],
            'role'    => $user['role']
        ];
        $_SESSION['user_id'] = (int)$user['user_id'];
        $_SESSION['user']    = $userSession;

        echo json_encode([
            'status'  => 'success',
            'message' => 'Login berhasil!',
            'user'    => $userSession
        ]);
        exit;
    }

    // 3. LOGOUT PENGGUNA
    if ($action === 'logout') {
        session_unset();
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Berhasil keluar.']);
        exit;
    }
}
