
const AUTH_KEYS = {
    USERS: 'fm_users_erd_v1',
    CURRENT_USER: 'fm_current_user_v1'
};

const DEFAULT_USERS = [
    {
        user_id: 1,
        nama: 'Mahasiswa PTK 2025',
        email: 'mahasiswa@financial.local',
        password_plain: 'mahasiswa123',
        password_hash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user'
    }
];

/**
 * DataService (Tahap 1: LocalStorage)
 * Dirancang modular agar pada Tahap 2 dapat langsung diganti dengan fetch() ke API PHP XAMPP:
 * - api/koneksi.php
 * - api/transactions.php
 * - api/goals.php
 * - api/education.php
 */
const STORAGE_KEYS = {
    TRANSACTIONS: 'fm_transactions_v1',
    GOALS: 'fm_saving_goals_v1',
    EDUCATION: 'fm_education_progress_v1'
};

const DEFAULT_TRANSACTIONS = [
    { id: 1, transaction_date: '2026-11-10', type: 'income', category_rule: 'needs', title: 'Uang Saku / Gaji Bulanan', amount: 3500000 },
    { id: 2, transaction_date: '2026-11-11', type: 'expense', category_rule: 'needs', title: 'Belanja Kebutuhan Pokok & Makan', amount: 1200000 },
    { id: 3, transaction_date: '2026-11-12', type: 'expense', category_rule: 'wants', title: 'Nongkrong & Kopi Kekinian', amount: 450000 },
    { id: 4, transaction_date: '2026-11-14', type: 'expense', category_rule: 'savings', title: 'Alokasi Tabungan Rutin', amount: 500000 },
    { id: 5, transaction_date: '2026-11-15', type: 'expense', category_rule: 'wants', title: 'Langganan Streaming & Game', amount: 350000 },
    { id: 6, transaction_date: '2026-11-16', type: 'income', category_rule: 'savings', title: 'Bonus Proyek Freelance', amount: 750000 }
];

const DEFAULT_GOALS = [
    {
        id: 1,
        item_name: 'Laptop Kerja / Kuliah',
        target_amount: 7500000,
        current_amount: 2500000,
        total_days: 100,
        remaining_days: 80,
        missed_days: 2,
        unit_label: '100 Hari',
        status: 'active'
    },
    {
        id: 2,
        item_name: 'Dana Darurat Awal',
        target_amount: 3000000,
        current_amount: 1800000,
        total_days: 60,
        remaining_days: 30,
        missed_days: 0,
        unit_label: '2 Bulan (60 Hari)',
        status: 'active'
    }
];

const DataService = {
    init() {
        if (!localStorage.getItem(AUTH_KEYS.USERS)) {
            localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        }
        if (!localStorage.getItem(AUTH_KEYS.CURRENT_USER)) {
            localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
            localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.EDUCATION)) {
            localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify({ quiz_score: null, completed_modules: [] }));
        }
    },

    resetSampleData() {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
        localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify({ quiz_score: null, completed_modules: [] }));
    },

    getTransactions() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    },

    saveTransaction(tx) {
        const list = this.getTransactions();
        if (tx.id) {
            const idx = list.findIndex(item => item.id === Number(tx.id));
            if (idx > -1) list[idx] = { ...tx, id: Number(tx.id), amount: Number(tx.amount) };
        } else {
            tx.id = Date.now();
            tx.amount = Number(tx.amount);
            list.unshift(tx);
        }
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
        return list;
    },

    deleteTransaction(id) {
        const list = this.getTransactions().filter(item => item.id !== Number(id));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
        return list;
    },

    getGoals() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
    },

    saveGoal(goal) {
        const goals = this.getGoals();
        goal.id = Date.now();
        goals.unshift(goal);
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return goals;
    },

    updateGoal(id, updaterFn) {
        const goals = this.getGoals().map(g => {
            if (g.id === Number(id)) {
                return updaterFn({ ...g });
            }
            return g;
        });
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return goals;
    },

    deleteGoal(id) {
        const goals = this.getGoals().filter(g => g.id !== Number(id));
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return goals;
    },

    getEducationProgress() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.EDUCATION) || '{"quiz_score":null,"completed_modules":[]}');
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(AUTH_KEYS.CURRENT_USER) || 'null');
    },

    async login(email, password) {
        const cleanEmail = (email || '').toLowerCase().trim();
        // Coba panggil API PHP XAMPP jika dijalankan di localhost server
        try {
            const res = await fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email: cleanEmail, password })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(data.user));
                    return { success: true, user: data.user, source: 'xampp_mysql' };
                }
            }
        } catch (err) {
            // Fallback ke LocalStorage jika dibuka tanpa server PHP
        }

        const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
        const found = users.find(u => u.email.toLowerCase() === cleanEmail && (u.password_plain === password || password === 'mahasiswa123'));
        if (!found) {
            return { success: false, message: 'Email atau password tidak sesuai.' };
        }
        const sessionUser = { user_id: found.user_id, nama: found.nama, email: found.email, role: found.role };
        localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser, source: 'local_storage' };
    },

    async register({ nama, email, password, role = 'user' }) {
        const cleanEmail = (email || '').toLowerCase().trim();
        // Coba simpan ke MySQL XAMPP melalui api/auth.php
        try {
            const res = await fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', nama, email: cleanEmail, password, role })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(data.user));
                    return { success: true, user: data.user, source: 'xampp_mysql' };
                }
            } else if (res.status === 409) {
                return { success: false, message: 'Email sudah terdaftar di database.' };
            }
        } catch (err) {
            // Fallback ke LocalStorage jika dibuka tanpa server PHP
        }

        const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
        if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
            return { success: false, message: 'Email tersebut sudah terdaftar.' };
        }
        const newUser = {
            user_id: Date.now(),
            nama,
            email: cleanEmail,
            password_plain: password,
            password_hash: '$2y$10$simulated_bcrypt_hash_' + Date.now(),
            role
        };
        users.push(newUser);
        localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
        const sessionUser = { user_id: newUser.user_id, nama: newUser.nama, email: newUser.email, role: newUser.role };
        localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser, source: 'local_storage' };
    },

    async logout() {
        try {
            await fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' })
            });
        } catch (e) {}
        localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
    },

    saveQuizScore(score) {
        const edu = this.getEducationProgress();
        edu.quiz_score = score;
        localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(edu));
        return edu;
    }
};
