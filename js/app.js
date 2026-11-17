// Main Application Logic (Skills 1, 2, and 3)
let cashflowChartInstance = null;
let ruleChartInstance = null;
let currentPeriod = 'bulanan';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number || 0);
};

// Navigation Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Period Filtering Logic (Skill 2: Harian, Mingguan, Bulanan)
function filterTransactionsByPeriod(transactions, period, referenceDateStr) {
    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date('2026-11-16');
    return transactions.filter(tx => {
        const txDate = new Date(tx.transaction_date);
        if (period === 'harian') {
            return tx.transaction_date === (referenceDateStr || '2026-11-16');
        } else if (period === 'mingguan') {
            const diffTime = refDate - txDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= 7;
        } else {
            // Bulanan
            return txDate.getMonth() === refDate.getMonth() && txDate.getFullYear() === refDate.getFullYear();
        }
    });
}

function setPeriodFilter(period) {
    currentPeriod = period;
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });
    renderAll();
}

// Render Summary, Charts, and Contextual Education Triggers
function renderDashboard() {
    const allTx = DataService.getTransactions();
    const refDate = document.getElementById('filter-date')?.value || '2026-11-16';
    const filteredTx = filterTransactionsByPeriod(allTx, currentPeriod, refDate);

    let totalIncome = 0;
    let totalExpense = 0;
    let needsTotal = 0;
    let wantsTotal = 0;
    let savingsTotal = 0;

    filteredTx.forEach(tx => {
        const amt = Number(tx.amount);
        if (tx.type === 'income') {
            totalIncome += amt;
        } else {
            totalExpense += amt;
            if (tx.category_rule === 'needs') needsTotal += amt;
            if (tx.category_rule === 'wants') wantsTotal += amt;
            if (tx.category_rule === 'savings') savingsTotal += amt;
        }
    });

    const balance = totalIncome - totalExpense;

    // Update Summary Cards
    document.getElementById('card-balance').textContent = formatRupiah(balance);
    document.getElementById('card-income').textContent = formatRupiah(totalIncome);
    document.getElementById('card-expense').textContent = formatRupiah(totalExpense);
    document.getElementById('card-savings').textContent = formatRupiah(savingsTotal);

    // Update Charts (Skill 1)
    updateCharts(totalIncome, totalExpense, needsTotal, wantsTotal, savingsTotal);

    // Update Contextual Education Triggers (Skill 3)
    renderContextualRecommendations(totalIncome, totalExpense, needsTotal, wantsTotal, savingsTotal);
}

