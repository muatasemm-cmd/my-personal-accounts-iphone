(function () {
    const CACHE_RESET_KEY = "personalaccounts.iphone.cache-reset.v6";

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
            ensureFreshCache().finally(function () {
                navigator.serviceWorker.register("./service-worker.js?v=6").catch(function () { });
            });
        });
    }

    const STORAGE_KEY = "personalaccounts.iphone.v1";
    const DEFAULT_STATE = {
        profile: {
            deviceName: "",
            currency: "₪",
            monthlyBudget: 0,
            savingGoal: 0,
            passcode: "",
            safeMode: false,
            hideNumbers: false
        },
        incomes: [],
        expenses: [],
        debts: [],
        commitments: []
    };

    const state = loadState();
    const refs = {
        appMain: document.getElementById("appMain"),
        privacyScreen: document.getElementById("privacyScreen"),
        unlockForm: document.getElementById("unlockForm"),
        unlockCode: document.getElementById("unlockCode"),
        unlockError: document.getElementById("unlockError"),
        deviceTitle: document.getElementById("deviceTitle"),
        monthBalanceValue: document.getElementById("monthBalanceValue"),
        todayExpenseValue: document.getElementById("todayExpenseValue"),
        dueSoonValue: document.getElementById("dueSoonValue"),
        netDebtValue: document.getElementById("netDebtValue"),
        todayAlert: document.getElementById("todayAlert"),
        recentOperations: document.getElementById("recentOperations"),
        upcomingCommitments: document.getElementById("upcomingCommitments"),
        moneyEntries: document.getElementById("moneyEntries"),
        debtEntries: document.getElementById("debtEntries"),
        debtSummary: document.getElementById("debtSummary"),
        commitmentEntries: document.getElementById("commitmentEntries"),
        setupHelper: document.getElementById("setupHelper"),
        toast: document.getElementById("toastMessage"),
        backupStatus: document.getElementById("backupStatus"),
        safeModeToggle: document.getElementById("safeModeToggle"),
        hideNumbersToggle: document.getElementById("hideNumbersToggle"),
        budgetUsagePercent: document.getElementById("budgetUsagePercent"),
        budgetUsageBar: document.getElementById("budgetUsageBar"),
        budgetUsageHint: document.getElementById("budgetUsageHint"),
        savingUsagePercent: document.getElementById("savingUsagePercent"),
        savingUsageBar: document.getElementById("savingUsageBar"),
        savingUsageHint: document.getElementById("savingUsageHint"),
        startSetupButton: document.getElementById("startSetupButton")
    };

    let unlocked = !state.profile.passcode || !state.profile.safeMode;
    let toastTimer = null;
    let currentLogFilter = "all";

    bind();
    seedDates();
    render();

    function ensureFreshCache() {
        if (sessionStorage.getItem(CACHE_RESET_KEY) === "done") {
            return Promise.resolve();
        }

        sessionStorage.setItem(CACHE_RESET_KEY, "done");

        const unregisterPromise = "serviceWorker" in navigator
            ? navigator.serviceWorker.getRegistrations().then((registrations) =>
                Promise.all(registrations.map((registration) => registration.unregister()))
            ).catch(function () { })
            : Promise.resolve();

        const cachePromise = "caches" in window
            ? caches.keys().then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key.indexOf("personalaccounts-iphone") !== -1)
                        .map((key) => caches.delete(key))
                )
            ).catch(function () { })
            : Promise.resolve();

        return Promise.all([unregisterPromise, cachePromise]);
    }

    function bind() {
        document.querySelectorAll("[data-panel-target]").forEach((button) => {
            button.addEventListener("click", () => switchPanel(button.getAttribute("data-panel-target")));
        });

        document.querySelectorAll("[data-money-tab]").forEach((button) => {
            button.addEventListener("click", () => switchMoneyTab(button.getAttribute("data-money-tab")));
        });

        document.querySelectorAll("[data-log-filter]").forEach((button) => {
            button.addEventListener("click", () => switchLogFilter(button.getAttribute("data-log-filter")));
        });

        document.querySelectorAll("[data-quick-panel]").forEach((button) => {
            button.addEventListener("click", () => {
                const panel = button.getAttribute("data-quick-panel");
                switchPanel(panel);
                const moneyTab = button.getAttribute("data-quick-money-tab");
                if (moneyTab) {
                    switchMoneyTab(moneyTab);
                }
            });
        });

        document.getElementById("expenseForm").addEventListener("submit", onExpenseSubmit);
        document.getElementById("incomeForm").addEventListener("submit", onIncomeSubmit);
        document.getElementById("debtForm").addEventListener("submit", onDebtSubmit);
        document.getElementById("commitmentForm").addEventListener("submit", onCommitmentSubmit);
        document.getElementById("planForm").addEventListener("submit", onPlanSubmit);
        document.getElementById("exportBackupButton").addEventListener("click", exportBackup);
        document.getElementById("importBackupInput").addEventListener("change", importBackup);
        document.getElementById("resetDeviceButton").addEventListener("click", resetDevice);
        document.getElementById("lockDeviceButton").addEventListener("click", lockNow);
        document.getElementById("installHintButton").addEventListener("click", showInstallHint);
        refs.startSetupButton.addEventListener("click", startSetup);
        refs.safeModeToggle.addEventListener("click", toggleSafeMode);
        refs.hideNumbersToggle.addEventListener("click", toggleHideNumbers);
        refs.unlockForm.addEventListener("submit", unlock);
    }

    function seedDates() {
        const today = dateValue(new Date());
        ["expenseDate", "incomeDate", "debtDate", "commitmentDate"].forEach((id) => {
            const element = document.getElementById(id);
            if (element && !element.value) element.value = today;
        });
    }

    function onExpenseSubmit(event) {
        event.preventDefault();
        state.expenses.unshift({
            id: crypto.randomUUID(),
            title: value("expenseTitle"),
            amount: amount("expenseAmount"),
            date: value("expenseDate"),
            category: value("expenseCategory"),
            note: value("expenseNote"),
            createdAt: new Date().toISOString()
        });
        saveState();
        event.target.reset();
        seedDates();
        toast("تم حفظ المصروف.");
        render();
    }

    function onIncomeSubmit(event) {
        event.preventDefault();
        state.incomes.unshift({
            id: crypto.randomUUID(),
            title: value("incomeTitle"),
            amount: amount("incomeAmount"),
            date: value("incomeDate"),
            category: value("incomeCategory"),
            note: value("incomeNote"),
            createdAt: new Date().toISOString()
        });
        saveState();
        event.target.reset();
        seedDates();
        toast("تم حفظ الدخل.");
        render();
    }

    function onDebtSubmit(event) {
        event.preventDefault();
        state.debts.unshift({
            id: crypto.randomUUID(),
            person: value("debtPerson"),
            type: value("debtType"),
            amount: amount("debtAmount"),
            date: value("debtDate"),
            note: value("debtNote"),
            createdAt: new Date().toISOString()
        });
        saveState();
        event.target.reset();
        seedDates();
        toast("تم حفظ حركة الدين.");
        render();
    }

    function onCommitmentSubmit(event) {
        event.preventDefault();
        state.commitments.unshift({
            id: crypto.randomUUID(),
            name: value("commitmentName"),
            amount: amount("commitmentAmount"),
            dueDate: value("commitmentDate"),
            note: value("commitmentNote"),
            isPaid: false,
            createdAt: new Date().toISOString()
        });
        saveState();
        event.target.reset();
        seedDates();
        toast("تم حفظ الالتزام.");
        render();
    }

    function onPlanSubmit(event) {
        event.preventDefault();
        state.profile.deviceName = value("profileName");
        state.profile.currency = value("profileCurrency") || "₪";
        state.profile.monthlyBudget = amount("profileBudget");
        state.profile.savingGoal = amount("profileSavingGoal");
        state.profile.passcode = value("profilePasscode");
        saveState();
        unlocked = !state.profile.passcode || !state.profile.safeMode || unlocked;
        toast("تم حفظ الخطة وإعدادات الجهاز.");
        render();
    }

    function switchPanel(panel) {
        document.querySelectorAll(".panel").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-panel") === panel));
        document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-panel-target") === panel));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function switchMoneyTab(tab) {
        document.querySelectorAll(".mini-tab").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-money-tab") === tab));
        document.querySelectorAll(".money-form").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-money-form") === tab));
    }

    function switchLogFilter(filter) {
        currentLogFilter = filter;
        document.querySelectorAll("[data-log-filter]").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-log-filter") === filter));
        render();
    }

    function unlock(event) {
        event.preventDefault();
        if (value("unlockCode") === state.profile.passcode) {
            unlocked = true;
            refs.unlockError.textContent = "";
            refs.unlockCode.value = "";
            render();
            return;
        }
        refs.unlockError.textContent = "رمز القفل غير صحيح.";
    }

    function toggleSafeMode() {
        state.profile.safeMode = !state.profile.safeMode;
        saveState();
        if (state.profile.safeMode && state.profile.passcode) {
            unlocked = false;
        }
        render();
        toast(state.profile.safeMode ? "تم تفعيل الوضع الآمن." : "تم إيقاف الوضع الآمن.");
    }

    function toggleHideNumbers() {
        state.profile.hideNumbers = !state.profile.hideNumbers;
        saveState();
        render();
    }

    function lockNow() {
        if (!state.profile.passcode) {
            toast("أضف رمز قفل أولًا من قسم الخطة.");
            return;
        }
        unlocked = false;
        render();
    }

    function showInstallHint() {
        toast("من Safari اضغط مشاركة ثم أضفه للشاشة الرئيسية.");
    }

    function startSetup() {
        switchPanel("plan");
        document.getElementById("profileName").focus();
    }

    function exportBackup() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "personalaccounts-iphone-backup.json";
        link.click();
        URL.revokeObjectURL(url);
        refs.backupStatus.textContent = "آخر نسخة: تم التصدير الآن.";
        toast("تم تصدير نسخة JSON.");
    }

    function importBackup(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
            try {
                const data = JSON.parse(String(reader.result || "{}"));
                Object.assign(state, normalizeState(data));
                saveState();
                unlocked = !state.profile.passcode || !state.profile.safeMode;
                toast("تم استيراد النسخة.");
                render();
            } catch {
                toast("تعذر قراءة النسخة.");
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    }

    function resetDevice() {
        if (!window.confirm("سيتم حذف كل بيانات هذا الجهاز المحلي. هل تريد المتابعة؟")) return;
        localStorage.removeItem(STORAGE_KEY);
        Object.assign(state, normalizeState(DEFAULT_STATE));
        unlocked = true;
        seedDates();
        render();
        toast("تم تصفير بيانات هذا الجهاز.");
    }

    function render() {
        const hidden = !!state.profile.hideNumbers;
        const isConfigured = !!state.profile.deviceName;
        const hasEntries = !!(state.incomes.length || state.expenses.length || state.debts.length || state.commitments.length);
        const needsSetup = !isConfigured && !hasEntries;

        refs.deviceTitle.textContent = state.profile.deviceName || "ابدأ إعداد هذا الجهاز";
        refs.setupHelper.hidden = !needsSetup;
        refs.startSetupButton.hidden = !needsSetup;
        setValue("profileName", state.profile.deviceName);
        setValue("profileCurrency", state.profile.currency || "₪");
        setValue("profileBudget", state.profile.monthlyBudget || "");
        setValue("profileSavingGoal", state.profile.savingGoal || "");
        setValue("profilePasscode", state.profile.passcode || "");
        refs.safeModeToggle.textContent = state.profile.safeMode ? "إيقاف الوضع الآمن" : "وضع آمن";
        refs.hideNumbersToggle.textContent = hidden ? "إظهار الأرقام" : "إخفاء الأرقام";
        refs.appMain.hidden = state.profile.safeMode && !!state.profile.passcode && !unlocked;
        refs.privacyScreen.hidden = !state.profile.safeMode || !state.profile.passcode || unlocked;

        const currency = state.profile.currency || "₪";
        const incomesMonth = monthItems(state.incomes);
        const expensesMonth = monthItems(state.expenses);
        const monthIncome = sum(incomesMonth, "amount");
        const monthExpense = sum(expensesMonth, "amount");
        const monthBalance = monthIncome - monthExpense;
        const todayExpense = state.expenses.filter((x) => x.date === dateValue(new Date())).reduce((a, b) => a + Number(b.amount || 0), 0);
        const netDebt = state.debts.reduce((total, item) => {
            if (item.type === "for-me") return total + item.amount;
            if (item.type === "on-me") return total - item.amount;
            if (item.type === "paid-to-me") return total - item.amount;
            return total + item.amount;
        }, 0);
        const dueSoon = state.commitments.filter((x) => !x.isPaid && daysUntil(x.dueDate) >= 0 && daysUntil(x.dueDate) <= 3);
        const budgetUsage = state.profile.monthlyBudget > 0 ? Math.min(100, Math.round((monthExpense / state.profile.monthlyBudget) * 100)) : 0;
        const savingCurrent = monthIncome - monthExpense;
        const savingUsage = state.profile.savingGoal > 0 ? Math.max(0, Math.min(100, Math.round((savingCurrent / state.profile.savingGoal) * 100))) : 0;

        money(refs.monthBalanceValue, monthBalance, currency, hidden);
        money(refs.todayExpenseValue, todayExpense, currency, hidden);
        money(refs.netDebtValue, netDebt, currency, hidden);
        refs.dueSoonValue.textContent = dueSoon.length;
        refs.budgetUsagePercent.textContent = `${budgetUsage}%`;
        refs.budgetUsageBar.style.width = `${budgetUsage}%`;
        refs.budgetUsageHint.textContent = state.profile.monthlyBudget > 0
            ? `${hidden ? "••••" : formatMoney(monthExpense, currency)} من أصل ${hidden ? "••••" : formatMoney(state.profile.monthlyBudget, currency)}`
            : "لا يوجد سقف شهري محدد بعد.";
        refs.savingUsagePercent.textContent = `${savingUsage}%`;
        refs.savingUsageBar.style.width = `${savingUsage}%`;
        refs.savingUsageHint.textContent = state.profile.savingGoal > 0
            ? `${hidden ? "••••" : formatMoney(savingCurrent, currency)} من أصل ${hidden ? "••••" : formatMoney(state.profile.savingGoal, currency)}`
            : "لا يوجد هدف توفير محدد بعد.";

        refs.todayAlert.textContent = needsSetup
            ? "هذا جهاز جديد. افتح الخطة وحدد الاسم والعملة وسقف المصروف حتى يبدأ الاستخدام بشكل صحيح."
            : dueSoon.length
                ? `عندك ${dueSoon.length} التزام قريب خلال 3 أيام.`
                : state.profile.monthlyBudget > 0 && monthExpense > state.profile.monthlyBudget
                    ? "تنبيه: تجاوزت سقف المصروف الشهري."
                    : "لا يوجد تنبيه مهم الآن، وضع الميزانية مستقر.";

        renderOperations(currency, hidden);
        renderDebts(currency, hidden);
        renderCommitments(currency, hidden);
    }

    function renderOperations(currency, hidden) {
        const recent = state.expenses.map((x) => ({ kind: "expense", ...x }))
            .concat(state.incomes.map((x) => ({ kind: "income", ...x })))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8);

        refs.recentOperations.innerHTML = recent.length
            ? recent.map((item) => listItemMarkup(
                item.title,
                `${item.kind === "expense" ? "مصروف" : "دخل"} · ${displayDate(item.date)}${item.category ? ` · ${item.category}` : ""}`,
                hidden ? "••••" : formatMoney(item.amount, currency),
                item.kind === "expense" ? "tone-expense" : "tone-income"
            )).join("")
            : emptyState("لا توجد عمليات بعد.");

        let moneyLog = state.expenses.map((x) => ({ kind: "expense", ...x }))
            .concat(state.incomes.map((x) => ({ kind: "income", ...x })))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (currentLogFilter !== "all") {
            moneyLog = moneyLog.filter((item) => item.kind === currentLogFilter);
        }

        refs.moneyEntries.innerHTML = moneyLog.length
            ? moneyLog.map((item) => listItemMarkup(
                item.title,
                `${item.kind === "expense" ? "مصروف" : "دخل"} · ${displayDate(item.date)}${item.category ? ` · ${item.category}` : ""}`,
                hidden ? "••••" : formatMoney(item.amount, currency),
                item.kind === "expense" ? "tone-expense" : "tone-income"
            )).join("")
            : emptyState("لا توجد عمليات محفوظة.");
    }

    function renderDebts(currency, hidden) {
        const forMe = state.debts.filter((x) => x.type === "for-me").reduce((a, b) => a + Number(b.amount || 0), 0);
        const onMe = state.debts.filter((x) => x.type === "on-me").reduce((a, b) => a + Number(b.amount || 0), 0);
        refs.debtSummary.innerHTML = [
            summaryPill("إلك على الناس", hidden ? "••••" : formatMoney(forMe, currency)),
            summaryPill("عليك للناس", hidden ? "••••" : formatMoney(onMe, currency)),
            summaryPill("صافي الديون", hidden ? "••••" : formatMoney(forMe - onMe, currency))
        ].join("");

        refs.debtEntries.innerHTML = state.debts.length
            ? state.debts.map((item) => listItemMarkup(
                item.person,
                `${debtTypeLabel(item.type)} · ${displayDate(item.date)}${item.note ? ` · ${item.note}` : ""}`,
                hidden ? "••••" : formatMoney(item.amount, currency),
                "tone-debt"
            )).join("")
            : emptyState("لا توجد حركات ديون بعد.");
    }

    function renderCommitments(currency, hidden) {
        const upcoming = state.commitments
            .filter((x) => !x.isPaid)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        refs.upcomingCommitments.innerHTML = upcoming.length
            ? upcoming.slice(0, 6).map((item) => listItemMarkup(
                item.name,
                `${displayDate(item.dueDate)}${item.note ? ` · ${item.note}` : ""}`,
                hidden ? "••••" : formatMoney(item.amount, currency),
                "tone-warning"
            )).join("")
            : emptyState("لا توجد التزامات قريبة.");

        refs.commitmentEntries.innerHTML = state.commitments.length
            ? state.commitments.map((item) => commitmentItemMarkup(item, currency, hidden)).join("")
            : emptyState("لا توجد التزامات محفوظة.");

        refs.commitmentEntries.querySelectorAll("[data-mark-paid]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-mark-paid");
                state.commitments = state.commitments.map((item) => item.id === id ? { ...item, isPaid: true } : item);
                saveState();
                toast("تم تعليم الالتزام كمدفوع.");
                render();
            });
        });
        refs.commitmentEntries.querySelectorAll("[data-delete-id]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-delete-id");
                state.commitments = state.commitments.filter((item) => item.id !== id);
                saveState();
                toast("تم حذف الالتزام.");
                render();
            });
        });
    }

    function listItemMarkup(title, meta, valueText, tone) {
        return `<div class="list-item"><div><div class="list-title">${escapeHtml(title)}</div><div class="list-meta">${escapeHtml(meta)}</div></div><div class="list-value ${tone}">${escapeHtml(valueText)}</div></div>`;
    }

    function commitmentItemMarkup(item, currency, hidden) {
        return `<div class="list-item">
            <div>
                <div class="list-title">${escapeHtml(item.name)}</div>
                <div class="list-meta">${escapeHtml(item.isPaid ? "مدفوع" : "غير مدفوع")} · ${escapeHtml(displayDate(item.dueDate))}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</div>
            </div>
            <div class="list-actions">
                <div class="list-value ${item.isPaid ? "tone-income" : "tone-warning"}">${escapeHtml(hidden ? "••••" : formatMoney(item.amount, currency))}</div>
                ${!item.isPaid ? `<button class="inline-button success" type="button" data-mark-paid="${escapeHtml(item.id)}">تم الدفع</button>` : ""}
                <button class="inline-button danger" type="button" data-delete-id="${escapeHtml(item.id)}">حذف</button>
            </div>
        </div>`;
    }

    function summaryPill(label, valueText) {
        return `<div class="summary-pill"><span>${escapeHtml(label)}</span><strong>${escapeHtml(valueText)}</strong></div>`;
    }

    function emptyState(message) {
        return `<div class="empty-state">${escapeHtml(message)}</div>`;
    }

    function money(element, valueAmount, currency, hidden) {
        element.textContent = hidden ? "••••" : formatMoney(valueAmount, currency);
    }

    function monthItems(items) {
        const now = new Date();
        return items.filter((item) => {
            const date = new Date(item.date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
    }

    function sum(items, key) {
        return items.reduce((total, item) => total + Number(item[key] || 0), 0);
    }

    function debtTypeLabel(type) {
        return {
            "for-me": "إلي عليه",
            "on-me": "عليّ إله",
            "paid-to-me": "دفع لي",
            "paid-by-me": "دفعت له"
        }[type] || "حركة";
    }

    function daysUntil(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.round((date - today) / 86400000);
    }

    function formatMoney(numberValue, currency) {
        return `${currency} ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(numberValue || 0))}`;
    }

    function displayDate(valueText) {
        if (!valueText) return "بدون تاريخ";
        return new Intl.DateTimeFormat("ar", { year: "numeric", month: "short", day: "numeric" }).format(new Date(valueText));
    }

    function value(id) { return String(document.getElementById(id).value || "").trim(); }
    function amount(id) {
        const parsed = Number(document.getElementById(id).value || 0);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    function setValue(id, nextValue) {
        const el = document.getElementById(id);
        if (el) el.value = nextValue;
    }
    function dateValue(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return normalizeState(DEFAULT_STATE);
            return normalizeState(JSON.parse(raw));
        } catch {
            return normalizeState(DEFAULT_STATE);
        }
    }

    function normalizeState(raw) {
        const data = raw || {};
        return {
            profile: {
                deviceName: String(data.profile?.deviceName || ""),
                currency: String(data.profile?.currency || "₪"),
                monthlyBudget: Number(data.profile?.monthlyBudget || 0),
                savingGoal: Number(data.profile?.savingGoal || 0),
                passcode: String(data.profile?.passcode || ""),
                safeMode: !!data.profile?.safeMode,
                hideNumbers: !!data.profile?.hideNumbers
            },
            incomes: Array.isArray(data.incomes) ? data.incomes : [],
            expenses: Array.isArray(data.expenses) ? data.expenses : [],
            debts: Array.isArray(data.debts) ? data.debts : [],
            commitments: Array.isArray(data.commitments) ? data.commitments : []
        };
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function toast(message) {
        refs.toast.hidden = false;
        refs.toast.textContent = message;
        clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => { refs.toast.hidden = true; }, 2200);
    }

    function escapeHtml(valueText) {
        return String(valueText)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
})();

