<?php
session_start();
require_once 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? (int)($_GET['user_id'] ?? 1);

if ($method === 'GET') {
    $modules = $pdo->query("SELECT * FROM education_modules ORDER BY module_id ASC")->fetchAll();
    $triggers = $pdo->query("SELECT * FROM contextual_triggers ORDER BY trigger_id ASC")->fetchAll();
    $cases = $pdo->query("SELECT * FROM case_studies ORDER BY case_id ASC")->fetchAll();
    foreach ($cases as &$c) {
        $stmtOpt = $pdo->prepare("SELECT * FROM case_options WHERE case_id = ?");
        $stmtOpt->execute([$c['case_id']]);
        $c['options'] = $stmtOpt->fetchAll();
    }

    $questions = $pdo->query("SELECT * FROM quiz_questions ORDER BY question_id ASC")->fetchAll();
    foreach ($questions as &$q) {
        $stmtOpt = $pdo->prepare("SELECT * FROM quiz_options WHERE question_id = ?");
        $stmtOpt->execute([$q['question_id']]);
        $q['options'] = $stmtOpt->fetchAll();
    }

    echo json_encode([
        'status'    => 'success',
        'modules'   => $modules,
        'triggers'  => $triggers,
        'cases'     => $cases,
        'questions' => $questions
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'save_simulation') {
        $stmt = $pdo->prepare("INSERT INTO budget_simulations (user_id, pemasukan, pct_needs, pct_wants, pct_savings) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $input['pemasukan'], $input['pct_needs'], $input['pct_wants'], $input['pct_savings']]);
        echo json_encode(['status' => 'success', 'simulation_id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'save_case_response') {
        $stmt = $pdo->prepare("INSERT INTO user_case_responses (user_id, case_id, option_id) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $input['case_id'], $input['option_id']]);
        echo json_encode(['status' => 'success', 'response_id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($action === 'save_quiz_attempt') {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO quiz_attempts (user_id, module_id, jumlah_soal, jumlah_benar, skor) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $userId,
            $input['module_id'] ?? 1,
            $input['jumlah_soal'],
            $input['jumlah_benar'],
            $input['skor']
        ]);
        $attemptId = $pdo->lastInsertId();

        if (!empty($input['answers']) && is_array($input['answers'])) {
            $stmtAns = $pdo->prepare("INSERT INTO quiz_answers (attempt_id, question_id, option_id) VALUES (?, ?, ?)");
            foreach ($input['answers'] as $ans) {
                $stmtAns->execute([$attemptId, $ans['question_id'], $ans['option_id']]);
            }
        }
        $pdo->commit();
        echo json_encode(['status' => 'success', 'attempt_id' => $attemptId]);
        exit;
    }
}