function updateCharts(income, expense, needs, wants, savings) {
    const ctxCashflow = document.getElementById('cashflowChart').getContext('2d');
    if (cashflowChartInstance) cashflowChartInstance.destroy();
    cashflowChartInstance = new Chart(ctxCashflow, {
        type: 'bar',
        data: {
            labels: ['Pemasukan', 'Pengeluaran', 'Tabungan Terkumpul'],
            datasets: [{
                label: `Periode: ${currentPeriod.toUpperCase()}`,
                data: [income, expense, savings],
                backgroundColor: ['#10B981', '#EF4444', '#3B82F6'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    const ctxRule = document.getElementById('ruleChart').getContext('2d');
    if (ruleChartInstance) ruleChartInstance.destroy();
    const totalAlloc = needs + wants + savings;
    ruleChartInstance = new Chart(ctxRule, {
        type: 'doughnut',
        data: {
            labels: ['Kebutuhan (Target 50%)', 'Keinginan (Target 30%)', 'Tabungan (Target 20%)'],
            datasets: [{
                data: totalAlloc > 0 ? [needs, wants, savings] : [50, 30, 20],
                backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Update 50/30/20 percentage badges
    const base = income > 0 ? income : (totalAlloc > 0 ? totalAlloc : 1);
    const pNeeds = Math.round((needs / base) * 100);
    const pWants = Math.round((wants / base) * 100);
    const pSavings = Math.round((savings / base) * 100);

    document.getElementById('badge-needs').textContent = `${pNeeds}% (Aktual) vs 50% (Ideal)`;
    document.getElementById('badge-wants').textContent = `${pWants}% (Aktual) vs 30% (Ideal)`;
    document.getElementById('badge-savings').textContent = `${pSavings}% (Aktual) vs 20% (Ideal)`;
}

// Skill 3: Contextual Trigger System
function renderContextualRecommendations(income, expense, needs, wants, savings) {
    const container = document.getElementById('contextual-edu-alerts');
    const alerts = [];
    const base = income > 0 ? income : 1;
    const wantsRatio = (wants / base) * 100;
    const savingsRatio = (savings / base) * 100;
    const goals = DataService.getGoals();
    const hasDelayedGoal = goals.some(g => g.missed_days > 0);

    if (expense > income && expense > 0) {
        alerts.push({
            color: 'border-red-500 bg-red-50 text-red-900',
            badge: 'PERINGATAN DEFISIT',
            title: 'Strategi Menghentikan Kebocoran Uang & Evaluasi Pengeluaran',
            desc: 'Pengeluaran Anda pada periode ini melebihi pemasukan. Segera audit pos pengeluaran non-esensial dan terapkan aturan tunggu 24 jam sebelum membeli barang.'
        });
    }

    if (wantsRatio > 30) {
        alerts.push({
            color: 'border-amber-500 bg-amber-50 text-amber-900',
            badge: `POS KEINGINAN ${Math.round(wantsRatio)}% (>30%)`,
            title: 'Cara Membedakan Kebutuhan vs Keinginan & Mengatasi Impulsive Buying',
            desc: 'Alokasi keinginan Anda melampaui batas ideal 30%. Gunakan metode skala prioritas agar dana tabungan tidak tergerus.'
        });
    }

    if ((income > 0 && savingsRatio < 20) || hasDelayedGoal) {
        alerts.push({
            color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
            badge: hasDelayedGoal ? 'TARGET BARANG TERLAMBAT' : 'TABUNGAN < 20%',
            title: 'Tips Menabung Konsisten dengan Metode Pay Yourself First',
            desc: 'Sisihkan minimal 20% uang di awal saat menerima pemasukan (bukan menunggu sisa uang di akhir bulan) agar target barang tercapai tepat waktu.'
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            color: 'border-blue-500 bg-blue-50 text-blue-900',
            badge: 'KONDISI SEHAT',
            title: 'Arus Kas & Rasio 50/30/20 Anda Terkendali!',
            desc: 'Pertahankan kedisiplinan mencatat keuangan dan uji pemahaman Anda melalui Kuis Literasi Finansial di menu Edukasi Interaktif.'
        });
    }

    container.innerHTML = alerts.map(a => `
        <div class="border-l-4 ${a.color} p-4 rounded-r-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-white/80 uppercase tracking-wider">${a.badge}</span>
                <h4 class="font-bold text-base mt-1">${a.title}</h4>
                <p class="text-sm opacity-90">${a.desc}</p>
            </div>
            <button onclick="switchTab('edukasi')" class="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition">
                Pelajari Modul &rarr;
            </button>
        </div>
    `).join('');
}

// Skill 2: Transaction History & Multi-Period Report Table
function renderTransactionsTable() {
    const allTx = DataService.getTransactions();
    const refDate = document.getElementById('filter-date')?.value || '2026-11-16';
    const searchKeyword = (document.getElementById('search-tx')?.value || '').toLowerCase();
    const filterType = document.getElementById('filter-type')?.value || 'all';

    const periodFiltered = filterTransactionsByPeriod(allTx, currentPeriod, refDate);
    const finalFiltered = periodFiltered.filter(tx => {
        const matchSearch = tx.title.toLowerCase().includes(searchKeyword);
        const matchType = filterType === 'all' || tx.type === filterType;
        return matchSearch && matchType;
    });

    let sumIn = 0;
    let sumOut = 0;
    finalFiltered.forEach(t => {
        if (t.type === 'income') sumIn += Number(t.amount);
        else sumOut += Number(t.amount);
    });

    document.getElementById('report-summary-in').textContent = formatRupiah(sumIn);
    document.getElementById('report-summary-out').textContent = formatRupiah(sumOut);
    document.getElementById('report-summary-net').textContent = formatRupiah(sumIn - sumOut);

    const tbody = document.getElementById('tx-table-body');
    if (finalFiltered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">Tidak ada transaksi pada filter periode ini.</td></tr>`;
        return;
    }

    const categoryBadge = {
        needs: '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Kebutuhan (50%)</span>',
        wants: '<span class="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">Keinginan (30%)</span>',
        savings: '<span class="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">Tabungan (20%)</span>'
    };

    tbody.innerHTML = finalFiltered.map(tx => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="py-3 px-4 text-sm text-slate-600">${tx.transaction_date}</td>
            <td class="py-3 px-4 font-medium text-slate-800">${tx.title}</td>
            <td class="py-3 px-4">
                ${tx.type === 'income'
                    ? '<span class="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">Pemasukan</span>'
                    : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">Pengeluaran</span>'}
            </td>
            <td class="py-3 px-4">${categoryBadge[tx.category_rule] || '-'}</td>
            <td class="py-3 px-4 font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}">
                ${tx.type === 'income' ? '+' : '-'} ${formatRupiah(tx.amount)}
            </td>
            <td class="py-3 px-4 text-right space-x-2">
                <button onclick="editTransaction(${tx.id})" class="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                <button onclick="removeTransaction(${tx.id})" class="text-xs text-red-600 hover:underline font-medium">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('tx-id').value;
    const transaction_date = document.getElementById('tx-date').value;
    const title = document.getElementById('tx-title').value.trim();
    const type = document.getElementById('tx-type').value;
    const category_rule = document.getElementById('tx-category').value;
    const amount = Number(document.getElementById('tx-amount').value);

    if (!title || amount <= 0) return;

    DataService.saveTransaction({ id: id ? Number(id) : null, transaction_date, title, type, category_rule, amount });
    resetTransactionForm();
    renderAll();
}

function editTransaction(id) {
    const tx = DataService.getTransactions().find(t => t.id === Number(id));
    if (!tx) return;
    document.getElementById('tx-id').value = tx.id;
    document.getElementById('tx-date').value = tx.transaction_date;
    document.getElementById('tx-title').value = tx.title;
    document.getElementById('tx-type').value = tx.type;
    document.getElementById('tx-category').value = tx.category_rule;
    document.getElementById('tx-amount').value = tx.amount;
    document.getElementById('tx-submit-btn').textContent = 'Perbarui Transaksi';
    switchTab('laporan');
}

function resetTransactionForm() {
    document.getElementById('tx-id').value = '';
    document.getElementById('tx-date').value = '2026-11-16';
    document.getElementById('tx-title').value = '';
    document.getElementById('tx-type').value = 'expense';
    document.getElementById('tx-category').value = 'needs';
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-submit-btn').textContent = '+ Simpan Transaksi';
}

function removeTransaction(id) {
    DataService.deleteTransaction(id);
    renderAll();
}

// Skill 2: Dynamic Saving Goals Calculator & Auto-Recalculate
function calculateLiveGoalPreview() {
    const target = Number(document.getElementById('goal-target').value) || 0;
    const current = Number(document.getElementById('goal-current').value) || 0;
    const duration = Number(document.getElementById('goal-duration').value) || 1;
    const unit = document.getElementById('goal-unit').value;

    let totalDays = duration;
    if (unit === 'minggu') totalDays = duration * 7;
    if (unit === 'bulan') totalDays = duration * 30;

    const remainingAmount = Math.max(0, target - current);
    const dailySaving = totalDays > 0 ? Math.ceil(remainingAmount / totalDays) : 0;

    document.getElementById('goal-preview-days').textContent = `${totalDays} Hari`;
    document.getElementById('goal-preview-daily').textContent = `${formatRupiah(dailySaving)} / hari`;
}

function handleGoalSubmit(e) {
    e.preventDefault();
    const item_name = document.getElementById('goal-name').value.trim();
    const target_amount = Number(document.getElementById('goal-target').value);
    const current_amount = Number(document.getElementById('goal-current').value) || 0;
    const duration = Number(document.getElementById('goal-duration').value);
    const unit = document.getElementById('goal-unit').value;

    if (!item_name || target_amount <= 0 || duration <= 0) return;

    let total_days = duration;
    if (unit === 'minggu') total_days = duration * 7;
    if (unit === 'bulan') total_days = duration * 30;

    DataService.saveGoal({
        item_name,
        target_amount,
        current_amount,
        total_days,
        remaining_days: total_days,
        missed_days: 0,
        unit_label: `${duration} ${unit.charAt(0).toUpperCase() + unit.slice(1)} (${total_days} Hari)`,
        status: current_amount >= target_amount ? 'completed' : 'active'
    });

    document.getElementById('goal-form').reset();
    calculateLiveGoalPreview();
    renderAll();
}

function depositToGoal(id) {
    const goals = DataService.getGoals();
    const g = goals.find(item => item.id === Number(id));
    if (!g) return;

    const remainingMoney = Math.max(0, g.target_amount - g.current_amount);
    const suggestedDaily = g.remaining_days > 0 ? Math.ceil(remainingMoney / g.remaining_days) : remainingMoney;

    const input = prompt(`Masukkan nominal setoran tabungan untuk "${g.item_name}" (Rekomendasi harian: Rp ${suggestedDaily}):`, suggestedDaily);
    if (input === null) return;
    const amount = Number(input);
    if (isNaN(amount) || amount <= 0) return;

    DataService.updateGoal(id, (goal) => {
        goal.current_amount = Math.min(goal.target_amount, goal.current_amount + amount);
        goal.remaining_days = Math.max(0, goal.remaining_days - 1);
        if (goal.current_amount >= goal.target_amount) goal.status = 'completed';
        return goal;
    });

    // Catat otomatis ke riwayat transaksi sebagai alokasi tabungan
    DataService.saveTransaction({
        transaction_date: '2026-11-16',
        title: `Setoran Tabungan: ${g.item_name}`,
        type: 'expense',
        category_rule: 'savings',
        amount: amount
    });

    renderAll();
}

function simulateMissedDay(id) {
    DataService.updateGoal(id, (goal) => {
        if (goal.remaining_days > 1) {
            goal.remaining_days -= 1;
            goal.missed_days = (goal.missed_days || 0) + 1;
        }
        return goal;
    });
    renderAll();
}

function removeGoal(id) {
    DataService.deleteGoal(id);
    renderAll();
}

function renderGoals() {
    const goals = DataService.getGoals();
    const container = document.getElementById('goals-container');

    if (goals.length === 0) {
        container.innerHTML = `<div class="col-span-full bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">Belum ada target barang. Silakan tambahkan melalui kalkulator di atas.</div>`;
        return;
    }

    container.innerHTML = goals.map(g => {
        const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
        const remainingMoney = Math.max(0, g.target_amount - g.current_amount);
        const dailyRequired = g.remaining_days > 0 ? Math.ceil(remainingMoney / g.remaining_days) : remainingMoney;
        const initialDaily = g.total_days > 0 ? Math.ceil(g.target_amount / g.total_days) : dailyRequired;

        return `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between gap-4">
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${percent >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}">
                                ${percent >= 100 ? 'Tercapai!' : `Tenggat Awal: ${g.unit_label}`}
                            </span>
                            <h3 class="text-lg font-bold text-slate-800 mt-2">${g.item_name}</h3>
                        </div>
                        <button onclick="removeGoal(${g.id})" class="text-xs text-slate-400 hover:text-red-600">Hapus</button>
                    </div>

                    <div class="mt-4">
                        <div class="flex justify-between text-sm font-medium mb-1">
                            <span class="text-emerald-600 font-bold">${formatRupiah(g.current_amount)}</span>
                            <span class="text-slate-500">dari ${formatRupiah(g.target_amount)} (${percent}%)</span>
                        </div>
                        <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: ${percent}%"></div>
                        </div>
                    </div>

                    <div class="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-sm space-y-1.5">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Kekurangan Dana:</span>
                            <span class="font-semibold text-slate-800">${formatRupiah(remainingMoney)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Sisa Waktu:</span>
                            <span class="font-semibold text-slate-800">${g.remaining_days} Hari lagi</span>
                        </div>
                        <div class="flex justify-between items-center pt-1 border-t border-slate-200">
                            <span class="text-slate-700 font-medium">Wajib Disisihkan / Hari:</span>
                            <span class="text-base font-extrabold text-emerald-600">${formatRupiah(dailyRequired)}</span>
                        </div>
                        ${g.missed_days > 0 ? `
                            <p class="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                                <strong>Auto-Recalculate Aktif:</strong> Anda melewatkan <strong>${g.missed_days} hari</strong> menabung. Beban harian disesuaikan otomatis dari ${formatRupiah(initialDaily)} menjadi <strong>${formatRupiah(dailyRequired)}/hari</strong> (atau mundurkan tenggat ${g.missed_days} hari).
                            </p>
                        ` : ''}
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 pt-2">
                    <button onclick="depositToGoal(${g.id})" ${percent >= 100 ? 'disabled' : ''} class="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition">
                        + Setor Tabungan Hari Ini
                    </button>
                    <button onclick="simulateMissedDay(${g.id})" ${percent >= 100 ? 'disabled' : ''} class="bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition" title="Simulasikan jika hari ini lupa menabung">
                        Simulasi Absen 1 Hari
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Skill 3: Interactive 50/30/20 Simulator, Case Study, and Quiz
function updateInteractiveSimulator() {
    const income = Number(document.getElementById('sim-income').value) || 0;
    const pNeeds = Number(document.getElementById('sim-slider-needs').value);
    const pWants = Number(document.getElementById('sim-slider-wants').value);
    const pSavings = Math.max(0, 100 - pNeeds - pWants);

    document.getElementById('sim-label-needs').textContent = `${pNeeds}%`;
    document.getElementById('sim-label-wants').textContent = `${pWants}%`;
    document.getElementById('sim-label-savings').textContent = `${pSavings}%`;

    document.getElementById('sim-val-needs').textContent = formatRupiah((income * pNeeds) / 100);
    document.getElementById('sim-val-wants').textContent = formatRupiah((income * pWants) / 100);
    document.getElementById('sim-val-savings').textContent = formatRupiah((income * pSavings) / 100);

    const feedbackEl = document.getElementById('sim-feedback');
    if (pNeeds + pWants > 100) {
        feedbackEl.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-200';
        feedbackEl.textContent = 'Total Kebutuhan + Keinginan melebihi 100%! Anda tidak memiliki ruang untuk Tabungan dan berisiko berutang.';
    } else if (pSavings < 20) {
        feedbackEl.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200';
        feedbackEl.textContent = `Porsi tabungan Anda baru ${pSavings}%. Cobalah kurangi keinginan agar tabungan mencapai minimal 20%.`;
    } else {
        feedbackEl.className = 'mt-3 p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200';
        feedbackEl.textContent = `Komposisi sangat sehat! Anda menyisihkan ${pSavings}% (${formatRupiah((income * pSavings) / 100)}) untuk masa depan & target barang.`;
    }
}

function chooseCaseStudy(option) {
    const box = document.getElementById('case-study-result');
    box.classList.remove('hidden');
    if (option === 'A') {
        box.className = 'mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm';
        box.innerHTML = `
            <strong>Dampak Pilihan A (Beli Sepatu Diskon Rp 450.000 Sekarang):</strong><br>
            Saldo darurat Anda berkurang drastis. Saat minggu depan laptop Anda butuh servis mendadak Rp 300.000, Anda terpaksa berutang atau mengambil jatah makan harian. Ini adalah contoh <em>Impulsive Buying</em> karena tergiur label diskon.
        `;
    } else {
        box.className = 'mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm';
        box.innerHTML = `
            <strong>Dampak Pilihan B (Tahan Diri & Masukkan ke Pos Tabungan Barang):</strong><br>
            Keputusan tepat! Anda menerapkan prinsip <em>Delayed Gratification</em> (menunda kesenangan sesaat). Saldo tetap aman untuk kebutuhan kuliah/kerja, dan jika sepatu tersebut memang benar-benar dibutuhkan, Anda bisa membelinya bulan depan lewat Kalkulator Target Barang tanpa mengganggu arus kas.
        `;
    }
}

const QUIZ_QUESTIONS = [
    {
        q: "1. Dalam metode pengelolaan keuangan 50/30/20, berapakah porsi minimal yang disarankan untuk Tabungan & Investasi?",
        options: ["10% dari pemasukan", "20% dari pemasukan", "50% dari pemasukan"],
        correct: 1,
        explanation: "Metode 50/30/20 membagi uang menjadi 50% Kebutuhan Pokok, 30% Keinginan, dan 20% Tabungan/Investasi."
    },
    {
        q: "2. Apa yang dimaksud dengan prinsip 'Pay Yourself First' dalam menabung?",
        options: [
            "Membeli barang keinginan sendiri terlebih dahulu baru menabung sisanya",
            "Menyisihkan uang tabungan langsung di awal saat menerima gaji/uang saku",
            "Meminjam uang teman untuk ditabung"
        ],
        correct: 1,
        explanation: "Pay Yourself First berarti mengamankan persentase tabungan tepat saat uang diterima, bukan menunggu sisa uang di akhir bulan."
    },
    {
        q: "3. Jika Anda ingin membeli barang seharga Rp 1.500.000 dalam waktu 1 Bulan (30 hari) dan saat ini sudah terkumpul Rp 300.000, berapa uang yang wajib disisihkan per hari?",
        options: ["Rp 30.000 / hari", "Rp 40.000 / hari", "Rp 50.000 / hari"],
        correct: 1,
        explanation: "Kekurangan dana = Rp 1.500.000 - Rp 300.000 = Rp 1.200.000. Dibagi 30 hari = Rp 40.000 per hari."
    }
];

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = QUIZ_QUESTIONS.map((item, qIdx) => `
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p class="font-semibold text-slate-800 text-sm">${item.q}</p>
            <div class="space-y-1.5">
                ${item.options.map((opt, oIdx) => `
                    <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-white">
                        <input type="radio" name="quiz_q_${qIdx}" value="${oIdx}" onchange="checkSingleQuizAnswer(${qIdx}, ${oIdx})" class="text-blue-600">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
            <div id="quiz-feedback-${qIdx}" class="hidden text-xs p-2.5 rounded-lg mt-2"></div>
        </div>
    `).join('');
}

function checkSingleQuizAnswer(qIdx, selectedIdx) {
    const item = QUIZ_QUESTIONS[qIdx];
    const fb = document.getElementById(`quiz-feedback-${qIdx}`);
    fb.classList.remove('hidden');
    if (selectedIdx === item.correct) {
        fb.className = 'text-xs p-2.5 rounded-lg mt-2 bg-emerald-100 text-emerald-900 font-medium';
        fb.innerHTML = `✅ <strong>Benar!</strong> ${item.explanation}`;
    } else {
        fb.className = 'text-xs p-2.5 rounded-lg mt-2 bg-red-100 text-red-900 font-medium';
        fb.innerHTML = `❌ <strong>Kurang Tepat.</strong> ${item.explanation}`;
    }
    calculateTotalQuizScore();
}

function calculateTotalQuizScore() {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((item, qIdx) => {
        const checked = document.querySelector(`input[name="quiz_q_${qIdx}"]:checked`);
        if (checked && Number(checked.value) === item.correct) {
            correctCount++;
        }
    });
    const score = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);
    DataService.saveQuizScore(score);
    document.getElementById('quiz-score-badge').textContent = `Skor Kuis: ${score}/100`;
}

function resetAllSampleData() {
    DataService.resetSampleData();
    renderAll();
}


// Authentication UI & Session Handlers (Tabel `users` ERD)
function renderUserProfileHeader() {
    const user = DataService.getCurrentUser();
    const nameEl = document.getElementById('nav-user-name');
    const emailEl = document.getElementById('nav-user-email');
    const roleEl = document.getElementById('nav-user-role');
    if (!nameEl) return;

    if (user) {
        nameEl.textContent = user.nama;
        emailEl.textContent = user.email;
        roleEl.textContent = user.role || 'user';
    } else {
        nameEl.textContent = 'Tamu (Belum Login)';
        emailEl.textContent = 'Klik Akun untuk Masuk';
        roleEl.textContent = 'guest';
    }
}

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function switchModalAuthTab(mode) {
    const alertBox = document.getElementById('modal-auth-alert');
    if (alertBox) alertBox.classList.add('hidden');
    const fLogin = document.getElementById('modal-form-login');
    const fReg = document.getElementById('modal-form-register');
    const bLogin = document.getElementById('modal-tab-login');
    const bReg = document.getElementById('modal-tab-register');

    if (mode === 'login') {
        fLogin.classList.remove('hidden');
        fReg.classList.add('hidden');
        bLogin.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white';
        bReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-600';
    } else {
        fLogin.classList.add('hidden');
        fReg.classList.remove('hidden');
        bReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white';
        bLogin.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-600';
    }
}

async function submitModalLogin(e) {
    e.preventDefault();
    const email = document.getElementById('modal-login-email').value;
    const pass = document.getElementById('modal-login-password').value;
    const res = await DataService.login(email, pass);
    const alertBox = document.getElementById('modal-auth-alert');
    alertBox.classList.remove('hidden');

    if (res.success) {
        alertBox.className = 'mb-3 p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
        alertBox.textContent = `Selamat datang kembali, ${res.user.nama}!`;
        renderUserProfileHeader();
        setTimeout(() => closeAuthModal(), 600);
    } else {
        alertBox.className = 'mb-3 p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
        alertBox.textContent = res.message || 'Gagal masuk.';
    }
}

async function submitModalRegister(e) {
    e.preventDefault();
    const nama = document.getElementById('modal-reg-nama').value;
    const email = document.getElementById('modal-reg-email').value;
    const password = document.getElementById('modal-reg-password').value;
    const role = document.getElementById('modal-reg-role').value;

    const res = await DataService.register({ nama, email, password, role });
    const alertBox = document.getElementById('modal-auth-alert');
    alertBox.classList.remove('hidden');

    if (res.success) {
        alertBox.className = 'mb-3 p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
        alertBox.textContent = `Akun ${res.user.nama} (${res.user.role}) berhasil dibuat & aktif!`;
        renderUserProfileHeader();
        setTimeout(() => closeAuthModal(), 700);
    } else {
        alertBox.className = 'mb-3 p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
        alertBox.textContent = res.message || 'Gagal mendaftar.';
    }
}

async function handleLogoutClick(e) {
    e.preventDefault();
    await DataService.logout();
    window.location.href = 'login.html';
}

function renderAll() {
    renderUserProfileHeader();
    renderDashboard();
    renderTransactionsTable();
    renderGoals();
}

document.addEventListener('DOMContentLoaded', () => {
    DataService.init();
    renderQuiz();
    updateInteractiveSimulator();
    calculateLiveGoalPreview();
    renderAll();
});
