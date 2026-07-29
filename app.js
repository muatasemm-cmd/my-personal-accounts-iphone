(function () {
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
        debtPlans: [],
        commitments: [],
        reminders: [],
        archivedPeople: [],
        monthlyArchives: []
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
        monthIncomeValue: document.getElementById("monthIncomeValue"),
        monthExpenseValue: document.getElementById("monthExpenseValue"),
        todayExpenseValue: document.getElementById("todayExpenseValue"),
        dueSoonValue: document.getElementById("dueSoonValue"),
        dueThisWeekValue: document.getElementById("dueThisWeekValue"),
        netDebtValue: document.getElementById("netDebtValue"),
        todayAlert: document.getElementById("todayAlert"),
        balanceHelper: document.getElementById("balanceHelper"),
        recentOperations: document.getElementById("recentOperations"),
        upcomingCommitments: document.getElementById("upcomingCommitments"),
        moneyEntries: document.getElementById("moneyEntries"),
        moneySearchInput: document.getElementById("moneySearchInput"),
        debtEntries: document.getElementById("debtEntries"),
        debtInstallmentEntries: document.getElementById("debtInstallmentEntries"),
        installmentEditForm: document.getElementById("installmentEditForm"),
        installmentEditSaveButton: document.getElementById("installmentEditSaveButton"),
        installmentEditCancelButton: document.getElementById("installmentEditCancelButton"),
        debtSummary: document.getElementById("debtSummary"),
        debtPlanForm: document.getElementById("debtPlanForm"),
        peopleSuggestions: document.getElementById("peopleSuggestions"),
        debtSearchInput: document.getElementById("debtSearchInput"),
        showArchivedPeopleToggle: document.getElementById("showArchivedPeopleToggle"),
        peopleOverview: document.getElementById("peopleOverview"),
        commitmentEntries: document.getElementById("commitmentEntries"),
        reminderEntries: document.getElementById("reminderEntries"),
        monthlyReportSummary: document.getElementById("monthlyReportSummary"),
        monthlyReportBreakdown: document.getElementById("monthlyReportBreakdown"),
        monthClosingSummary: document.getElementById("monthClosingSummary"),
        monthClosingInsights: document.getElementById("monthClosingInsights"),
        monthCompareSummary: document.getElementById("monthCompareSummary"),
        monthCompareInsights: document.getElementById("monthCompareInsights"),
        damageReportList: document.getElementById("damageReportList"),
        archiveMonthButton: document.getElementById("archiveMonthButton"),
        monthlyArchivesList: document.getElementById("monthlyArchivesList"),
        setupHelper: document.getElementById("setupHelper"),
        toast: document.getElementById("toastMessage"),
        homeHero: document.getElementById("homeHero"),
        homeQuickActions: document.getElementById("homeQuickActions"),
        backupStatus: document.getElementById("backupStatus"),
        safeModeToggle: document.getElementById("safeModeToggle"),
        hideNumbersToggle: document.getElementById("hideNumbersToggle"),
        budgetUsagePercent: document.getElementById("budgetUsagePercent"),
        budgetUsageBar: document.getElementById("budgetUsageBar"),
        budgetUsageHint: document.getElementById("budgetUsageHint"),
        savingUsagePercent: document.getElementById("savingUsagePercent"),
        savingUsageBar: document.getElementById("savingUsageBar"),
        savingUsageHint: document.getElementById("savingUsageHint"),
        financialSafetyPercent: document.getElementById("financialSafetyPercent"),
        financialSafetyBar: document.getElementById("financialSafetyBar"),
        financialSafetyHint: document.getElementById("financialSafetyHint"),
        spendingInsightTitle: document.getElementById("spendingInsightTitle"),
        spendingInsightHint: document.getElementById("spendingInsightHint"),
        startSetupButton: document.getElementById("startSetupButton"),
        expenseSubmitButton: document.getElementById("expenseSubmitButton"),
        expenseCancelEditButton: document.getElementById("expenseCancelEditButton"),
        incomeSubmitButton: document.getElementById("incomeSubmitButton"),
        incomeCancelEditButton: document.getElementById("incomeCancelEditButton"),
        debtSubmitButton: document.getElementById("debtSubmitButton"),
        debtCancelEditButton: document.getElementById("debtCancelEditButton"),
        commitmentSubmitButton: document.getElementById("commitmentSubmitButton"),
        commitmentCancelEditButton: document.getElementById("commitmentCancelEditButton"),
        reminderSubmitButton: document.getElementById("reminderSubmitButton"),
        reminderCancelEditButton: document.getElementById("reminderCancelEditButton")
    };
    let currentLogFilter = "all";
    let currentMoneyPeriod = "all";
    let currentInstallmentFilter = "all";
    let currentMoneySearch = "";
    let currentDebtSearch = "";
    let showArchivedPeople = false;
    let unlocked = !state.profile.passcode || !state.profile.safeMode;
    let toastTimer = 0;
    let editingExpenseId = "";
    let editingIncomeId = "";
    let editingDebtId = "";
    let editingCommitmentId = "";
    let editingReminderId = "";
    let editingInstallmentPlanId = "";
    let editingInstallmentId = "";

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
        document.querySelectorAll("[data-period-filter]").forEach((button) => {
            button.addEventListener("click", () => switchMoneyPeriod(button.getAttribute("data-period-filter")));
        });
        document.querySelectorAll("[data-installment-filter]").forEach((button) => {
            button.addEventListener("click", () => switchInstallmentFilter(button.getAttribute("data-installment-filter")));
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
        document.getElementById("debtPlanForm").addEventListener("submit", onDebtPlanSubmit);
        document.getElementById("installmentEditForm").addEventListener("submit", onInstallmentEditSubmit);
        document.getElementById("commitmentForm").addEventListener("submit", onCommitmentSubmit);
        document.getElementById("planForm").addEventListener("submit", onPlanSubmit);
        document.getElementById("reminderForm").addEventListener("submit", onReminderSubmit);
        document.getElementById("exportBackupButton").addEventListener("click", exportBackup);
        document.getElementById("importBackupInput").addEventListener("change", importBackup);
        document.getElementById("resetDeviceButton").addEventListener("click", resetDevice);
        document.getElementById("lockDeviceButton").addEventListener("click", lockNow);
        refs.archiveMonthButton.addEventListener("click", archiveCurrentMonth);
        document.getElementById("installHintButton").addEventListener("click", showInstallHint);
        refs.startSetupButton.addEventListener("click", startSetup);
        refs.safeModeToggle.addEventListener("click", toggleSafeMode);
        refs.hideNumbersToggle.addEventListener("click", toggleHideNumbers);
        refs.unlockForm.addEventListener("submit", unlock);
        refs.moneySearchInput.addEventListener("input", () => {
            currentMoneySearch = refs.moneySearchInput.value.trim().toLowerCase();
            render();
        });
        refs.debtSearchInput.addEventListener("input", () => {
            currentDebtSearch = refs.debtSearchInput.value.trim().toLowerCase();
            render();
        });
        refs.showArchivedPeopleToggle.addEventListener("change", () => {
            showArchivedPeople = refs.showArchivedPeopleToggle.checked;
            render();
        });
        refs.expenseCancelEditButton.addEventListener("click", resetExpenseForm);
        refs.incomeCancelEditButton.addEventListener("click", resetIncomeForm);
        refs.debtCancelEditButton.addEventListener("click", resetDebtForm);
        refs.commitmentCancelEditButton.addEventListener("click", resetCommitmentForm);
        refs.reminderCancelEditButton.addEventListener("click", resetReminderForm);
        refs.installmentEditCancelButton.addEventListener("click", resetInstallmentEditForm);
    }

    function seedDates() {
        const today = dateValue(new Date());
        ["expenseDate", "incomeDate", "debtDate", "commitmentDate", "debtPlanStartDate"].forEach((id) => {
            const element = document.getElementById(id);
            if (element && !element.value) element.value = today;
        });
        ["expenseCurrency", "incomeCurrency", "debtCurrency", "debtPlanCurrency", "commitmentCurrency"].forEach((id) => {
            const element = document.getElementById(id);
            if (element && !element.value) element.value = normalizeCurrency(state.profile.currency || "₪");
        });
        const reminderDate = document.getElementById("reminderDate");
        if (reminderDate && !reminderDate.value) reminderDate.value = today;
    }

    function onExpenseSubmit(event) {
        event.preventDefault();
        const customCategory = value("expenseCustomCategory");
        const selectedCategory = value("expenseCategory");
        const finalCategory = customCategory || selectedCategory;
        if (!finalCategory) {
            toast("اختر تصنيفًا أو أضف تصنيفًا جديدًا.");
            return;
        }
        const isEditing = !!editingExpenseId;
        const payload = {
            title: finalCategory,
            amount: amount("expenseAmount"),
            date: value("expenseDate"),
            currency: normalizeCurrency(value("expenseCurrency") || state.profile.currency || "₪"),
            category: finalCategory,
            note: value("expenseNote")
        };
        if (editingExpenseId) {
            state.expenses = state.expenses.map((item) =>
                item.id === editingExpenseId ? { ...item, ...payload } : item
            );
        } else {
            state.expenses.unshift({
                id: crypto.randomUUID(),
                ...payload,
                createdAt: new Date().toISOString()
            });
        }
        saveState();
        resetExpenseForm();
        toast(isEditing ? "تم تعديل المصروف." : "تم حفظ المصروف.");
        render();
    }

    function onIncomeSubmit(event) {
        event.preventDefault();
        const customCategory = value("incomeCustomCategory");
        const selectedCategory = value("incomeCategory");
        const finalCategory = customCategory || selectedCategory;
        if (!finalCategory) {
            toast("اختر تصنيف دخل أو أضف تصنيفًا جديدًا.");
            return;
        }
        const isEditing = !!editingIncomeId;
        const payload = {
            title: finalCategory,
            amount: amount("incomeAmount"),
            date: value("incomeDate"),
            currency: normalizeCurrency(value("incomeCurrency") || state.profile.currency || "₪"),
            category: finalCategory,
            note: value("incomeNote")
        };
        if (editingIncomeId) {
            state.incomes = state.incomes.map((item) =>
                item.id === editingIncomeId ? { ...item, ...payload } : item
            );
        } else {
            state.incomes.unshift({
                id: crypto.randomUUID(),
                ...payload,
                createdAt: new Date().toISOString()
            });
        }
        saveState();
        resetIncomeForm();
        toast(isEditing ? "تم تعديل الدخل." : "تم حفظ الدخل.");
        render();
    }

    function onDebtSubmit(event) {
        event.preventDefault();
        const isEditing = !!editingDebtId;
        const payload = {
            person: value("debtPerson"),
            type: value("debtType"),
            amount: amount("debtAmount"),
            date: value("debtDate"),
            currency: normalizeCurrency(value("debtCurrency") || state.profile.currency || "₪"),
            note: value("debtNote")
        };
        if (editingDebtId) {
            state.debts = state.debts.map((item) =>
                item.id === editingDebtId ? { ...item, ...payload } : item
            );
        } else {
            state.debts.unshift({
                id: crypto.randomUUID(),
                ...payload,
                createdAt: new Date().toISOString()
            });
        }
        saveState();
        resetDebtForm();
        toast(isEditing ? "تم تعديل حركة الدين." : "تم حفظ حركة الدين.");
        render();
    }

    function onCommitmentSubmit(event) {
        event.preventDefault();
        const isEditing = !!editingCommitmentId;
        const payload = {
            name: value("commitmentName"),
            amount: amount("commitmentAmount"),
            dueDate: value("commitmentDate"),
            currency: normalizeCurrency(value("commitmentCurrency") || state.profile.currency || "₪"),
            note: value("commitmentNote")
        };
        if (editingCommitmentId) {
            state.commitments = state.commitments.map((item) =>
                item.id === editingCommitmentId ? { ...item, ...payload } : item
            );
        } else {
            state.commitments.unshift({
                id: crypto.randomUUID(),
                ...payload,
                isPaid: false,
                createdAt: new Date().toISOString()
            });
        }
        saveState();
        resetCommitmentForm();
        toast(isEditing ? "تم تعديل الالتزام." : "تم حفظ الالتزام.");
        render();
    }

    function onDebtPlanSubmit(event) {
        event.preventDefault();
        const person = value("debtPlanPerson");
        const total = amount("debtPlanTotal");
        const count = Math.max(1, Math.round(Number(document.getElementById("debtPlanCount").value || 1)));
        const startDate = value("debtPlanStartDate");
        const interval = value("debtPlanInterval") || "monthly";
        const currency = normalizeCurrency(value("debtPlanCurrency") || state.profile.currency || "₪");
        const note = value("debtPlanNote");

        const installments = buildInstallments(total, count, startDate).map((item, index) => ({
            id: crypto.randomUUID(),
            sequence: index + 1,
            amount: item.amount,
            dueDate: shiftDateByInterval(startDate, interval, index),
            isPaid: false,
            paidAt: "",
            note
        }));

        state.debtPlans.unshift(syncDebtPlan({
            id: crypto.randomUUID(),
            person,
            totalAmount: total,
            installmentCount: count,
            currency,
            interval,
            startDate,
            note,
            installments,
            createdAt: new Date().toISOString()
        }));
        saveState();
        event.target.reset();
        seedDates();
        toast("تم إنشاء خطة السداد.");
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
        switchPanel("home");
    }

    function onInstallmentEditSubmit(event) {
        event.preventDefault();
        if (!editingInstallmentPlanId || !editingInstallmentId) {
            toast("لا توجد دفعة محددة للتعديل.");
            return;
        }

        const nextAmount = amount("installmentEditAmount");
        const nextDate = value("installmentEditDate");
        const nextNote = value("installmentEditNote");

        state.debtPlans = state.debtPlans.map((plan) => {
            if (plan.id !== editingInstallmentPlanId) return plan;
            const nextInstallments = (plan.installments || []).map((item) =>
                item.id === editingInstallmentId
                    ? { ...item, amount: nextAmount, dueDate: nextDate, note: nextNote }
                    : item
            );
            return syncDebtPlan({
                ...plan,
                installments: nextInstallments
            });
        });

        saveState();
        resetInstallmentEditForm();
        render();
        toast("تم تعديل الدفعة المجدولة.");
    }

    function onReminderSubmit(event) {
        event.preventDefault();
        const isEditing = !!editingReminderId;
        const payload = {
            title: value("reminderTitle"),
            date: value("reminderDate"),
            note: value("reminderNote")
        };
        if (editingReminderId) {
            state.reminders = state.reminders.map((item) =>
                item.id === editingReminderId ? { ...item, ...payload } : item
            );
        } else {
            state.reminders.unshift({
                id: crypto.randomUUID(),
                ...payload,
                isDone: false,
                createdAt: new Date().toISOString()
            });
        }
        saveState();
        resetReminderForm();
        toast(isEditing ? "تم تعديل التذكير." : "تم حفظ التذكير.");
        render();
    }

    function switchPanel(panel) {
        document.querySelectorAll(".panel").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-panel") === panel));
        document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-panel-target") === panel));
        const isHome = panel === "home";
        if (refs.homeHero) refs.homeHero.hidden = !isHome;
        if (refs.homeQuickActions) refs.homeQuickActions.hidden = !isHome;
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

    function switchMoneyPeriod(period) {
        currentMoneyPeriod = period;
        document.querySelectorAll("[data-period-filter]").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-period-filter") === period));
        render();
    }

    function switchInstallmentFilter(filter) {
        currentInstallmentFilter = filter;
        document.querySelectorAll("[data-installment-filter]").forEach((item) => item.classList.toggle("is-active", item.getAttribute("data-installment-filter") === filter));
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
        toast("من Safari اضغط مشاركة ثم أضفه للشاشة الرئيسية. هذه نسخة v22.");
    }

    function startSetup() {
        switchPanel("plan");
        toast("افتح الاسم والعملة وسقف المصروف من هنا.");
        window.setTimeout(() => {
            const nameInput = document.getElementById("profileName");
            if (nameInput) {
                nameInput.focus();
                nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 260);
    }

    function setFormEditing(button, cancelButton, editing, editLabel, createLabel) {
        button.textContent = editing ? editLabel : createLabel;
        cancelButton.hidden = !editing;
    }

    function resetExpenseForm() {
        editingExpenseId = "";
        document.getElementById("expenseForm").reset();
        seedDates();
        setValue("expenseCategory", "");
        setValue("expenseCustomCategory", "");
        setValue("expenseCurrency", normalizeCurrency(state.profile.currency || "₪"));
        setFormEditing(refs.expenseSubmitButton, refs.expenseCancelEditButton, false, "حفظ التعديل", "حفظ المصروف");
    }

    function resetIncomeForm() {
        editingIncomeId = "";
        document.getElementById("incomeForm").reset();
        seedDates();
        setValue("incomeCategory", "");
        setValue("incomeCustomCategory", "");
        setValue("incomeCurrency", normalizeCurrency(state.profile.currency || "₪"));
        setFormEditing(refs.incomeSubmitButton, refs.incomeCancelEditButton, false, "حفظ التعديل", "حفظ الدخل");
    }

    function resetDebtForm() {
        editingDebtId = "";
        document.getElementById("debtForm").reset();
        seedDates();
        setValue("debtCurrency", normalizeCurrency(state.profile.currency || "₪"));
        setFormEditing(refs.debtSubmitButton, refs.debtCancelEditButton, false, "حفظ التعديل", "حفظ الحركة");
    }

    function resetCommitmentForm() {
        editingCommitmentId = "";
        document.getElementById("commitmentForm").reset();
        seedDates();
        setValue("commitmentCurrency", normalizeCurrency(state.profile.currency || "₪"));
        setFormEditing(refs.commitmentSubmitButton, refs.commitmentCancelEditButton, false, "حفظ التعديل", "حفظ الالتزام");
    }

    function resetReminderForm() {
        editingReminderId = "";
        document.getElementById("reminderForm").reset();
        seedDates();
        setFormEditing(refs.reminderSubmitButton, refs.reminderCancelEditButton, false, "حفظ التعديل", "حفظ التذكير");
    }

    function resetInstallmentEditForm() {
        editingInstallmentPlanId = "";
        editingInstallmentId = "";
        document.getElementById("installmentEditForm").reset();
        refs.installmentEditForm.hidden = true;
    }

    function startEditMoney(kind, id) {
        const source = kind === "expense" ? state.expenses : state.incomes;
        const item = source.find((entry) => entry.id === id);
        if (!item) return;
        switchPanel("money");
        switchMoneyTab(kind);
        if (kind === "expense") {
            editingExpenseId = id;
            setValue("expenseAmount", item.amount);
            setValue("expenseDate", item.date);
            setValue("expenseCurrency", normalizeCurrency(item.currency || state.profile.currency || "₪"));
            const presetCategories = ["أكل", "بيت", "مدارس", "مواصلات", "علاج", "فواتير", "أولاد", "مجموعة أغراض", "متفرقات", "طوارئ"];
            const categoryValue = item.category || item.title || "";
            if (presetCategories.includes(categoryValue)) {
                setValue("expenseCategory", categoryValue);
                setValue("expenseCustomCategory", "");
            } else {
                setValue("expenseCategory", "");
                setValue("expenseCustomCategory", categoryValue);
            }
            setValue("expenseNote", item.note || "");
            setFormEditing(refs.expenseSubmitButton, refs.expenseCancelEditButton, true, "حفظ التعديل", "حفظ المصروف");
            document.getElementById("expenseCategory")?.focus();
        } else {
            editingIncomeId = id;
            setValue("incomeAmount", item.amount);
            setValue("incomeDate", item.date);
            setValue("incomeCurrency", normalizeCurrency(item.currency || state.profile.currency || "₪"));
            const presetCategories = ["راتب", "دخل إضافي", "تحويل", "هدية", "استرداد", "بيع", "متفرقات"];
            const categoryValue = item.category || item.title || "";
            if (presetCategories.includes(categoryValue)) {
                setValue("incomeCategory", categoryValue);
                setValue("incomeCustomCategory", "");
            } else {
                setValue("incomeCategory", "");
                setValue("incomeCustomCategory", categoryValue);
            }
            setValue("incomeNote", item.note || "");
            setFormEditing(refs.incomeSubmitButton, refs.incomeCancelEditButton, true, "حفظ التعديل", "حفظ الدخل");
            document.getElementById("incomeCategory")?.focus();
        }
        toast("يمكنك الآن تعديل الحركة ثم حفظها.");
    }

    function startEditDebt(id) {
        const item = state.debts.find((entry) => entry.id === id);
        if (!item) return;
        switchPanel("debts");
        editingDebtId = id;
        setValue("debtPerson", item.person);
        setValue("debtType", item.type);
        setValue("debtAmount", item.amount);
        setValue("debtDate", item.date);
        setValue("debtCurrency", normalizeCurrency(item.currency || state.profile.currency || "₪"));
        setValue("debtNote", item.note || "");
        setFormEditing(refs.debtSubmitButton, refs.debtCancelEditButton, true, "حفظ التعديل", "حفظ الحركة");
        document.getElementById("debtPerson")?.focus();
        toast("عدّل حركة الدين ثم احفظها.");
    }

    function startNewDebtForPerson(name) {
        if (!name) return;
        switchPanel("debts");
        resetDebtForm();
        setValue("debtPerson", name);
        window.setTimeout(() => {
            document.getElementById("debtForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
            document.getElementById("debtType")?.focus();
        }, 120);
        toast(`أضف حركة جديدة لـ ${name}.`);
    }

    function startEditLatestDebtForPerson(name) {
        if (!name) return;
        const latestDebt = state.debts
            .filter((item) => item.person === name)
            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))[0];
        if (!latestDebt) {
            toast("لا توجد حركة دين محفوظة لهذا الشخص.");
            return;
        }
        startEditDebt(latestDebt.id);
    }

    function startEditCommitment(id) {
        const item = state.commitments.find((entry) => entry.id === id);
        if (!item) return;
        switchPanel("plan");
        editingCommitmentId = id;
        setValue("commitmentName", item.name);
        setValue("commitmentAmount", item.amount);
        setValue("commitmentDate", item.dueDate);
        setValue("commitmentCurrency", normalizeCurrency(item.currency || state.profile.currency || "₪"));
        setValue("commitmentNote", item.note || "");
        setFormEditing(refs.commitmentSubmitButton, refs.commitmentCancelEditButton, true, "حفظ التعديل", "حفظ الالتزام");
        document.getElementById("commitmentName")?.focus();
        toast("عدّل الالتزام ثم احفظه.");
    }

    function startEditReminder(id) {
        const item = state.reminders.find((entry) => entry.id === id);
        if (!item) return;
        switchPanel("more");
        editingReminderId = id;
        setValue("reminderTitle", item.title);
        setValue("reminderDate", item.date);
        setValue("reminderNote", item.note || "");
        setFormEditing(refs.reminderSubmitButton, refs.reminderCancelEditButton, true, "حفظ التعديل", "حفظ التذكير");
        document.getElementById("reminderTitle")?.focus();
        toast("عدّل التذكير ثم احفظه.");
    }

    function deleteMoney(kind, id) {
        if (!id) return;
        if (!window.confirm("هل تريد حذف هذه الحركة؟")) return;
        if (kind === "expense") {
            state.expenses = state.expenses.filter((item) => item.id !== id);
            if (editingExpenseId === id) resetExpenseForm();
        } else {
            state.incomes = state.incomes.filter((item) => item.id !== id);
            if (editingIncomeId === id) resetIncomeForm();
        }
        saveState();
        render();
        toast("تم حذف الحركة.");
    }

    function deleteDebt(id) {
        if (!id) return;
        if (!window.confirm("هل تريد حذف حركة الدين هذه؟")) return;
        state.debts = state.debts.filter((item) => item.id !== id);
        if (editingDebtId === id) resetDebtForm();
        saveState();
        render();
        toast("تم حذف حركة الدين.");
    }

    function startEditInstallment(planId, installmentId) {
        const plan = state.debtPlans.find((item) => item.id === planId);
        const installment = plan?.installments?.find((item) => item.id === installmentId);
        if (!plan || !installment) {
            toast("تعذر العثور على الدفعة المطلوبة.");
            return;
        }
        editingInstallmentPlanId = planId;
        editingInstallmentId = installmentId;
        setValue("installmentEditAmount", installment.amount);
        setValue("installmentEditDate", installment.dueDate);
        setValue("installmentEditNote", installment.note || plan.note || "");
        refs.installmentEditForm.hidden = false;
        refs.installmentEditForm.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById("installmentEditAmount")?.focus();
        toast(`تعديل دفعة ${installment.sequence}/${plan.installmentCount} لـ ${plan.person}.`);
    }

    function startEditLatestInstallmentForPerson(name) {
        if (!name) return;
        const latestInstallment = flattenDebtInstallments()
            .filter((item) => item.person === name)
            .sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0))[0];
        if (!latestInstallment) {
            toast("لا توجد دفعات مجدولة لهذا الشخص.");
            return;
        }
        switchPanel("debts");
        startEditInstallment(latestInstallment.planId, latestInstallment.installmentId);
    }

    function deleteInstallment(planId, installmentId) {
        if (!planId || !installmentId) return;
        if (!window.confirm("هل تريد حذف هذه الدفعة المجدولة؟")) return;

        const nextPlans = [];
        state.debtPlans.forEach((plan) => {
            if (plan.id !== planId) {
                nextPlans.push(plan);
                return;
            }
            const nextInstallments = (plan.installments || []).filter((item) => item.id !== installmentId);
            if (!nextInstallments.length) {
                return;
            }
            nextPlans.push(syncDebtPlan({
                ...plan,
                installments: nextInstallments
            }));
        });
        state.debtPlans = nextPlans;

        if (editingInstallmentPlanId === planId && editingInstallmentId === installmentId) {
            resetInstallmentEditForm();
        }
        saveState();
        render();
        toast("تم حذف الدفعة المجدولة.");
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
        setValue("profileCurrency", normalizeCurrency(state.profile.currency || "₪"));
        setValue("profileBudget", state.profile.monthlyBudget || "");
        setValue("profileSavingGoal", state.profile.savingGoal || "");
        setValue("profilePasscode", state.profile.passcode || "");
        refs.safeModeToggle.textContent = state.profile.safeMode ? "إيقاف الوضع الآمن" : "وضع آمن";
        refs.hideNumbersToggle.textContent = hidden ? "إظهار الأرقام" : "إخفاء الأرقام";
        refs.showArchivedPeopleToggle.checked = showArchivedPeople;
        refs.appMain.hidden = state.profile.safeMode && !!state.profile.passcode && !unlocked;
        refs.privacyScreen.hidden = !state.profile.safeMode || !state.profile.passcode || unlocked;
        const activePanel = document.querySelector(".panel.is-active")?.getAttribute("data-panel") || "home";
        if (refs.homeHero) refs.homeHero.hidden = activePanel !== "home";
        if (refs.homeQuickActions) refs.homeQuickActions.hidden = activePanel !== "home";

        const currency = normalizeCurrency(state.profile.currency || "₪");
        const { debtCashInRows, debtCashOutRows, paidInstallmentCashRows } = buildCashFlowRows();

        const incomesMonth = monthItems(state.incomes.concat(debtCashInRows));
        const expensesMonth = monthItems(state.expenses.concat(debtCashOutRows, paidInstallmentCashRows));
        const incomesToDate = itemsUpToToday(state.incomes.concat(debtCashInRows));
        const expensesToDate = itemsUpToToday(state.expenses.concat(debtCashOutRows, paidInstallmentCashRows));
        const monthIncome = sumByCurrency(incomesMonth, "amount");
        const monthExpense = sumByCurrency(expensesMonth, "amount");
        const runningIncome = sumByCurrency(incomesToDate, "amount");
        const runningExpense = sumByCurrency(expensesToDate, "amount");
        const monthBalance = subtractTotals(runningIncome, runningExpense);
        const todayExpense = sumByCurrency(
            state.expenses
                .concat(debtCashOutRows, paidInstallmentCashRows)
                .filter((x) => x.date === dateValue(new Date())),
            "amount"
        );
        const netDebt = debtNetByCurrency(state.debts);
        const dueSoonCommitments = state.commitments.filter((x) => !x.isPaid && daysUntil(x.dueDate) >= 0 && daysUntil(x.dueDate) <= 3);
        const dueSoonDebtInstallments = flattenDebtInstallments().filter((x) => !x.isPaid && daysUntil(x.dueDate) >= 0 && daysUntil(x.dueDate) <= 3);
        const dueThisWeekDebtInstallments = flattenDebtInstallments().filter((x) => !x.isPaid && daysUntil(x.dueDate) >= 0 && daysUntil(x.dueDate) <= 7);
        const overdueCommitments = state.commitments.filter((x) => !x.isPaid && daysUntil(x.dueDate) < 0);
        const overdueDebtInstallments = flattenDebtInstallments().filter((x) => !x.isPaid && daysUntil(x.dueDate) < 0);
        const dueSoon = dueSoonCommitments.concat(dueSoonDebtInstallments);
        const overdue = overdueCommitments.concat(overdueDebtInstallments);
        const monthExpenseMain = amountForCurrency(monthExpense, currency);
        const monthIncomeMain = amountForCurrency(monthIncome, currency);
        const monthBalanceMain = amountForCurrency(monthBalance, currency);
        const budgetUsage = state.profile.monthlyBudget > 0 ? Math.min(100, Math.round((monthExpenseMain / state.profile.monthlyBudget) * 100)) : 0;
        const savingCurrent = subtractTotals(monthIncome, monthExpense);
        const savingCurrentMain = amountForCurrency(savingCurrent, currency);
        const savingUsage = state.profile.savingGoal > 0 ? Math.max(0, Math.min(100, Math.round((savingCurrentMain / state.profile.savingGoal) * 100))) : 0;
        const spendingInsight = buildSpendingInsight(currency, hidden);
        const safety = buildFinancialSafety(currency, hidden, monthBalance);

        money(refs.monthBalanceValue, monthBalance, currency, hidden);
        money(refs.monthIncomeValue, monthIncome, currency, hidden);
        money(refs.monthExpenseValue, monthExpense, currency, hidden);
        money(refs.todayExpenseValue, todayExpense, currency, hidden);
        money(refs.netDebtValue, netDebt, currency, hidden);
        refs.dueSoonValue.textContent = dueSoon.length;
        refs.dueThisWeekValue.textContent = dueThisWeekDebtInstallments.length;
        refs.budgetUsagePercent.textContent = `${budgetUsage}%`;
        refs.budgetUsageBar.style.width = `${budgetUsage}%`;
        refs.budgetUsageHint.textContent = state.profile.monthlyBudget > 0
            ? `${hidden ? "••••" : formatMoney(monthExpenseMain, currency)} من أصل ${hidden ? "••••" : formatMoney(state.profile.monthlyBudget, currency)}${hasForeignCurrency(expensesMonth, currency) ? " · توجد مصاريف بعملات أخرى خارج هذه النسبة." : ""}`
            : "لا يوجد سقف شهري محدد بعد.";
        refs.savingUsagePercent.textContent = `${savingUsage}%`;
        refs.savingUsageBar.style.width = `${savingUsage}%`;
        refs.savingUsageHint.textContent = state.profile.savingGoal > 0
            ? `${hidden ? "••••" : formatMoney(savingCurrentMain, currency)} من أصل ${hidden ? "••••" : formatMoney(state.profile.savingGoal, currency)}${hasForeignCurrency(incomesMonth.concat(expensesMonth), currency) ? " · توجد حركات بعملات أخرى خارج هذا القياس." : ""}`
            : "لا يوجد هدف توفير محدد بعد.";
        refs.financialSafetyPercent.textContent = `${safety.percent}%`;
        refs.financialSafetyBar.style.width = `${safety.percent}%`;
        refs.financialSafetyBar.className = `progress-bar ${safety.tone}`;
        refs.financialSafetyHint.textContent = safety.hint;
        refs.spendingInsightTitle.textContent = spendingInsight.title;
        refs.spendingInsightHint.textContent = spendingInsight.hint;
        refs.balanceHelper.textContent = hidden
            ? "المتبقي الحالي مخفي الآن."
            : `كل دخل مسجل حتى اليوم ${formatTotals(runningIncome, currency)} - كل مصروف وسداد مسجل حتى اليوم ${formatTotals(runningExpense, currency)} = الباقي معك الآن ${formatTotals(monthBalance, currency)}.`;

        refs.todayAlert.textContent = needsSetup
            ? "هذا جهاز جديد. افتح الخطة وحدد الاسم والعملة وسقف المصروف حتى يبدأ الاستخدام بشكل صحيح."
            : overdue.length
                ? `عندك ${overdue.length} استحقاق متأخر يحتاج متابعة الآن.`
                : dueSoon.length
                    ? `عندك ${dueSoon.length} استحقاق قريب خلال 3 أيام.`
                    : state.profile.monthlyBudget > 0 && monthExpenseMain > state.profile.monthlyBudget
                        ? "تنبيه: تجاوزت سقف المصروف الشهري للعملة الأساسية."
                        : "لا يوجد تنبيه مهم الآن، وضع الميزانية مستقر.";

        renderOperations(currency, hidden);
        renderDebts(currency, hidden);
        renderCommitments(currency, hidden);
        renderReminders();
        renderMonthlyReport(currency, hidden);
        renderMonthClosing(currency, hidden, monthIncome, monthExpense, monthBalance, savingCurrent);
        renderMonthComparison(currency, hidden);
        renderDamageReport(currency, hidden);
        renderMonthlyArchives(currency, hidden);
    }

    function renderOperations(currency, hidden) {
        const debtCashRows = state.debts
            .filter((item) => item.type === "paid-to-me" || item.type === "paid-by-me")
            .map((item) => ({
                ...item,
                kind: item.type === "paid-to-me" ? "income" : "expense",
                sourceKind: "debt-payment",
                sourceId: item.id,
                title: item.note || (item.type === "paid-to-me" ? `تحصيل من ${item.person}` : `سداد لـ ${item.person}`),
                category: item.type === "paid-to-me" ? "تحصيل دين" : "سداد دين"
            }));
        const installmentPaidRows = flattenDebtInstallments()
            .filter((item) => item.isPaid)
            .map((item) => ({
                ...item,
                id: `installment-${item.installmentId}`,
                kind: "expense",
                sourceKind: "installment-payment",
                sourceId: `${item.planId}:${item.installmentId}`,
                title: `دفعة ${item.person}`,
                category: "سداد دين مجدول",
                date: item.paidAt || item.dueDate,
                createdAt: item.paidAt || item.dueDate
            }));

        const recent = state.expenses.map((x) => ({ kind: "expense", sourceKind: "expense", sourceId: x.id, ...x }))
            .concat(state.incomes.map((x) => ({ kind: "income", sourceKind: "income", sourceId: x.id, ...x })))
            .concat(debtCashRows)
            .concat(installmentPaidRows)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8);

        refs.recentOperations.innerHTML = recent.length
            ? recent.map((item) => listItemMarkup(
                hidden ? "حركة مخفية" : item.title,
                hidden ? "التفاصيل مخفية في الوضع الآمن." : operationMetaText(item),
                hidden ? "••••" : formatMoney(item.amount, entryCurrency(item)),
                item.kind === "expense" ? "tone-expense" : "tone-income",
                "",
                !hidden
            )).join("")
            : emptyState("لا توجد عمليات بعد.");

        let moneyLog = state.expenses.map((x) => ({ kind: "expense", sourceKind: "expense", sourceId: x.id, ...x }))
            .concat(state.incomes.map((x) => ({ kind: "income", sourceKind: "income", sourceId: x.id, ...x })))
            .concat(debtCashRows)
            .concat(installmentPaidRows)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (currentLogFilter !== "all") {
            moneyLog = moneyLog.filter((item) => item.kind === currentLogFilter);
        }
        moneyLog = moneyLog.filter(matchesMoneyPeriod);
        if (currentMoneySearch) {
            moneyLog = moneyLog.filter((item) =>
                [item.title, item.category, item.note]
                    .filter(Boolean)
                    .some((part) => String(part).toLowerCase().includes(currentMoneySearch))
            );
        }

        refs.moneyEntries.innerHTML = moneyLog.length
            ? moneyLog.map((item) => listItemMarkup(
                hidden ? "حركة مخفية" : item.title,
                hidden ? "التفاصيل مخفية في الوضع الآمن." : operationMetaText(item),
                hidden ? "••••" : formatMoney(item.amount, entryCurrency(item)),
                item.kind === "expense" ? "tone-expense" : "tone-income",
                operationActionsMarkup(item),
                !hidden
            )).join("")
            : emptyState("لا توجد عمليات محفوظة.");

        refs.moneyEntries.querySelectorAll("[data-edit-money]").forEach((button) => {
            button.addEventListener("click", () => {
                const [kind, id] = String(button.getAttribute("data-edit-money") || "").split(":");
                startEditMoney(kind, id);
            });
        });
        refs.moneyEntries.querySelectorAll("[data-delete-money]").forEach((button) => {
            button.addEventListener("click", () => {
                const [kind, id] = String(button.getAttribute("data-delete-money") || "").split(":");
                deleteMoney(kind, id);
            });
        });
        refs.moneyEntries.querySelectorAll("[data-edit-debt-from-log]").forEach((button) => {
            button.addEventListener("click", () => {
                startEditDebt(button.getAttribute("data-edit-debt-from-log"));
            });
        });
        refs.moneyEntries.querySelectorAll("[data-delete-debt-from-log]").forEach((button) => {
            button.addEventListener("click", () => {
                deleteDebt(button.getAttribute("data-delete-debt-from-log"));
            });
        });
        refs.moneyEntries.querySelectorAll("[data-edit-installment-from-log]").forEach((button) => {
            button.addEventListener("click", () => {
                const [planId, installmentId] = String(button.getAttribute("data-edit-installment-from-log") || "").split(":");
                startEditInstallment(planId, installmentId);
            });
        });
        refs.moneyEntries.querySelectorAll("[data-unpay-installment-from-log]").forEach((button) => {
            button.addEventListener("click", () => {
                toggleInstallmentPaid(button.getAttribute("data-unpay-installment-from-log"), false);
            });
        });
    }

    function operationMetaText(item) {
        const parts = [
            escapeHtml(operationKindLabel(item)),
            escapeHtml(displayDate(item.date))
        ];
        parts.push(escapeHtml(entryCurrency(item)));
        if (item.category) parts.push(escapeHtml(item.category));
        if (item.person) parts.push(escapeHtml(item.person));
        const badge = operationDateBadge(item.date);
        const text = parts.join(" · ");
        return badge ? `${text} ${badge}` : text;
    }

    function operationKindLabel(item) {
        if (item.sourceKind === "debt-payment") {
            return item.type === "paid-to-me" ? "تحصيل دين" : "سداد دين";
        }
        if (item.sourceKind === "installment-payment") {
            return "دفعة دين مجدولة";
        }
        return item.kind === "expense" ? "مصروف" : "دخل";
    }

    function operationActionsMarkup(item) {
        if (item.sourceKind === "debt-payment") {
            return `
                <button class="inline-button neutral" type="button" data-edit-debt-from-log="${escapeHtml(item.sourceId)}">تعديل</button>
                <button class="inline-button danger" type="button" data-delete-debt-from-log="${escapeHtml(item.sourceId)}">حذف</button>
            `;
        }
        if (item.sourceKind === "installment-payment") {
            return `
                <button class="inline-button neutral" type="button" data-edit-installment-from-log="${escapeHtml(item.sourceId)}">تعديل</button>
                <button class="inline-button danger" type="button" data-unpay-installment-from-log="${escapeHtml(item.installmentId)}">إرجاع</button>
            `;
        }
        return `
            <button class="inline-button neutral" type="button" data-edit-money="${escapeHtml(item.kind)}:${escapeHtml(item.id)}">تعديل</button>
            <button class="inline-button danger" type="button" data-delete-money="${escapeHtml(item.kind)}:${escapeHtml(item.id)}">حذف</button>
        `;
    }

    function operationDateBadge(dateString) {
        if (!dateString) return "";
        const target = new Date(dateString);
        const today = new Date();
        const targetMonth = target.getMonth();
        const targetYear = target.getFullYear();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        if (targetYear === currentYear && targetMonth === currentMonth) {
            return "";
        }
        if (target > today) {
            return '<span class="meta-badge future">شهر قادم</span>';
        }
        return '<span class="meta-badge other-month">شهر آخر</span>';
    }

    function matchesMoneyPeriod(item) {
        if (currentMoneyPeriod === "all") return true;
        const target = new Date(item.date);
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        if (currentMoneyPeriod === "today") {
            return target >= startOfToday && target <= endOfToday;
        }
        if (currentMoneyPeriod === "week") {
            const start = new Date(startOfToday);
            start.setDate(start.getDate() - 6);
            return target >= start && target <= endOfToday;
        }
        if (currentMoneyPeriod === "month") {
            return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();
        }
        if (currentMoneyPeriod === "future") {
            return target > endOfToday;
        }
        if (currentMoneyPeriod === "other-month") {
            return !(target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear());
        }
        return true;
    }

    function buildSpendingInsight(currency, hidden) {
        let monthExpenses = monthItems(state.expenses).filter((item) => entryCurrency(item) === normalizeCurrency(currency));
        if (!monthExpenses.length) {
            monthExpenses = monthItems(state.expenses);
        }
        if (!monthExpenses.length) {
            return {
                title: "بانتظار حركات",
                hint: "أضف مصاريف هذا الشهر لنوضح أكثر بند استنزفك."
            };
        }
        const grouped = new Map();
        monthExpenses.forEach((item) => {
            const key = `${String(item.category || item.title || "متفرقات").trim() || "متفرقات"} · ${entryCurrency(item)}`;
            grouped.set(key, (grouped.get(key) || 0) + Number(item.amount || 0));
        });
        const sorted = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);
        const [topKey, topAmount] = sorted[0];
        const [topCategory, topCurrency = currency] = String(topKey).split(" · ");
        const total = monthExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const percent = total > 0 ? Math.round((topAmount / total) * 100) : 0;
        return {
            title: hidden ? "التفاصيل مخفية" : `${topCategory} (${topCurrency})`,
            hint: hidden
                ? "فعّل إظهار الأرقام لمعرفة تفاصيل أعلى بند صرف."
                : `أعلى بند صرف هذا الشهر هو ${topCategory} بعملة ${topCurrency} وقيمته ${formatMoney(topAmount, topCurrency)} ويشكل ${percent}% من مصروف هذه العملة.`
        };
    }

    function renderDebts(currency, hidden) {
        const forMe = debtNetByCurrency(state.debts.filter((x) => x.type === "for-me"));
        const onMe = sumByCurrency(state.debts.filter((x) => x.type === "on-me"), "amount");
        const pendingInstallments = flattenDebtInstallments().filter((item) => !item.isPaid);
        const overdueInstallments = pendingInstallments.filter((item) => daysUntil(item.dueDate) < 0);
        const pendingInstallmentsTotal = sumByCurrency(pendingInstallments, "amount");
        refs.debtSummary.innerHTML = [
            summaryPill("إلك على الناس", hidden ? "••••" : formatTotals(forMe, currency)),
            summaryPill("عليك للناس", hidden ? "••••" : formatTotals(onMe, currency)),
            summaryPill("صافي الديون", hidden ? "••••" : formatTotals(debtNetByCurrency(state.debts), currency)),
            summaryPill("دفعات بانتظار", hidden ? "••••" : formatTotals(pendingInstallmentsTotal, currency)),
            summaryPill("دفعات متأخرة", String(overdueInstallments.length))
        ].join("");

        renderPeopleSuggestions();

        const peopleRows = buildPeopleOverview(currency, hidden);
        const visiblePeople = peopleRows
            .filter((person) => showArchivedPeople || !person.archived)
            .filter((person) => !currentDebtSearch || person.searchText.includes(currentDebtSearch));

        refs.peopleOverview.innerHTML = visiblePeople.length
            ? visiblePeople.map((person) => personCardMarkup(person, currency, hidden)).join("")
            : emptyState(showArchivedPeople ? "لا توجد أسماء مطابقة." : "لا توجد أسماء نشطة مطابقة.");

        refs.peopleOverview.querySelectorAll("[data-archive-person]").forEach((button) => {
            button.addEventListener("click", () => toggleArchivePerson(button.getAttribute("data-archive-person")));
        });
        refs.peopleOverview.querySelectorAll("[data-restore-person]").forEach((button) => {
            button.addEventListener("click", () => toggleArchivePerson(button.getAttribute("data-restore-person")));
        });
        refs.peopleOverview.querySelectorAll("[data-schedule-person]").forEach((button) => {
            button.addEventListener("click", () => prepareDebtSchedule(button.getAttribute("data-schedule-person")));
        });
        refs.peopleOverview.querySelectorAll("[data-add-person-debt]").forEach((button) => {
            button.addEventListener("click", () => startNewDebtForPerson(button.getAttribute("data-add-person-debt")));
        });
        refs.peopleOverview.querySelectorAll("[data-edit-person-debt]").forEach((button) => {
            button.addEventListener("click", () => startEditLatestDebtForPerson(button.getAttribute("data-edit-person-debt")));
        });
        refs.peopleOverview.querySelectorAll("[data-edit-person-plan]").forEach((button) => {
            button.addEventListener("click", () => startEditLatestInstallmentForPerson(button.getAttribute("data-edit-person-plan")));
        });
        refs.peopleOverview.querySelectorAll("[data-delete-plan-person]").forEach((button) => {
            button.addEventListener("click", () => deleteDebtPlansForPerson(button.getAttribute("data-delete-plan-person")));
        });

        let debtItems = state.debts.slice();
        if (!showArchivedPeople) {
            debtItems = debtItems.filter((item) => !state.archivedPeople.includes(item.person));
        }
        if (currentDebtSearch) {
            debtItems = debtItems.filter((item) =>
                [item.person, item.note, debtTypeLabel(item.type)]
                    .filter(Boolean)
                    .some((part) => String(part).toLowerCase().includes(currentDebtSearch))
            );
        }

        refs.debtEntries.innerHTML = debtItems.length
            ? debtItems.map((item) => listItemMarkup(
                hidden ? "شخص مخفي" : item.person,
                hidden ? "التفاصيل مخفية في الوضع الآمن." : `${debtTypeLabel(item.type)} · ${displayDate(item.date)} · ${entryCurrency(item)}${item.note ? ` · ${item.note}` : ""}`,
                hidden ? "••••" : formatMoney(item.amount, entryCurrency(item)),
                "tone-debt",
                `
                <button class="inline-button neutral" type="button" data-edit-debt="${escapeHtml(item.id)}">تعديل</button>
                <button class="inline-button danger" type="button" data-delete-debt="${escapeHtml(item.id)}">حذف</button>
                `
            )).join("")
            : emptyState("لا توجد حركات ديون بعد.");

        refs.debtEntries.querySelectorAll("[data-edit-debt]").forEach((button) => {
            button.addEventListener("click", () => {
                startEditDebt(button.getAttribute("data-edit-debt"));
            });
        });
        refs.debtEntries.querySelectorAll("[data-delete-debt]").forEach((button) => {
            button.addEventListener("click", () => {
                deleteDebt(button.getAttribute("data-delete-debt"));
            });
        });

        const installments = flattenDebtInstallments()
            .filter((item) => showArchivedPeople || !state.archivedPeople.includes(item.person))
            .filter((item) => !currentDebtSearch || `${item.person} ${item.note || ""}`.toLowerCase().includes(currentDebtSearch))
            .filter(matchesInstallmentFilter)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        refs.debtInstallmentEntries.innerHTML = installments.length
            ? installments.map((item) => debtInstallmentItemMarkup(item, currency, hidden)).join("")
            : emptyState("لا توجد دفعات مجدولة بعد.");

        refs.debtInstallmentEntries.querySelectorAll("[data-pay-installment]").forEach((button) => {
            button.addEventListener("click", () => {
                markInstallmentPaid(button.getAttribute("data-pay-installment"));
            });
        });
        refs.debtInstallmentEntries.querySelectorAll("[data-unpay-installment]").forEach((button) => {
            button.addEventListener("click", () => {
                toggleInstallmentPaid(button.getAttribute("data-unpay-installment"), false);
            });
        });
        refs.debtInstallmentEntries.querySelectorAll("[data-edit-installment]").forEach((button) => {
            button.addEventListener("click", () => {
                const [planId, installmentId] = String(button.getAttribute("data-edit-installment") || "").split(":");
                startEditInstallment(planId, installmentId);
            });
        });
        refs.debtInstallmentEntries.querySelectorAll("[data-delete-installment]").forEach((button) => {
            button.addEventListener("click", () => {
                const [planId, installmentId] = String(button.getAttribute("data-delete-installment") || "").split(":");
                deleteInstallment(planId, installmentId);
            });
        });
    }

    function renderCommitments(currency, hidden) {
        const upcoming = state.commitments
            .filter((x) => !x.isPaid)
            .map((x) => ({ ...x, kind: "commitment" }))
            .concat(flattenDebtInstallments().filter((x) => !x.isPaid).map((x) => ({ ...x, kind: "debt-installment" })))
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        refs.upcomingCommitments.innerHTML = upcoming.length
            ? upcoming.slice(0, 6).map((item) => listItemMarkup(
                hidden ? "استحقاق مخفي" : (item.kind === "debt-installment" ? `دفعة ${item.person}` : item.name),
                hidden ? "التفاصيل مخفية في الوضع الآمن." : `${item.kind === "debt-installment" ? `دفعة ${item.sequence}/${item.installmentCount} · ` : ""}${displayDate(item.dueDate)} · ${entryCurrency(item)}${item.note ? ` · ${item.note}` : ""}`,
                hidden ? "••••" : formatMoney(item.amount, entryCurrency(item)),
                installmentTone(item)
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
        refs.commitmentEntries.querySelectorAll("[data-edit-commitment]").forEach((button) => {
            button.addEventListener("click", () => {
                startEditCommitment(button.getAttribute("data-edit-commitment"));
            });
        });
    }

    function matchesInstallmentFilter(item) {
        if (currentInstallmentFilter === "all") return true;
        const days = daysUntil(item.dueDate);
        if (currentInstallmentFilter === "pending") return !item.isPaid;
        if (currentInstallmentFilter === "paid") return item.isPaid;
        if (currentInstallmentFilter === "overdue") return !item.isPaid && days < 0;
        if (currentInstallmentFilter === "soon") return !item.isPaid && days >= 0 && days <= 7;
        return true;
    }

    function renderReminders() {
        const reminders = state.reminders
            .slice()
            .sort((a, b) => Number(a.isDone) - Number(b.isDone) || new Date(a.date) - new Date(b.date));

        refs.reminderEntries.innerHTML = reminders.length
            ? reminders.map((item) => reminderItemMarkup(item)).join("")
            : emptyState("لا توجد تذكيرات محفوظة.");

        refs.reminderEntries.querySelectorAll("[data-reminder-done]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-reminder-done");
                state.reminders = state.reminders.map((item) => item.id === id ? { ...item, isDone: !item.isDone } : item);
                saveState();
                render();
                toast("تم تحديث حالة التذكير.");
            });
        });

        refs.reminderEntries.querySelectorAll("[data-reminder-delete]").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-reminder-delete");
                state.reminders = state.reminders.filter((item) => item.id !== id);
                saveState();
                render();
                toast("تم حذف التذكير.");
            });
        });
        refs.reminderEntries.querySelectorAll("[data-reminder-edit]").forEach((button) => {
            button.addEventListener("click", () => {
                startEditReminder(button.getAttribute("data-reminder-edit"));
            });
        });
    }

    function renderMonthClosing(currency, hidden, monthIncome, monthExpense, monthBalance, savingCurrent) {
        const rating = buildMonthRating(amountForCurrency(monthIncome, currency), amountForCurrency(monthExpense, currency), amountForCurrency(monthBalance, currency), amountForCurrency(savingCurrent, currency));
        const insight = buildSpendingInsight(currency, hidden);
        refs.monthClosingSummary.innerHTML = [
            summaryPill("تقييم الشهر", rating.label),
            summaryPill("صافي الشهر", hidden ? "••••" : formatTotals(savingCurrent, currency)),
            summaryPill("أعلى بند", insight.title)
        ].join("");

        const insights = [
            {
                title: "وين راحت المصاري؟",
                meta: insight.hint
            },
            {
                title: "وضع الشهر",
                meta: rating.hint
            }
        ];

        refs.monthClosingInsights.innerHTML = insights.map((item) =>
            `<div class="list-item"><div><div class="list-title">${escapeHtml(item.title)}</div><div class="list-meta">${escapeHtml(item.meta)}</div></div></div>`
        ).join("");
    }

    function renderMonthlyReport(currency, hidden) {
        const { debtCashInRows, debtCashOutRows, paidInstallmentCashRows } = buildCashFlowRows();
        const incomeRows = monthItems(state.incomes);
        const expenseRows = monthItems(state.expenses);
        const collectedDebtRows = monthItems(debtCashInRows);
        const paidDebtRows = monthItems(debtCashOutRows);
        const scheduledPaidRows = monthItems(paidInstallmentCashRows);

        const monthIncomeTotal = sumByCurrency(incomeRows, "amount");
        const monthExpenseTotal = sumByCurrency(expenseRows, "amount");
        const collectedDebtTotal = sumByCurrency(collectedDebtRows, "amount");
        const paidDebtTotal = sumByCurrency(paidDebtRows, "amount");
        const scheduledPaidTotal = sumByCurrency(scheduledPaidRows, "amount");
        const totalIncoming = sumMaps(monthIncomeTotal, collectedDebtTotal);
        const totalOutgoing = sumMaps(sumMaps(monthExpenseTotal, paidDebtTotal), scheduledPaidTotal);
        const netMonth = subtractTotals(totalIncoming, totalOutgoing);

        refs.monthlyReportSummary.innerHTML = [
            summaryPill("دخل الشهر", hidden ? "••••" : formatTotals(totalIncoming, currency)),
            summaryPill("خارج الشهر", hidden ? "••••" : formatTotals(totalOutgoing, currency)),
            summaryPill("صافي الشهر", hidden ? "••••" : formatTotals(netMonth, currency))
        ].join("");

        const reportRows = [
            {
                title: "الدخل المباشر",
                meta: `${incomeRows.length} حركة دخل مسجلة هذا الشهر.`,
                value: hidden ? "••••" : formatTotals(monthIncomeTotal, currency),
                tone: "tone-income"
            },
            {
                title: "تحصيل الديون",
                meta: `${collectedDebtRows.length} حركة تحصيل دين هذا الشهر.`,
                value: hidden ? "••••" : formatTotals(collectedDebtTotal, currency),
                tone: "tone-income"
            },
            {
                title: "المصروف المباشر",
                meta: `${expenseRows.length} حركة مصروف عادية هذا الشهر.`,
                value: hidden ? "••••" : formatTotals(monthExpenseTotal, currency),
                tone: "tone-expense"
            },
            {
                title: "سداد الديون",
                meta: `${paidDebtRows.length} حركة سداد دين غير مجدولة هذا الشهر.`,
                value: hidden ? "••••" : formatTotals(paidDebtTotal, currency),
                tone: "tone-warning"
            },
            {
                title: "الدفعات المجدولة المدفوعة",
                meta: `${scheduledPaidRows.length} دفعة مجدولة تم دفعها هذا الشهر.`,
                value: hidden ? "••••" : formatTotals(scheduledPaidTotal, currency),
                tone: "tone-warning"
            },
            {
                title: "خلاصة واضحة",
                meta: hidden
                    ? "فعّل إظهار الأرقام لتشوف تقرير الشهر كاملًا."
                    : `دخلك الكلي هذا الشهر ${formatTotals(totalIncoming, currency)}، وخارجك الكلي ${formatTotals(totalOutgoing, currency)}، والمتبقي من حركة هذا الشهر ${formatTotals(netMonth, currency)}.`,
                value: hidden ? "••••" : formatTotals(netMonth, currency),
                tone: amountForCurrency(netMonth, currency) >= 0 ? "tone-income" : "tone-expense"
            }
        ];

        refs.monthlyReportBreakdown.innerHTML = reportRows.map((item) =>
            `<div class="list-item"><div><div class="list-title">${escapeHtml(item.title)}</div><div class="list-meta">${escapeHtml(item.meta)}</div></div><div class="list-actions"><div class="list-value ${item.tone}">${escapeHtml(item.value)}</div></div></div>`
        ).join("");
    }

    function renderMonthlyArchives(currency, hidden) {
        const archives = (state.monthlyArchives || []).slice().sort((a, b) => String(b.monthKey).localeCompare(String(a.monthKey)));
        refs.monthlyArchivesList.innerHTML = archives.length
            ? archives.map((item) => monthlyArchiveMarkup(item, currency, hidden)).join("")
            : emptyState("لا توجد أرشفة شهرية بعد.");

        refs.monthlyArchivesList.querySelectorAll("[data-delete-archive]").forEach((button) => {
            button.addEventListener("click", () => {
                const monthKey = button.getAttribute("data-delete-archive");
                deleteMonthlyArchive(monthKey);
            });
        });
    }

    function renderMonthComparison(currency, hidden) {
        const previousIncome = sumByCurrency(previousMonthItems(state.incomes), "amount");
        const previousExpense = sumByCurrency(previousMonthItems(state.expenses), "amount");
        const currentIncome = sumByCurrency(monthItems(state.incomes), "amount");
        const currentExpense = sumByCurrency(monthItems(state.expenses), "amount");
        const incomeDiff = subtractTotals(currentIncome, previousIncome);
        const expenseDiff = subtractTotals(currentExpense, previousExpense);
        const better = amountForCurrency(expenseDiff, currency) <= 0;

        refs.monthCompareSummary.innerHTML = [
            summaryPill("دخل الشهر", hidden ? "••••" : formatTotals(currentIncome, currency)),
            summaryPill("فرق الدخل", hidden ? "••••" : formatTotals(incomeDiff, currency)),
            summaryPill("فرق الصرف", hidden ? "••••" : formatTotals(expenseDiff, currency))
        ].join("");

        const lines = [
            Object.keys(previousIncome).length || Object.keys(previousExpense).length
                ? `مقارنة بالشهر الماضي: ${amountForCurrency(expenseDiff, currency) > 0 ? "صرفك زاد" : amountForCurrency(expenseDiff, currency) < 0 ? "صرفك انخفض" : "صرفك ثابت"} بمقدار ${hidden ? "••••" : formatMoney(Math.abs(amountForCurrency(expenseDiff, currency)), currency)} في العملة الأساسية.`
                : "لا توجد بيانات كافية من الشهر الماضي للمقارنة الكاملة.",
            better
                ? "الوضع الحالي أفضل أو أهدأ من الشهر الماضي من ناحية الصرف."
                : "هذا الشهر أثقل من الشهر الماضي ويحتاج شدًّا أكثر."
        ];

        refs.monthCompareInsights.innerHTML = lines.map((text) =>
            `<div class="list-item"><div><div class="list-meta">${escapeHtml(text)}</div></div></div>`
        ).join("");
    }

    function renderDamageReport(currency, hidden) {
        const monthExpenseRows = monthItems(state.expenses);
        if (!monthExpenseRows.length) {
            refs.damageReportList.innerHTML = emptyState("أضف مصاريف هذا الشهر حتى نبني كشف الخراب.");
            return;
        }

        const topDay = topGroupedValue(monthExpenseRows, (item) => `${item.date} · ${entryCurrency(item)}`, (key) => key);
        const topCategory = topGroupedValue(monthExpenseRows, (item) => `${item.category || item.title || "متفرقات"} · ${entryCurrency(item)}`);
        const topPerson = topGroupedValue(state.debts.filter((item) => item.type === "on-me" && isInCurrentMonth(item.date)), (item) => `${item.person} · ${entryCurrency(item)}`, (name) => name || "لا يوجد");

        const topDayInfo = splitLabeledCurrencyKey(topDay.key || topDay.label);
        const topCategoryInfo = splitLabeledCurrencyKey(topCategory.key || topCategory.label);
        const topPersonInfo = splitLabeledCurrencyKey(topPerson.key || topPerson.label);

        const rows = [
            {
                title: "أكثر يوم صرفت فيه",
                meta: topDayInfo.label,
                value: hidden ? "••••" : formatMoney(topDay.amount, topDayInfo.currency),
                tone: "tone-expense"
            },
            {
                title: "أكثر بند أتعبك",
                meta: topCategoryInfo.label,
                value: hidden ? "••••" : formatMoney(topCategory.amount, topCategoryInfo.currency),
                tone: "tone-warning"
            },
            {
                title: "أكثر شخص عليك له هذا الشهر",
                meta: topPersonInfo.label,
                value: hidden ? "••••" : formatMoney(topPerson.amount, topPersonInfo.currency),
                tone: "tone-debt"
            }
        ];

        refs.damageReportList.innerHTML = rows.map((item) =>
            `<div class="list-item"><div><div class="list-title">${escapeHtml(item.title)}</div><div class="list-meta">${escapeHtml(item.meta)}</div></div><div class="list-actions"><div class="list-value ${item.tone}">${escapeHtml(item.value)}</div></div></div>`
        ).join("");
    }

    function archiveCurrentMonth() {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = new Intl.DateTimeFormat("ar", { year: "numeric", month: "long" }).format(now);
        const currency = state.profile.currency || "₪";
        const monthIncomes = monthItems(state.incomes);
        const monthExpenses = monthItems(state.expenses);
        const monthIncome = sumByCurrency(monthIncomes, "amount");
        const monthExpense = sumByCurrency(monthExpenses, "amount");
        const net = subtractTotals(monthIncome, monthExpense);
        const topExpense = topExpenseCategory();
        const rating = buildMonthRating(amountForCurrency(monthIncome, currency), amountForCurrency(monthExpense, currency), amountForCurrency(net, currency), amountForCurrency(net, currency));

        const snapshot = {
            monthKey,
            monthLabel,
            archivedAt: new Date().toISOString(),
            currency,
            incomeTotals: monthIncome,
            expenseTotals: monthExpense,
            netTotals: net,
            topCategory: topExpense.title,
            topCategoryAmount: topExpense.amount,
            rating: rating.label,
            ratingHint: rating.hint
        };

        state.monthlyArchives = (state.monthlyArchives || []).filter((item) => item.monthKey !== monthKey);
        state.monthlyArchives.unshift(snapshot);
        saveState();
        render();
        toast(`تمت أرشفة ${monthLabel}.`);
    }

    function deleteMonthlyArchive(monthKey) {
        if (!monthKey) return;
        if (!window.confirm("هل تريد حذف هذه الأرشفة الشهرية؟")) return;
        state.monthlyArchives = (state.monthlyArchives || []).filter((item) => item.monthKey !== monthKey);
        saveState();
        render();
        toast("تم حذف الأرشفة الشهرية.");
    }

    function monthlyArchiveMarkup(item, currency, hidden) {
        return `<div class="list-item">
            <div>
                <div class="list-title">${escapeHtml(item.monthLabel)}</div>
                <div class="list-meta">${escapeHtml(item.rating)} · ${escapeHtml(item.topCategory || "بدون بند واضح")} · ${escapeHtml(displayDate(item.archivedAt))}</div>
            </div>
            <div class="list-actions">
                <div class="list-value ${amountForCurrency(item.netTotals || {}, item.currency || currency) >= 0 ? "tone-income" : "tone-expense"}">${escapeHtml(hidden ? "••••" : formatTotals(item.netTotals || { [normalizeCurrency(item.currency || currency)]: Number(item.net || 0) }, item.currency || currency))}</div>
                <button class="inline-button danger" type="button" data-delete-archive="${escapeHtml(item.monthKey)}">حذف</button>
            </div>
        </div>`;
    }

    function buildMonthRating(monthIncome, monthExpense, monthBalance, savingCurrent) {
        const budget = Number(state.profile.monthlyBudget || 0);
        const goal = Number(state.profile.savingGoal || 0);
        if (monthIncome <= 0 && monthExpense <= 0) {
            return {
                label: "بانتظار بيانات",
                hint: "هذا الشهر لا يحتوي على دخل أو مصروف كافٍ لإعطاء تقييم عادل."
            };
        }
        if (monthBalance < 0) {
            return {
                label: "خطر",
                hint: "الصرف أعلى من الدخل الحالي، ويحتاج الشهر إلى شد واضح."
            };
        }
        if (budget > 0 && monthExpense > budget) {
            return {
                label: "مضغوط",
                hint: "تجاوزت سقف المصروف الشهري، رغم أن الرصيد لم يدخل منطقة الخطر بعد."
            };
        }
        if (goal > 0 && savingCurrent >= goal) {
            return {
                label: "ممتاز",
                hint: "وصلت هدف التوفير أو تجاوزته، وهذا شهر نظيف جدًا."
            };
        }
        if (monthBalance > 0) {
            return {
                label: "جيد",
                hint: "لا يزال معك فائض آخر الشهر، والوضع العام متزن."
            };
        }
        return {
            label: "مقبول",
            hint: "الشهر ماشي، لكنه يحتاج ضبط أكثر حتى تشوف فرقًا أوفر."
        };
    }

    function topExpenseCategory() {
        const grouped = new Map();
        monthItems(state.expenses).forEach((item) => {
            const key = `${String(item.category || item.title || "متفرقات").trim() || "متفرقات"} · ${entryCurrency(item)}`;
            grouped.set(key, (grouped.get(key) || 0) + Number(item.amount || 0));
        });
        const top = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1])[0];
        return top ? { title: top[0], amount: top[1] } : { title: "لا يوجد", amount: 0 };
    }

    function buildFinancialSafety(currency, hidden, currentBalance) {
        const avgDailyExpense = averageDailyExpenseCurrentMonth(currency);
        const upcomingSevenDays = state.commitments
            .filter((item) => !item.isPaid && entryCurrency(item) === normalizeCurrency(currency) && daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 7)
            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
            + flattenDebtInstallments()
                .filter((item) => !item.isPaid && entryCurrency(item) === normalizeCurrency(currency) && daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 7)
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const pressureBase = Math.max(1, (avgDailyExpense * 14) + upcomingSevenDays);
        const rawPercent = Math.max(0, Math.min(100, Math.round((Math.max(0, amountForCurrency(currentBalance, currency)) / pressureBase) * 100)));
        const tone = rawPercent >= 75 ? "success" : rawPercent >= 45 ? "warning" : "danger";
        const daysCover = avgDailyExpense > 0 ? Math.floor(Math.max(0, amountForCurrency(currentBalance, currency)) / avgDailyExpense) : 0;

        return {
            percent: rawPercent,
            tone,
            hint: hidden
                ? "فعّل إظهار الأرقام لمعرفة قوة الأمان المالي."
                : avgDailyExpense <= 0
                    ? "لا توجد بيانات صرف كافية لحساب الأمان المالي بدقة."
                    : `معك سيولة تكفي تقريبًا ${daysCover} يوم، مع احتساب متوسط الصرف اليومي والالتزامات القريبة.`
        };
    }

    function previousMonthItems(items) {
        const now = new Date();
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return items.filter((item) => {
            const date = new Date(item.date);
            return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear();
        });
    }

    function buildCashFlowRows() {
        const debtCashInRows = state.debts
            .filter((item) => item.type === "paid-to-me")
            .map((item) => ({
                ...item,
                title: item.note || `سداد من ${item.person}`,
                category: "تحصيل دين"
            }));
        const debtCashOutRows = state.debts
            .filter((item) => item.type === "paid-by-me")
            .map((item) => ({
                ...item,
                title: item.note || `سداد لـ ${item.person}`,
                category: "سداد دين"
            }));
        const paidInstallmentCashRows = flattenDebtInstallments()
            .filter((item) => item.isPaid)
            .map((item) => ({
                id: `installment-paid-${item.installmentId}`,
                amount: Number(item.amount || 0),
                currency: entryCurrency(item),
                date: item.paidAt || item.dueDate,
                createdAt: item.paidAt || item.dueDate,
                title: `دفعة ${item.person}`,
                category: "سداد دين مجدول",
                note: item.note || "",
                person: item.person,
                planId: item.planId,
                installmentId: item.installmentId,
                sourceKind: "installment-payment",
                sourceId: `${item.planId}:${item.installmentId}`
            }));

        return {
            debtCashInRows,
            debtCashOutRows,
            paidInstallmentCashRows
        };
    }

    function averageDailyExpenseCurrentMonth(currency) {
        const rows = monthItems(state.expenses).filter((item) => entryCurrency(item) === normalizeCurrency(currency));
        if (!rows.length) return 0;
        const groupedDays = new Set(rows.map((item) => item.date)).size || 1;
        return sum(rows, "amount") / groupedDays;
    }

    function topGroupedValue(items, keySelector, labelFormatter) {
        const grouped = new Map();
        items.forEach((item) => {
            const key = String(keySelector(item) || "غير محدد").trim() || "غير محدد";
            grouped.set(key, (grouped.get(key) || 0) + Number(item.amount || 0));
        });
        const top = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1])[0];
        if (!top) {
            return { label: "لا يوجد", amount: 0 };
        }
        return {
            key: top[0],
            label: labelFormatter ? labelFormatter(top[0]) : top[0],
            amount: top[1]
        };
    }

    function splitLabeledCurrencyKey(keyValue) {
        const raw = String(keyValue || "").trim();
        if (!raw) {
            return {
                label: "لا يوجد",
                currency: normalizeCurrency(state.profile.currency || "₪")
            };
        }
        const parts = raw.split(" · ");
        const lastPart = parts[parts.length - 1];
        const maybeCurrency = normalizeCurrency(lastPart);
        const isCurrency = ["₪", "JD", "$"].includes(maybeCurrency);
        return {
            label: isCurrency ? (parts.slice(0, -1).join(" · ") || raw) : raw,
            currency: isCurrency ? maybeCurrency : normalizeCurrency(state.profile.currency || "₪")
        };
    }

    function isInCurrentMonth(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    function listItemMarkup(title, meta, valueText, tone, actions = "", metaIsHtml = false) {
        return `<div class="list-item"><div><div class="list-title">${escapeHtml(title)}</div><div class="list-meta">${metaIsHtml ? meta : escapeHtml(meta)}</div></div><div class="list-actions"><div class="list-value ${tone}">${escapeHtml(valueText)}</div>${actions}</div></div>`;
    }

    function debtInstallmentItemMarkup(item, currency, hidden) {
        return `<div class="list-item">
            <div>
                <div class="list-title">${escapeHtml(hidden ? "دفعة مخفية" : `${item.person} · دفعة ${String(item.sequence)}/${String(item.installmentCount)}`)}</div>
                <div class="list-meta">${escapeHtml(hidden ? "التفاصيل مخفية في الوضع الآمن." : debtInstallmentMeta(item))}</div>
            </div>
            <div class="list-actions">
                <div class="list-value ${installmentTone(item)}">${escapeHtml(hidden ? "••••" : formatMoney(item.amount, entryCurrency(item)))}</div>
                <button class="inline-button neutral" type="button" data-edit-installment="${escapeHtml(item.planId)}:${escapeHtml(item.installmentId)}">تعديل</button>
                ${!item.isPaid ? `<button class="inline-button success" type="button" data-pay-installment="${escapeHtml(item.installmentId)}">تم الدفع</button>` : `<button class="inline-button neutral" type="button" data-unpay-installment="${escapeHtml(item.installmentId)}">إرجاع</button>`}
                <button class="inline-button danger" type="button" data-delete-installment="${escapeHtml(item.planId)}:${escapeHtml(item.installmentId)}">حذف</button>
            </div>
        </div>`;
    }

    function personCardMarkup(person, currency, hidden) {
        return `<div class="person-card">
            <div class="person-head">
                <div>
                    <div class="person-name">${escapeHtml(hidden ? "اسم مخفي" : person.name)}</div>
                    <div class="person-meta">${escapeHtml(hidden ? "التفاصيل مخفية في الوضع الآمن." : person.meta)}</div>
                </div>
                <div class="list-value ${person.hasNegativeBalance ? "tone-expense" : "tone-income"}">${escapeHtml(hidden ? "••••" : formatTotals(person.netByCurrency, currency))}</div>
            </div>
            <div class="person-actions">
                <button class="inline-button neutral" type="button" data-add-person-debt="${escapeHtml(person.name)}">إضافة حركة</button>
                ${person.latestDebtId ? `<button class="inline-button neutral" type="button" data-edit-person-debt="${escapeHtml(person.name)}">تعديل آخر حركة</button>` : ""}
                ${person.hasNegativeBalance ? `<button class="inline-button success" type="button" data-schedule-person="${escapeHtml(person.name)}">جدولة الدين</button>` : ""}
                ${person.latestInstallmentId ? `<button class="inline-button success" type="button" data-edit-person-plan="${escapeHtml(person.name)}">تعديل دفعة</button>` : ""}
                ${person.hasPlan ? `<button class="inline-button danger" type="button" data-delete-plan-person="${escapeHtml(person.name)}">حذف الجدولة</button>` : ""}
                <button class="inline-button neutral" type="button" ${person.archived ? `data-restore-person="${escapeHtml(person.name)}"` : `data-archive-person="${escapeHtml(person.name)}"`}>
                    ${person.archived ? "استرجاع" : "أرشفة"}
                </button>
            </div>
        </div>`;
    }

    function reminderItemMarkup(item) {
        return `<div class="list-item">
            <div>
                <div class="list-title">${escapeHtml(item.title)}</div>
                <div class="list-meta">${escapeHtml(displayDate(item.date))}${item.note ? ` · ${escapeHtml(item.note)}` : ""}${item.isDone ? " · تم" : " · بانتظار"}</div>
            </div>
            <div class="list-actions">
                <button class="inline-button neutral" type="button" data-reminder-edit="${escapeHtml(item.id)}">تعديل</button>
                <button class="inline-button success" type="button" data-reminder-done="${escapeHtml(item.id)}">${item.isDone ? "إرجاع" : "تم"}</button>
                <button class="inline-button danger" type="button" data-reminder-delete="${escapeHtml(item.id)}">حذف</button>
            </div>
        </div>`;
    }

    function flattenDebtInstallments() {
        return state.debtPlans.flatMap((plan) =>
            (plan.installments || []).map((installment) => ({
                planId: plan.id,
                person: plan.person,
                currency: normalizeCurrency(plan.currency || state.profile.currency || "₪"),
                installmentId: installment.id,
                amount: Number(installment.amount || 0),
                dueDate: installment.dueDate,
                isPaid: !!installment.isPaid,
                paidAt: installment.paidAt || "",
                sequence: installment.sequence,
                installmentCount: plan.installmentCount,
                note: installment.note || plan.note || ""
            }))
        );
    }

    function syncDebtPlan(plan) {
        const installments = (plan.installments || []).map((item, index, source) => ({
            ...item,
            sequence: index + 1,
            amount: Number(item.amount || 0),
            installmentCount: source.length
        }));
        return {
            ...plan,
            currency: normalizeCurrency(plan.currency || state.profile.currency || "₪"),
            installments,
            installmentCount: installments.length,
            totalAmount: installments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        };
    }

    function buildInstallments(total, count, startDate) {
        const cents = Math.round(Number(total || 0) * 100);
        const base = Math.floor(cents / count);
        const remainder = cents - (base * count);
        return Array.from({ length: count }, (_, index) => ({
            amount: (base + (index === count - 1 ? remainder : 0)) / 100
        }));
    }

    function shiftDateByInterval(startDate, interval, index) {
        const date = new Date(startDate);
        if (interval === "weekly") {
            date.setDate(date.getDate() + (index * 7));
        } else if (interval === "daily30") {
            date.setDate(date.getDate() + (index * 30));
        } else {
            date.setMonth(date.getMonth() + index);
        }
        return dateValue(date);
    }

    function markInstallmentPaid(installmentId) {
        toggleInstallmentPaid(installmentId, true);
    }

    function toggleInstallmentPaid(installmentId, nextPaidState) {
        state.debtPlans = state.debtPlans.map((plan) => ({
            ...plan,
            installments: (plan.installments || []).map((item) =>
                item.id === installmentId
                    ? { ...item, isPaid: nextPaidState, paidAt: nextPaidState ? dateValue(new Date()) : "" }
                    : item
            )
        }));
        saveState();
        render();
        toast(nextPaidState ? "تم حفظ الدفعة." : "تمت إعادة الدفعة إلى بانتظار.");
    }

    function debtInstallmentMeta(item) {
        const due = displayDate(item.dueDate);
        if (item.isPaid) {
            if (item.paidAt && item.paidAt !== item.dueDate) {
                const isLate = new Date(item.paidAt) > new Date(item.dueDate);
                return `${entryCurrency(item)} · ${due} · ${isLate ? "مدفوعة متأخرة" : "مدفوعة"} ${item.paidAt ? `· بتاريخ ${displayDate(item.paidAt)}` : ""}${item.note ? ` · ${item.note}` : ""}`;
            }
            return `${entryCurrency(item)} · ${due} · مدفوعة${item.note ? ` · ${item.note}` : ""}`;
        }
        const days = daysUntil(item.dueDate);
        if (days < 0) {
            return `${entryCurrency(item)} · ${due} · متأخرة منذ ${Math.abs(days)} يوم${item.note ? ` · ${item.note}` : ""}`;
        }
        return `${entryCurrency(item)} · ${due} · بانتظار${item.note ? ` · ${item.note}` : ""}`;
    }

    function installmentTone(item) {
        if (item.isPaid) {
            return item.paidAt && new Date(item.paidAt) > new Date(item.dueDate) ? "tone-warning" : "tone-income";
        }
        return daysUntil(item.dueDate) < 0 ? "tone-expense" : "tone-warning";
    }

    function buildPeopleOverview(currency, hidden) {
        const grouped = new Map();
        state.debts.forEach((item) => {
            const key = String(item.person || "").trim();
            if (!key) return;
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(item);
        });
        return Array.from(grouped.entries()).map(([name, items]) => {
            const netByCurrency = debtNetByCurrency(items);
            const personPlans = state.debtPlans.filter((plan) => plan.person === name);
            const planStats = personPlans
                .reduce((acc, plan) => {
                    const installments = Array.isArray(plan.installments) ? plan.installments : [];
                    acc.total += installments.length;
                    acc.paid += installments.filter((x) => x.isPaid).length;
                    acc.remaining = sumMaps(acc.remaining, sumByCurrency(installments.filter((x) => !x.isPaid).map((x) => ({ ...x, currency: plan.currency })), "amount"));
                    return acc;
                }, { total: 0, paid: 0, remaining: {} });
            const latestDebt = items
                .slice()
                .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))[0];
            const latestInstallment = personPlans
                .flatMap((plan) => (plan.installments || []).map((installment) => ({
                    planId: plan.id,
                    installmentId: installment.id,
                    dueDate: installment.dueDate
                })))
                .sort((a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0))[0];
            const archived = state.archivedPeople.includes(name);
            const planMeta = planStats.total
                ? ` · دفعات ${planStats.paid}/${planStats.total} · متبقي مجدول ${formatTotals(planStats.remaining, state.profile.currency || "₪")}`
                : "";
            const hasNegativeBalance = Object.values(netByCurrency).some((amountValue) => Number(amountValue || 0) < 0);
            return {
                name,
                netByCurrency,
                archived,
                hasNegativeBalance,
                hasPlan: planStats.total > 0,
                latestDebtId: latestDebt?.id || "",
                latestInstallmentId: latestInstallment?.installmentId || "",
                meta: `${items.length} حركة${archived ? " · مؤرشف" : ""}${planMeta}`,
                searchText: `${name} ${items.map((x) => `${x.note || ""} ${debtTypeLabel(x.type)} ${entryCurrency(x)}`).join(" ")}`.toLowerCase()
            };
        }).sort((a, b) => a.name.localeCompare(b.name, "ar"));
    }

    function toggleArchivePerson(name) {
        if (!name) return;
        const archived = state.archivedPeople.includes(name);
        state.archivedPeople = archived
            ? state.archivedPeople.filter((item) => item !== name)
            : state.archivedPeople.concat(name);
        saveState();
        render();
        toast(archived ? "تم استرجاع الشخص." : "تمت أرشفة الشخص.");
    }

    function deleteDebtPlansForPerson(name) {
        if (!name) return;
        if (!window.confirm(`سيتم حذف كل دفعات الجدولة الخاصة بـ ${name}. هل تريد المتابعة؟`)) return;
        state.debtPlans = state.debtPlans.filter((plan) => plan.person !== name);
        if (editingInstallmentPlanId) {
            const stillExists = state.debtPlans.some((plan) => plan.id === editingInstallmentPlanId);
            if (!stillExists) resetInstallmentEditForm();
        }
        saveState();
        render();
        toast(`تم حذف جدولة ${name}.`);
    }

    function prepareDebtSchedule(name) {
        if (!name) return;
        const personRows = buildPeopleOverview();
        const person = personRows.find((item) => item.name === name);
        if (!person) {
            toast("تعذر العثور على رصيد هذا الشخص.");
            return;
        }
        if (!person.hasNegativeBalance) {
            toast("هذا الشخص لا يظهر عليك رصيدًا يحتاج إلى جدولة.");
            return;
        }

        const negativeCurrencies = Object.entries(person.netByCurrency)
            .filter(([, amountValue]) => Number(amountValue || 0) < 0)
            .sort((a, b) => Math.abs(Number(b[1] || 0)) - Math.abs(Number(a[1] || 0)));
        const preferredCurrency = negativeCurrencies.find(([currencyKey]) => currencyKey === normalizeCurrency(state.profile.currency || "₪"))?.[0]
            || negativeCurrencies[0]?.[0]
            || normalizeCurrency(state.profile.currency || "₪");
        const preferredAmount = Math.abs(Number(negativeCurrencies.find(([currencyKey]) => currencyKey === preferredCurrency)?.[1] || 0));

        setValue("debtPlanPerson", person.name);
        setValue("debtPlanTotal", preferredAmount.toFixed(2));
        setValue("debtPlanCurrency", preferredCurrency);
        if (!value("debtPlanCount")) setValue("debtPlanCount", "4");
        if (!value("debtPlanStartDate")) setValue("debtPlanStartDate", dateValue(new Date()));
        switchPanel("debts");
        window.setTimeout(() => {
            refs.debtPlanForm?.scrollIntoView({ behavior: "smooth", block: "start" });
            const target = document.getElementById("debtPlanCount");
            if (target) target.focus();
        }, 120);
        toast(negativeCurrencies.length > 1 ? `تم تجهيز خطة سداد لـ ${name}. تأكد من اختيار العملة الصحيحة.` : `تم تجهيز خطة سداد لـ ${name}.`);
    }

    function renderPeopleSuggestions() {
        const names = Array.from(new Set(
            state.debts.map((item) => String(item.person || "").trim())
                .concat(state.debtPlans.map((item) => String(item.person || "").trim()))
                .filter(Boolean)
        )).sort((a, b) => a.localeCompare(b, "ar"));
        if (!refs.peopleSuggestions) return;
        refs.peopleSuggestions.innerHTML = names.map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
    }

    function commitmentItemMarkup(item, currency, hidden) {
        return `<div class="list-item">
            <div>
                <div class="list-title">${escapeHtml(item.name)}</div>
                <div class="list-meta">${escapeHtml(item.isPaid ? "مدفوع" : "غير مدفوع")} · ${escapeHtml(displayDate(item.dueDate))} · ${escapeHtml(entryCurrency(item))}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</div>
            </div>
            <div class="list-actions">
                <div class="list-value ${item.isPaid ? "tone-income" : "tone-warning"}">${escapeHtml(hidden ? "••••" : formatMoney(item.amount, entryCurrency(item)))}</div>
                <button class="inline-button neutral" type="button" data-edit-commitment="${escapeHtml(item.id)}">تعديل</button>
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
        if (valueAmount && typeof valueAmount === "object" && !Array.isArray(valueAmount)) {
            element.textContent = hidden ? "••••" : formatTotals(valueAmount, currency);
            return;
        }
        element.textContent = hidden ? "••••" : formatMoney(valueAmount, currency);
    }

    function monthItems(items) {
        const now = new Date();
        return items.filter((item) => {
            const date = new Date(item.date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
    }

    function itemsUpToToday(items) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return items.filter((item) => {
            const date = new Date(item.date);
            return date <= today;
        });
    }

    function sum(items, key) {
        return items.reduce((total, item) => total + Number(item[key] || 0), 0);
    }

    function normalizeCurrency(rawValue) {
        const raw = String(rawValue || "").trim();
        const upper = raw.toUpperCase();
        if (!raw) return "₪";
        if (raw === "₪" || upper === "ILS" || upper === "NIS") return "₪";
        if (upper === "JD" || upper === "JOD") return "JD";
        if (raw === "$" || upper === "USD") return "$";
        return raw;
    }

    function entryCurrency(item) {
        return normalizeCurrency(item?.currency || state.profile.currency || "₪");
    }

    function addToTotals(totals, currency, amountValue) {
        const key = normalizeCurrency(currency);
        totals[key] = Number(totals[key] || 0) + Number(amountValue || 0);
        return totals;
    }

    function sumByCurrency(items, key) {
        return items.reduce((totals, item) => addToTotals(totals, entryCurrency(item), Number(item[key] || 0)), {});
    }

    function subtractTotals(leftTotals, rightTotals) {
        const next = { ...(leftTotals || {}) };
        Object.entries(rightTotals || {}).forEach(([currency, amountValue]) => {
            addToTotals(next, currency, -Number(amountValue || 0));
        });
        return next;
    }

    function sumMaps(leftTotals, rightTotals) {
        const next = { ...(leftTotals || {}) };
        Object.entries(rightTotals || {}).forEach(([currency, amountValue]) => {
            addToTotals(next, currency, Number(amountValue || 0));
        });
        return next;
    }

    function debtNetByCurrency(items) {
        return (items || []).reduce((totals, item) => {
            const currency = entryCurrency(item);
            const amountValue = Number(item.amount || 0);
            if (item.type === "for-me") return addToTotals(totals, currency, amountValue);
            if (item.type === "on-me") return addToTotals(totals, currency, -amountValue);
            if (item.type === "paid-to-me") return addToTotals(totals, currency, -amountValue);
            return addToTotals(totals, currency, amountValue);
        }, {});
    }

    function amountForCurrency(totals, currency) {
        return Number((totals || {})[normalizeCurrency(currency)] || 0);
    }

    function formatTotals(totals, fallbackCurrency) {
        const normalized = Object.entries(totals || {})
            .map(([currency, amountValue]) => [normalizeCurrency(currency), Number(amountValue || 0)])
            .filter(([, amountValue]) => Math.abs(amountValue) > 0.0001);
        if (!normalized.length) {
            return formatMoney(0, normalizeCurrency(fallbackCurrency || state.profile.currency || "₪"));
        }
        return normalized
            .sort((a, b) => a[0].localeCompare(b[0], "en"))
            .map(([currency, amountValue]) => formatMoney(amountValue, currency))
            .join(" · ");
    }

    function hasForeignCurrency(items, baseCurrency) {
        const base = normalizeCurrency(baseCurrency);
        return (items || []).some((item) => entryCurrency(item) !== base);
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
        return `${normalizeCurrency(currency)} ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(numberValue || 0))}`;
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
        const defaultCurrency = normalizeCurrency(data.profile?.currency || "₪");
        return {
            profile: {
                deviceName: String(data.profile?.deviceName || ""),
                currency: defaultCurrency,
                monthlyBudget: Number(data.profile?.monthlyBudget || 0),
                savingGoal: Number(data.profile?.savingGoal || 0),
                passcode: String(data.profile?.passcode || ""),
                safeMode: !!data.profile?.safeMode,
                hideNumbers: !!data.profile?.hideNumbers
            },
            incomes: Array.isArray(data.incomes) ? data.incomes.map((item) => ({ ...item, currency: normalizeCurrency(item.currency || defaultCurrency) })) : [],
            expenses: Array.isArray(data.expenses) ? data.expenses.map((item) => ({ ...item, currency: normalizeCurrency(item.currency || defaultCurrency) })) : [],
            debts: Array.isArray(data.debts) ? data.debts.map((item) => ({ ...item, currency: normalizeCurrency(item.currency || defaultCurrency) })) : [],
            debtPlans: Array.isArray(data.debtPlans) ? data.debtPlans.map((plan) => ({
                ...plan,
                currency: normalizeCurrency(plan.currency || defaultCurrency),
                installments: Array.isArray(plan.installments)
                    ? plan.installments.map((installment) => ({ ...installment }))
                    : []
            })) : [],
            commitments: Array.isArray(data.commitments) ? data.commitments.map((item) => ({ ...item, currency: normalizeCurrency(item.currency || defaultCurrency) })) : [],
            reminders: Array.isArray(data.reminders) ? data.reminders : [],
            archivedPeople: Array.isArray(data.archivedPeople) ? data.archivedPeople : [],
            monthlyArchives: Array.isArray(data.monthlyArchives) ? data.monthlyArchives.map((item) => ({
                ...item,
                currency: normalizeCurrency(item.currency || defaultCurrency),
                incomeTotals: item.incomeTotals || { [normalizeCurrency(item.currency || defaultCurrency)]: Number(item.income || 0) },
                expenseTotals: item.expenseTotals || { [normalizeCurrency(item.currency || defaultCurrency)]: Number(item.expense || 0) },
                netTotals: item.netTotals || { [normalizeCurrency(item.currency || defaultCurrency)]: Number(item.net || 0) }
            })) : []
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

    bind();
    seedDates();
    render();
})();
