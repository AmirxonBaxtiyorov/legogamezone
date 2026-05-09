// =====================================================================
// Game Zone Qarz Dashboard — frontend logic (clean rewrite)
// 3 til (uz / cyr / ru), light/dark, profillar, chiziqli grafiklar, modal
// =====================================================================

"use strict";

// Diagnostika: app.js yuklandi
window.__GZQ_LOADED = true;
console.log("[GameZoneQarz] app.js loaded, build:", window.__GZQ_BUILD || "unknown");

// ====== I18N ==========================================================
const I18N = {
  uz: {
    appName: "Game Zone Qarz", appSub: "Boshqaruv tizimi",
    heroTitle: "Tarmoq qarzlari ko'rinishi", heroSub: "Barcha filiallar bo'yicha real vaqt statistikasi",
    totalDebt: "Jami qarz", totalPaid: "Jami to'langan", totalRemaining: "Qoldiq qarz",
    overdue: "Muddati o'tgan", dueToday: "Bugun muddat", thisMonth: "Bu oy tushum",
    allBranches: "barcha filiallar", allTime: "umumiy", toCollect: "undirish kerak",
    urgent: "shoshilinch", needsAttention: "e'tibor bering", paymentsReceived: "qabul qilingan",
    branches: "Filiallar", users: "Foydalanuvchilar", clients: "Mijozlar",
    debts: "Qarzlar", payments: "To'lovlar", auditEvents: "Audit yozuvlari",
    debtors: "Qarzdorlar", viewAllClients: "Mijozlar",
    back: "← Orqaga",
    branchComparison: "Filiallar taqqoslash", branchComparisonSub: "qarzlar va to'lovlar bo'yicha",
    paymentMethods: "To'lov usullari", paymentMethodsSub: "bu oy bo'yicha",
    debtStatuses: "Qarzlar holati", debtStatusesSub: "status bo'yicha taqsimot",
    topDebtors: "Eng katta qarzdorlar", topDebtorsSub: "qoldiq qarz bo'yicha TOP-5",
    recentDebts: "Oxirgi qarzlar", recentDebtsSub: "eng so'nggi 10 ta yozuv",
    recentPayments: "Oxirgi to'lovlar", recentPaymentsSub: "10 ta so'nggi yozuv",
    recentActivity: "Oxirgi hodisalar", recentActivitySub: "audit log",
    thName: "Ism", thPhone: "Telefon", thBranch: "Filial", thRemaining: "Qoldiq",
    thClient: "Mijoz", thItem: "Xizmat", thAmount: "Summa", thDue: "Muddat",
    thStatus: "Status", thDate: "Sana", thMethod: "Usul",
    statusActive: "Faol", statusPartial: "Qisman", statusPaid: "To'liq to'langan",
    statusOverdue: "Muddati o'tgan", statusDuetoday: "Bugun muddat", statusCancelled: "Bekor qilingan",
    methodCash: "Naqd", methodCard: "Karta", methodTransfer: "O'tkazma",
    itemPlaystation: "PlayStation", itemComputer: "Kompyuter", itemBilliard: "Bilyard", itemOther: "Boshqa",
    paid: "to'langan", remaining: "qoldiq",
    actionCreate: "yaratdi", actionUpdate: "tahrirladi", actionDelete: "o'chirdi",
    actionSoft_delete: "bekor qildi", actionPayment: "to'lov yozdi",
    actionLogin: "kirdi", actionLogout: "chiqdi", actionRestore: "qayta tikladi",
    actionBackup: "backup yaratdi",
    tableBranch: "filial", tableUser: "foydalanuvchi", tableClient: "mijoz",
    tableDebt: "qarz", tablePayment: "to'lov",
    footerNote: "1-bosqich preview — Express API va React frontend keyingi bosqichlarda quriladi",
    loading: "Yuklanmoqda...", noData: "Ma'lumot yo'q", currency: "so'm", generatedAt: "yangilandi",
    roleOwner: "Ega", roleAdmin: "Admin",
    switchProfile: "Profilni almashtirish", previewNote: "Auth hali yo'q — RBAC namoyishi uchun",
    viewingAs: "Ko'rinish",
    chartTimeline: "Oxirgi 30 kun", chartTimelineSub: "qo'shilgan qarz va qabul qilingan to'lovlar",
    chartStatus: "Status taqsimoti", chartMethods: "To'lov usullari",
    chartItems: "Xizmat turlari", chartBranches: "Filiallar bar chart",
    chartBranchesSub: "summa bo'yicha taqqoslash", chartDebtAdded: "Qo'shilgan qarz", chartPaid: "To'langan",
    modalTotalDebt: "Jami qarzlar — barcha yozuvlar",
    modalTotalPaid: "Jami to'lovlar tarixi",
    modalRemaining: "Qoldiq qarzli yozuvlar",
    modalOverdue: "Muddati o'tgan qarzlar",
    modalDueToday: "Bugun muddati tugaydi",
    modalThisMonth: "Bu oyning to'lovlari",
    modalStatusActive: "Faol qarzlar",
    modalStatusPartial: "Qisman to'langan qarzlar",
    modalStatusPaid: "To'liq to'langan qarzlar",
    modalStatusOverdue: "Muddati o'tgan qarzlar",
    modalStatusCancelled: "Bekor qilingan qarzlar",
    modalClient: "Mijoz tarixi",
    summaryCount: "Soni", summaryAmount: "Summa", summaryPaid: "To'langan",
    summaryRemaining: "Qoldiq", summaryDebts: "Qarzlar", summaryPayments: "To'lovlar",
    paymentsHistory: "To'lovlar tarixi", auditLogTitle: "Audit log",
    debtsHistory: "Qarzlar tarixi",
    expand: "Ochish", collapse: "Yopish",
    noPayments: "To'lovlar yo'q", noLogs: "Bu yozuv uchun audit log yo'q",
    adminNoLogs: "⚠️ Audit log faqat ega (owner) uchun ko'rinadi",
    item: "Xizmat", borrowedDate: "Olingan", dueDate: "Muddat", notes: "Eslatma",
    createdBy: "Yozgan", branch: "Filial", phone: "Telefon", method: "Usul",
    paidDate: "To'lov sanasi", actionDoneBy: "Bajardi", when: "Vaqt",
    error: "Xatolik", retry: "Qayta urinish", close: "Yopish",

    addDebt: "Yangi qarz", addDebtTitle: "Yangi qarz qo'shish",
    formClient: "Mijoz", formNewClient: "Yangi mijoz", formExistingClient: "Mavjud mijoz",
    formName: "Ism familiya", formPhone: "Telefon raqam",
    formItemType: "Xizmat turi", formItemDetails: "Tafsilot (ixtiyoriy)",
    formAmount: "Summa (so'm)", formBorrowedDate: "Olingan sana",
    formDueDate: "Qaytarish muddati", formDueUnknown: "Aniq sana yo'q",
    formNotes: "Eslatma (ixtiyoriy)", formBranch: "Filial",
    formSave: "Saqlash", formCancel: "Bekor qilish",
    formNamePlaceholder: "Aliyev Vali",
    formPhonePlaceholder: "+998901234567",
    formItemPlaceholder: "Masalan: PS5 — 3 soat",
    formNotesPlaceholder: "Qo'shimcha ma'lumot...",
    selectClient: "Mijozni tanlang",
    btnAddNew: "+ Yangi mijoz",
    btnAddExisting: "Mavjud mijozdan",

    paymentTitle: "To'lov yozish (qarzni kamaytirish)",
    paymentAmount: "To'lov summasi",
    paymentMethod: "To'lov usuli",
    paymentDate: "To'lov sanasi",
    paymentNotes: "Eslatma",
    paymentRemaining: "Qoldiq qarz",
    paymentMaxHint: "Qoldiq qarzdan ko'p kirita olmaysiz",

    actionPay: "💵 To'lov",
    actionCancel: "❌ Bekor qilish",
    actionDelete: "🗑️ O'chirish",
    confirmDelete: "Bu qarzni butunlay o'chirishni xohlaysizmi?",
    confirmDeleteSub: "Bu amal qaytarilmaydi. Audit logda iz qoladi.",
    confirmCancel: "Bu qarzni bekor qilishni xohlaysizmi?",
    confirmCancelSub: "Qarz status \"Bekor qilingan\"ga o'zgaradi. Owner istasa qayta tiklashi mumkin.",
    confirmYes: "Ha, davom etish",
    confirmNo: "Yo'q",

    clearAllData: "🧹 Barcha ma'lumotlarni o'chirish",
    confirmClear: "Barcha mijozlar, qarzlar, to'lovlarni o'chirishni xohlaysizmi?",
    confirmClearSub: "Filiallar va foydalanuvchilar saqlanadi. Bu amal qaytarib bo'lmaydi.",

    successDebtAdded: "Qarz muvaffaqiyatli qo'shildi",
    successPayment: "To'lov yozildi",
    successDeleted: "O'chirildi",
    successCleared: "Tozalandi",
    successSaved: "Saqlandi",
    successEdited: "Tahrirlandi",
    saving: "Saqlanmoqda...",
    actionEdit: "✏️ Tahrirlash",
    editDebtTitle: "Qarzni tahrirlash",
    urgentTitle: "Pulni talab qilish kerak",
    urgentSub: "48 soat ichida muddati va o'tganlar",
    bellEmpty: "Hozircha bildirishnoma yo'q",
    bellOverdue: "Muddati o'tgan",
    bellToday: "Bugun",
    bellSoon: "Yaqin 48 soat",
    auditLogTitle2: "Audit jurnali",
    auditFromDate: "Boshlanish sana",
    auditToDate: "Tugash sana",
    auditUser: "Foydalanuvchi",
    auditAction: "Amal",
    auditApply: "Ko'rish",
    monthlyReport: "Oylik hisobot",
    pickMonth: "Oy va yil",
    showReport: "Ko'rsatish",

    manageBranches: "Filiallar",
    manageAdmins: "Adminlar",
    branchesTitle: "Filiallarni boshqarish",
    adminsTitle: "Adminlarni boshqarish",
    branchAdd: "+ Yangi filial",
    branchName: "Nomi",
    branchAddress: "Manzil",
    branchPhone: "Telefon",
    branchActive: "Faol",
    branchDisable: "Faolsizlantirish",
    branchEnable: "Faollashtirish",
    branchEdit: "Tahrirlash",

    adminPerms: "Ruxsatlar",
    permAddDebt: "Qarz qo'shish",
    permEditDebt: "Qarzni tahrirlash",
    permRecordPayment: "To'lov yozish",
    permCancelDebt: "Qarzni bekor qilish",
    permAddClient: "Mijoz qo'shish",
    permEditClient: "Mijozni tahrirlash",
    permDeleteClient: "Mijozni o'chirish",
    adminTelegram: "Telegram ulash",
    telegramLinkCode: "Telegram kod",
    telegramCopyHint: "Bu kodni adminga bering. U botda /start <kod> yuborsin.",
    telegramUnlink: "Telegramdan uzish",
    codeExpires: "Kod 10 daqiqa amal qiladi",
    notLinked: "Telegramga ulanmagan",
    linked: "Ulangan",

    settings: "Sozlamalar",
    settingsTitle: "Tizim sozlamalari",
    settingsLogo: "Logo (emoji yoki rasm)",
    settingsLogoUpload: "Rasm yuklash (PNG/JPG)",
    settingsLogoEmoji: "Yoki emoji kiritish",
    settingsLogoEmojiHint: "Masalan: 🎮 🎯 🏆 🔥 ⚡",
    settingsName: "Tizim nomi",
    settingsSubtitle: "Sub-sarlavha",
    settingsColor: "Asosiy rang",
    settingsOwnerLabel: "Egasining belgisi",
    settingsReset: "Standart qiymatlarga qaytarish",
    settingsSaved: "Sozlamalar saqlandi",
    settingsImageTooLarge: "Rasm juda katta (max 2MB)",
    settingsLogoPreview: "Joriy logo",
    manageClients: "Mijozlar",
    clientsTitle: "Barcha mijozlar",
    clientEdit: "Mijozni tahrirlash",
    clientDelete: "Mijozni o'chirish",
    clientDeleteSoft: "Faqat yashirish",
    clientDeleteHard: "To'liq o'chirish",
    confirmClientDelete: "Bu mijozni butunlay o'chirmoqchimisiz?",
    confirmClientDeleteSub: "Mijozning barcha qarzlari va to'lovlari ham o'chiriladi! Bu amal qaytarib bo'lmaydi.",
    confirmClientSoftDelete: "Mijozni yashirmoqchimisiz?",
    confirmClientSoftDeleteSub: "Mijoz va uning ma'lumotlari saqlanadi, faqat ro'yxatlardan yashiriladi.",
    branchDelete: "Filialni o'chirish",
    confirmBranchDelete: "Filialni o'chirmoqchimisiz?",
    confirmBranchDeleteSub: "Agar filialda mijoz/qarz bo'lsa, faqat faolsiz holatga o'tadi.",
    confirmBranchHardDelete: "Filialni va ichidagi BARCHA ma'lumotlarni butunlay o'chirish",
    branchDeactivated: "Filial faolsizlantirildi",
    branchDeleted: "Filial butunlay o'chirildi",
    adminEditTitle: "Adminni tahrirlash",
    adminUsername: "Username",
    adminPassword: "Yangi parol",
    adminPasswordHint: "Bo'sh qoldirsangiz parol o'zgarmaydi",
    adminResetPassword: "Parolni tiklash",
    adminDelete: "Adminni faolsizlantirish",
    confirmAdminDelete: "Adminni faolsizlantirmoqchimisiz?",
    confirmAdminDeleteSub: "Admin profili saqlanadi, lekin ro'yxatlardan yashiriladi.",
    successPasswordReset: "Parol tiklandi",
    systemInfo: "Tizim holati",
    systemInfoTitle: "Tizim holati",
    systemUptime: "Ishlash vaqti",
    systemDbSize: "Bazaning hajmi",
    auditTable: "Jadval",
    allTables: "Barcha jadvallar",
    auditAllUsers: "Barcha foydalanuvchilar",
    auditAllActions: "Barcha amallar",
  },
  cyr: {
    appName: "Гейм Зона Қарз", appSub: "Бошқарув тизими",
    heroTitle: "Тармоқ қарзлари кўриниши", heroSub: "Барча филиаллар бўйича реал вақт статистикаси",
    totalDebt: "Жами қарз", totalPaid: "Жами тўланган", totalRemaining: "Қолдиқ қарз",
    overdue: "Муддати ўтган", dueToday: "Бугун муддат", thisMonth: "Бу ой тушум",
    allBranches: "барча филиаллар", allTime: "умумий", toCollect: "ундириш керак",
    urgent: "шошилинч", needsAttention: "эътибор беринг", paymentsReceived: "қабул қилинган",
    branches: "Филиаллар", users: "Фойдаланувчилар", clients: "Мижозлар",
    debts: "Қарзлар", payments: "Тўловлар", auditEvents: "Аудит ёзувлари",
    branchComparison: "Филиаллар таққослаш", branchComparisonSub: "қарзлар ва тўловлар бўйича",
    paymentMethods: "Тўлов усуллари", paymentMethodsSub: "бу ой бўйича",
    debtStatuses: "Қарзлар ҳолати", debtStatusesSub: "статус бўйича тақсимот",
    topDebtors: "Энг катта қарздорлар", topDebtorsSub: "қолдиқ қарз бўйича ТОП-5",
    recentDebts: "Охирги қарзлар", recentDebtsSub: "энг сўнгги 10 та ёзув",
    recentPayments: "Охирги тўловлар", recentPaymentsSub: "10 та сўнгги ёзув",
    recentActivity: "Охирги ҳодисалар", recentActivitySub: "аудит лог",
    debtors: "Қарздорлар", viewAllClients: "Мижозлар", back: "← Орқага",
    thName: "Исм", thPhone: "Телефон", thBranch: "Филиал", thRemaining: "Қолдиқ",
    thClient: "Мижоз", thItem: "Хизмат", thAmount: "Сумма", thDue: "Муддат",
    thStatus: "Статус", thDate: "Сана", thMethod: "Усул",
    statusActive: "Фаол", statusPartial: "Қисман", statusPaid: "Тўлиқ тўланган",
    statusOverdue: "Муддати ўтган", statusDuetoday: "Бугун муддат", statusCancelled: "Бекор қилинган",
    methodCash: "Нақд", methodCard: "Карта", methodTransfer: "Ўтказма",
    itemPlaystation: "PlayStation", itemComputer: "Компьютер", itemBilliard: "Бильярд", itemOther: "Бошқа",
    paid: "тўланган", remaining: "қолдиқ",
    actionCreate: "яратди", actionUpdate: "таҳрирлади", actionDelete: "ўчирди",
    actionSoft_delete: "бекор қилди", actionPayment: "тўлов ёзди",
    actionLogin: "кирди", actionLogout: "чиқди", actionRestore: "қайта тиклади",
    actionBackup: "backup яратди",
    tableBranch: "филиал", tableUser: "фойдаланувчи", tableClient: "мижоз",
    tableDebt: "қарз", tablePayment: "тўлов",
    footerNote: "1-босқич preview — Express API ва React frontend кейинги босқичларда қурилади",
    loading: "Юкланмоқда...", noData: "Маълумот йўқ", currency: "сўм", generatedAt: "янгиланди",
    roleOwner: "Эга", roleAdmin: "Админ",
    switchProfile: "Профилни алмаштириш", previewNote: "Auth ҳали йўқ — RBAC намойиши учун",
    viewingAs: "Кўриниш",
    chartTimeline: "Охирги 30 кун", chartTimelineSub: "қўшилган қарз ва қабул қилинган тўловлар",
    chartStatus: "Статус тақсимоти", chartMethods: "Тўлов усуллари",
    chartItems: "Хизмат турлари", chartBranches: "Филиаллар bar chart",
    chartBranchesSub: "сумма бўйича таққослаш", chartDebtAdded: "Қўшилган қарз", chartPaid: "Тўланган",
    modalTotalDebt: "Жами қарзлар — барча ёзувлар",
    modalTotalPaid: "Жами тўловлар тарихи",
    modalRemaining: "Қолдиқ қарзли ёзувлар",
    modalOverdue: "Муддати ўтган қарзлар",
    modalDueToday: "Бугун муддати тугайди",
    modalThisMonth: "Бу ойнинг тўловлари",
    modalStatusActive: "Фаол қарзлар",
    modalStatusPartial: "Қисман тўланган қарзлар",
    modalStatusPaid: "Тўлиқ тўланган қарзлар",
    modalStatusOverdue: "Муддати ўтган қарзлар",
    modalStatusCancelled: "Бекор қилинган қарзлар",
    modalClient: "Мижоз тарихи",
    summaryCount: "Сони", summaryAmount: "Сумма", summaryPaid: "Тўланган",
    summaryRemaining: "Қолдиқ", summaryDebts: "Қарзлар", summaryPayments: "Тўловлар",
    paymentsHistory: "Тўловлар тарихи", auditLogTitle: "Аудит лог",
    debtsHistory: "Қарзлар тарихи",
    expand: "Очиш", collapse: "Ёпиш",
    noPayments: "Тўловлар йўқ", noLogs: "Бу ёзув учун аудит лог йўқ",
    adminNoLogs: "⚠️ Аудит лог фақат эга (owner) учун кўринади",
    item: "Хизмат", borrowedDate: "Олинган", dueDate: "Муддат", notes: "Эслатма",
    createdBy: "Ёзган", branch: "Филиал", phone: "Телефон", method: "Усул",
    paidDate: "Тўлов санаси", actionDoneBy: "Бажарди", when: "Вақт",
    error: "Хатолик", retry: "Қайта уриниш", close: "Ёпиш",

    addDebt: "Янги қарз", addDebtTitle: "Янги қарз қўшиш",
    formClient: "Мижоз", formNewClient: "Янги мижоз", formExistingClient: "Мавжуд мижоз",
    formName: "Исм фамилия", formPhone: "Телефон рақам",
    formItemType: "Хизмат тури", formItemDetails: "Тафсилот (ихтиёрий)",
    formAmount: "Сумма (сўм)", formBorrowedDate: "Олинган сана",
    formDueDate: "Қайтариш муддати", formDueUnknown: "Аниқ сана йўқ",
    formNotes: "Эслатма (ихтиёрий)", formBranch: "Филиал",
    formSave: "Сақлаш", formCancel: "Бекор қилиш",
    formNamePlaceholder: "Алиев Вали", formPhonePlaceholder: "+998901234567",
    formItemPlaceholder: "Масалан: PS5 — 3 соат", formNotesPlaceholder: "Қўшимча маълумот...",
    selectClient: "Мижозни танланг",
    btnAddNew: "+ Янги мижоз", btnAddExisting: "Мавжуд мижоздан",

    paymentTitle: "Тўлов ёзиш (қарзни камайтириш)",
    paymentAmount: "Тўлов суммаси", paymentMethod: "Тўлов усули",
    paymentDate: "Тўлов санаси", paymentNotes: "Эслатма",
    paymentRemaining: "Қолдиқ қарз", paymentMaxHint: "Қолдиқ қарздан кўп кирита олмайсиз",

    actionPay: "💵 Тўлов", actionCancel: "❌ Бекор қилиш", actionDelete: "🗑️ Ўчириш",
    confirmDelete: "Бу қарзни бутунлай ўчиришни хоҳлайсизми?",
    confirmDeleteSub: "Бу амал қайтарилмайди. Аудит логда из қолади.",
    confirmCancel: "Бу қарзни бекор қилишни хоҳлайсизми?",
    confirmCancelSub: "Қарз статус \"Бекор қилинган\"га ўзгаради. Owner истаса қайта тиклаши мумкин.",
    confirmYes: "Ҳа, давом этиш", confirmNo: "Йўқ",

    clearAllData: "🧹 Барча маълумотларни ўчириш",
    confirmClear: "Барча мижозлар, қарзлар, тўловларни ўчиришни хоҳлайсизми?",
    confirmClearSub: "Филиаллар ва фойдаланувчилар сақланади. Бу амал қайтариб бўлмайди.",

    successDebtAdded: "Қарз муваффақиятли қўшилди",
    successPayment: "Тўлов ёзилди", successDeleted: "Ўчирилди", successCleared: "Тозаланди",
    saving: "Сақланмоқда...",
  },
  ru: {
    appName: "Game Zone Долги", appSub: "Система управления",
    heroTitle: "Обзор долгов сети", heroSub: "Статистика в реальном времени по всем филиалам",
    totalDebt: "Общий долг", totalPaid: "Всего оплачено", totalRemaining: "Остаток долга",
    overdue: "Просроченные", dueToday: "Сегодня срок", thisMonth: "Поступления за месяц",
    allBranches: "все филиалы", allTime: "за всё время", toCollect: "к взысканию",
    urgent: "срочно", needsAttention: "обратите внимание", paymentsReceived: "получено",
    branches: "Филиалы", users: "Пользователи", clients: "Клиенты",
    debts: "Долги", payments: "Платежи", auditEvents: "Записи аудита",
    branchComparison: "Сравнение филиалов", branchComparisonSub: "по долгам и платежам",
    paymentMethods: "Методы оплаты", paymentMethodsSub: "за этот месяц",
    debtStatuses: "Статусы долгов", debtStatusesSub: "распределение по статусам",
    topDebtors: "Крупнейшие должники", topDebtorsSub: "ТОП-5 по остатку долга",
    recentDebts: "Последние долги", recentDebtsSub: "10 свежих записей",
    recentPayments: "Последние платежи", recentPaymentsSub: "10 последних записей",
    recentActivity: "Последние события", recentActivitySub: "журнал аудита",
    debtors: "Должники", viewAllClients: "Клиенты", back: "← Назад",
    thName: "Имя", thPhone: "Телефон", thBranch: "Филиал", thRemaining: "Остаток",
    thClient: "Клиент", thItem: "Услуга", thAmount: "Сумма", thDue: "Срок",
    thStatus: "Статус", thDate: "Дата", thMethod: "Метод",
    statusActive: "Активный", statusPartial: "Частично", statusPaid: "Оплачен",
    statusOverdue: "Просрочен", statusDuetoday: "Сегодня", statusCancelled: "Отменён",
    methodCash: "Наличные", methodCard: "Карта", methodTransfer: "Перевод",
    itemPlaystation: "PlayStation", itemComputer: "Компьютер", itemBilliard: "Бильярд", itemOther: "Другое",
    paid: "оплачено", remaining: "остаток",
    actionCreate: "создал", actionUpdate: "изменил", actionDelete: "удалил",
    actionSoft_delete: "отменил", actionPayment: "записал платёж",
    actionLogin: "вошёл", actionLogout: "вышел", actionRestore: "восстановил",
    actionBackup: "сделал backup",
    tableBranch: "филиал", tableUser: "пользователь", tableClient: "клиент",
    tableDebt: "долг", tablePayment: "платёж",
    footerNote: "Превью этапа 1 — Express API и React frontend будут построены далее",
    loading: "Загрузка...", noData: "Нет данных", currency: "сум", generatedAt: "обновлено",
    roleOwner: "Владелец", roleAdmin: "Админ",
    switchProfile: "Сменить профиль", previewNote: "Auth пока нет — демонстрация RBAC",
    viewingAs: "Просмотр",
    chartTimeline: "Последние 30 дней", chartTimelineSub: "добавленные долги и принятые платежи",
    chartStatus: "Распределение статусов", chartMethods: "Методы оплаты",
    chartItems: "Типы услуг", chartBranches: "Сравнение филиалов",
    chartBranchesSub: "по сумме", chartDebtAdded: "Добавлено долга", chartPaid: "Оплачено",
    modalTotalDebt: "Все долги — полный список",
    modalTotalPaid: "История всех платежей",
    modalRemaining: "Записи с остатком долга",
    modalOverdue: "Просроченные долги",
    modalDueToday: "Сегодня истекает срок",
    modalThisMonth: "Платежи за этот месяц",
    modalStatusActive: "Активные долги",
    modalStatusPartial: "Частично оплаченные",
    modalStatusPaid: "Полностью оплаченные",
    modalStatusOverdue: "Просроченные",
    modalStatusCancelled: "Отменённые",
    modalClient: "История клиента",
    summaryCount: "Количество", summaryAmount: "Сумма", summaryPaid: "Оплачено",
    summaryRemaining: "Остаток", summaryDebts: "Долги", summaryPayments: "Платежи",
    paymentsHistory: "История платежей", auditLogTitle: "Журнал аудита",
    debtsHistory: "История долгов",
    expand: "Раскрыть", collapse: "Свернуть",
    noPayments: "Нет платежей", noLogs: "Записей аудита нет",
    adminNoLogs: "⚠️ Журнал аудита виден только владельцу",
    item: "Услуга", borrowedDate: "Взято", dueDate: "Срок", notes: "Примечание",
    createdBy: "Записал", branch: "Филиал", phone: "Телефон", method: "Метод",
    paidDate: "Дата оплаты", actionDoneBy: "Выполнил", when: "Время",
    error: "Ошибка", retry: "Повторить", close: "Закрыть",

    addDebt: "Новый долг", addDebtTitle: "Добавить новый долг",
    formClient: "Клиент", formNewClient: "Новый клиент", formExistingClient: "Существующий",
    formName: "Имя и фамилия", formPhone: "Телефон",
    formItemType: "Тип услуги", formItemDetails: "Детали (необязательно)",
    formAmount: "Сумма (сум)", formBorrowedDate: "Дата выдачи",
    formDueDate: "Срок возврата", formDueUnknown: "Точная дата неизвестна",
    formNotes: "Примечание (необязательно)", formBranch: "Филиал",
    formSave: "Сохранить", formCancel: "Отмена",
    formNamePlaceholder: "Иванов Иван", formPhonePlaceholder: "+998901234567",
    formItemPlaceholder: "Например: PS5 — 3 часа", formNotesPlaceholder: "Доп. информация...",
    selectClient: "Выберите клиента",
    btnAddNew: "+ Новый клиент", btnAddExisting: "Из существующих",

    paymentTitle: "Записать оплату (уменьшить долг)",
    paymentAmount: "Сумма оплаты", paymentMethod: "Метод оплаты",
    paymentDate: "Дата оплаты", paymentNotes: "Примечание",
    paymentRemaining: "Остаток долга", paymentMaxHint: "Не больше остатка",

    actionPay: "💵 Оплата", actionCancel: "❌ Отменить", actionDelete: "🗑️ Удалить",
    confirmDelete: "Вы хотите полностью удалить этот долг?",
    confirmDeleteSub: "Это действие необратимо. Останется только запись в журнале аудита.",
    confirmCancel: "Вы хотите отменить этот долг?",
    confirmCancelSub: "Статус долга станет \"Отменён\". Владелец сможет восстановить.",
    confirmYes: "Да, продолжить", confirmNo: "Нет",

    clearAllData: "🧹 Удалить все данные",
    confirmClear: "Удалить всех клиентов, долги, платежи?",
    confirmClearSub: "Филиалы и пользователи сохранятся. Это действие необратимо.",

    successDebtAdded: "Долг успешно добавлен",
    successPayment: "Оплата записана", successDeleted: "Удалено", successCleared: "Очищено",
    saving: "Сохранение...",
  },
};

// ====== STATE =========================================================
const state = {
  lang: localStorage.getItem("lang") || "uz",
  theme: localStorage.getItem("theme") || "dark",
  token: localStorage.getItem("token") || null,
  viewerId: Number(localStorage.getItem("viewerId")) || null,
  branchId: Number(localStorage.getItem("branchId")) || null, // owner uchun filter
  profiles: [],
  me: null, // joriy login qilgan foydalanuvchi (token orqali)
  data: null,
  charts: {},
  settings: null, // tizim sozlamalari (logo, nom, ranglar)
};

// fetch'ni o'rab Authorization header'ini qo'shadi va 401'da login ekraniga qaytaradi
const _origFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input?.url || "";
  const isApi = url.startsWith("/api/") || url.includes("/api/");
  const opts = init ? { ...init } : {};
  if (isApi && state.token) {
    opts.headers = new Headers(opts.headers || {});
    if (!opts.headers.has("Authorization")) {
      opts.headers.set("Authorization", "Bearer " + state.token);
    }
  }
  const res = await _origFetch(input, opts);
  if (isApi && res.status === 401 && state.token) {
    // Token noto'g'ri yoki muddati o'tgan — tozalanadi va login ekraniga qaytadi
    state.token = null;
    state.me = null;
    state.viewerId = null;
    localStorage.removeItem("token");
    localStorage.removeItem("viewerId");
    if (typeof showLoginForm === "function") showLoginForm();
  }
  return res;
};

// ====== HELPERS =======================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const byId = (id) => document.getElementById(id);

function t(key) {
  const dict = I18N[state.lang] || I18N.uz;
  return dict[key] ?? I18N.uz[key] ?? key;
}

function fmtMoney(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(n) + " " + t("currency");
}
function fmtNumber(n) { return new Intl.NumberFormat("uz-UZ").format(Number(n || 0)); }
function fmtDate(d) {
  if (!d) return "";
  const x = new Date(d);
  return [String(x.getDate()).padStart(2, "0"), String(x.getMonth() + 1).padStart(2, "0"), x.getFullYear()].join(".");
}
function fmtDateTime(d) {
  if (!d) return "";
  const x = new Date(d);
  return fmtDate(d) + " " + String(x.getHours()).padStart(2, "0") + ":" + String(x.getMinutes()).padStart(2, "0");
}
function fmtItem(type) {
  return t({ playstation: "itemPlaystation", computer: "itemComputer", billiard: "itemBilliard" }[type] || "itemOther");
}
function fmtMethod(method) {
  return t("method" + method.charAt(0).toUpperCase() + method.slice(1));
}
function methodIcon(m) { return m === "cash" ? "💵" : m === "card" ? "💳" : "🔄"; }
function statusKey(s) { return "status" + s.charAt(0).toUpperCase() + s.slice(1); }
function actionKey(a) { return "action" + a.charAt(0).toUpperCase() + a.slice(1); }
function tableLabel(name) { return t("table" + name) || name; }

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ====== NOTIFICATIONS (BELL) ==========================================
async function loadNotifications() {
  if (!state.viewerId) return;
  try {
    const data = await api(`/api/notifications?${buildScopeQuery()}`);
    renderBell(data);
    renderUrgent(data);
  } catch (err) {
    console.error("Notifications failed:", err);
  }
}

function renderBell(data) {
  const badge = byId("bellBadge");
  const dropdown = byId("bellDropdown");
  if (!badge || !dropdown) return;

  const total = data.counts.total;
  if (total > 0) {
    badge.textContent = total > 99 ? "99+" : String(total);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }

  if (data.items.length === 0) {
    dropdown.innerHTML = `<div class="bell-empty">${t("bellEmpty")}</div>`;
    return;
  }

  const groups = [
    { key: "overdue", icon: "🔴", label: t("bellOverdue") },
    { key: "today", icon: "🟡", label: t("bellToday") },
    { key: "soon", icon: "🟠", label: t("bellSoon") },
  ];

  let html = "";
  for (const g of groups) {
    const items = data.items.filter((i) => i.urgency === g.key);
    if (items.length === 0) continue;
    html += `<div class="bell-head">${g.icon} ${g.label} (${items.length})</div>`;
    for (const it of items) {
      const dueText = isUnknownDate(it.dueDate)
        ? t("formDueUnknown")
        : (it.urgency === "overdue"
          ? `${t("dueDate")}: ${fmtDate(it.dueDate)}`
          : `${fmtDate(it.dueDate)}`);
      html += `
        <div class="bell-item ${it.urgency}" data-client-id="${it.clientId}">
          <div class="bell-item-icon">${g.icon}</div>
          <div class="bell-item-body">
            <div class="bell-item-title">${escapeHtml(it.client)} — ${fmtMoney(it.remaining)}</div>
            <div class="bell-item-meta">📞 ${escapeHtml(it.clientPhone)} • 🏢 ${escapeHtml(it.branch)} • ${dueText}</div>
          </div>
        </div>`;
    }
  }
  dropdown.innerHTML = html;
}

function renderUrgent(data) {
  const card = byId("urgentCard");
  const list = byId("urgentList");
  if (!card || !list) return;

  if (data.items.length === 0) {
    card.hidden = true;
    return;
  }

  card.hidden = false;
  list.innerHTML = `<div class="urgent-list">${data.items.slice(0, 12).map((it) => {
    const tagText = it.urgency === "overdue"
      ? `🔴 ${t("bellOverdue")}`
      : it.urgency === "today"
        ? `🟡 ${t("bellToday")}`
        : `🟠 ~${it.hoursUntil}h`;
    return `
      <div class="urgent-item ${it.urgency}" data-client-id="${it.clientId}">
        <div class="urgent-name">👤 ${escapeHtml(it.client)}
          <span class="urgent-tag ${it.urgency}">${tagText}</span>
        </div>
        <div class="urgent-meta">📞 ${escapeHtml(it.clientPhone)} • 🏢 ${escapeHtml(it.branch)} • 🎮 ${escapeHtml(it.itemDetails || fmtItem(it.itemType))}</div>
        <div class="urgent-amount">💰 ${fmtMoney(it.remaining)}</div>
      </div>`;
  }).join("")}</div>`;
}

// ====== TOAST =========================================================
function toast(message, type) {
  const container = byId("toastContainer");
  if (!container) return;
  type = type || "info";
  const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : type === "warning" ? "⚡" : "ℹ️";
  const el = document.createElement("div");
  el.className = "toast toast-" + type;
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(el);
  setTimeout(() => el.classList.add("toast-out"), 2700);
  setTimeout(() => el.remove(), 3050);
}

function profileInitials(fullName) {
  return (fullName || "??").split(/\s+/).map((s) => s.charAt(0).toUpperCase()).slice(0, 2).join("");
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// ====== THEME =========================================================
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
}

// ====== I18N APPLY ====================================================
function applyLang() {
  document.documentElement.lang = state.lang === "ru" ? "ru" : "uz";
  $$("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    el.textContent = t(k);
  });
  $$(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === state.lang));
  // Sozlamalar mavjud bo'lsa, ular i18n'ni qoplaydi (logo, brand)
  applySettings();
  if (state.data) render(state.data);
}

// ====== SETTINGS ======================================================
async function loadSettings() {
  try {
    state.settings = await api("/api/settings");
    applySettings();
  } catch (err) {
    console.error("Settings load failed:", err);
  }
}

function applySettings() {
  const s = state.settings;
  if (!s) return;
  const logoEl = byId("brandLogo");
  const nameEl = byId("brandName");
  const subEl = byId("brandSubtitle");
  if (logoEl) {
    const v = s.logo?.value || "🎮";
    if (s.logo?.type === "image" || (typeof v === "string" && v.startsWith("data:image"))) {
      logoEl.innerHTML = `<img src="${escapeHtml(v)}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />`;
    } else {
      logoEl.textContent = v;
    }
  }
  if (nameEl && s.systemName?.value) nameEl.textContent = s.systemName.value;
  if (subEl && s.systemSubtitle?.value) subEl.textContent = s.systemSubtitle.value;
  // Asosiy rang — CSS o'zgaruvchisi
  if (s.primaryColor?.value) {
    document.documentElement.style.setProperty("--primary", s.primaryColor.value);
  }
  // Document title
  if (s.systemName?.value) document.title = s.systemName.value + " — Dashboard";
  // Favicon (rasm uchun)
  if (s.logo?.type === "image" && s.logo?.value?.startsWith("data:image")) {
    let link = document.querySelector("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = s.logo.value;
  }
}

// ====== LIVE CLOCK ====================================================
function tickTime() {
  const el = byId("liveTime");
  if (!el) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  el.textContent = `${fmtDate(now)} • ${hh}:${mm}:${ss}`;
}

// ====== API ===========================================================
async function api(path) {
  const res = await fetch(path);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function loadProfiles() {
  try {
    state.profiles = await api("/api/profiles");
    const valid = state.profiles.some((p) => p.id === state.viewerId);
    if (state.viewerId && !valid) {
      // Saqlangan ID bazada yo'q (o'chirilgan/faolsiz) — sessiya tozalanadi
      state.viewerId = null;
      localStorage.removeItem("viewerId");
    }
  } catch (err) {
    console.error("Profiles load failed:", err);
  }
}

// Login formasi — username + parol → JWT
function showLoginForm(message) {
  const overlay = byId("formOverlay");
  if (!overlay) return;
  const titleEl = byId("formTitle");
  const subEl = byId("formSub");
  const bodyEl = byId("formBody");
  const closeEl = byId("formClose");
  if (titleEl) titleEl.textContent = "🔐 Tizimga kirish";
  if (subEl) subEl.textContent = state.settings?.systemName || "Game Zone Qarz";
  if (closeEl) closeEl.style.visibility = "hidden"; // yopib bo'lmaydi
  bodyEl.innerHTML = `
    <form id="loginForm">
      <div id="formMessage">${message ? `<div class="form-error">⚠️ ${escapeHtml(message)}</div>` : ""}</div>
      <div class="form-group">
        <label class="form-label">Login</label>
        <input class="form-input" name="username" type="text" required autocomplete="username" autofocus placeholder="owner / admin1 / ..." />
      </div>
      <div class="form-group">
        <label class="form-label">Parol</label>
        <input class="form-input" name="password" type="password" required autocomplete="current-password" />
      </div>
      <div class="form-group">
        <label class="form-checkbox" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:10px">
          <input type="checkbox" name="remember" />
          <span>Eslab qolish (30 kun)</span>
        </label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-success" id="loginSubmitBtn" style="width:100%">🚀 Kirish</button>
      </div>
    </form>
    <div id="twoFactorBlock" hidden>
      <div class="admin-warn" style="margin-bottom:14px">📲 Telegram'ga 6 xonali kod yuborildi. Quyiga kiriting:</div>
      <div class="form-group">
        <label class="form-label">Tasdiqlash kodi</label>
        <input class="form-input" name="code" id="twoFactorCode" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="123456" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="loginBackBtn">← Orqaga</button>
        <button type="button" class="btn btn-success" id="twoFactorSubmitBtn" style="flex:1">✅ Tasdiqlash</button>
      </div>
    </div>`;
  overlay.hidden = false;

  let pendingUserId = null;
  let pendingRemember = false;

  byId("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("loginSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Tekshirilmoqda...";
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(fd.get("username")).trim(),
          password: String(fd.get("password")),
          remember: !!fd.get("remember"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login xatoligi");

      if (data.requires2FA) {
        pendingUserId = data.userId;
        pendingRemember = !!fd.get("remember");
        byId("loginForm").hidden = true;
        byId("twoFactorBlock").hidden = false;
        byId("twoFactorCode").focus();
        return;
      }

      state.token = data.token;
      state.me = data.user;
      state.viewerId = data.user.id;
      localStorage.setItem("token", data.token);
      localStorage.setItem("viewerId", String(data.user.id));
      if (data.user.role !== "owner") {
        state.branchId = null;
        localStorage.removeItem("branchId");
      }
      if (closeEl) closeEl.style.visibility = "";
      closeFormModal();
      await loadProfiles();
      await loadData();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 Kirish";
    }
  });

  byId("loginBackBtn").addEventListener("click", () => {
    byId("loginForm").hidden = false;
    byId("twoFactorBlock").hidden = true;
    pendingUserId = null;
  });

  byId("twoFactorSubmitBtn").addEventListener("click", async () => {
    const code = String(byId("twoFactorCode").value || "").trim();
    if (!/^\d{6}$/.test(code)) {
      byId("formMessage").innerHTML = `<div class="form-error">⚠️ 6 xonali raqam kiriting</div>`;
      return;
    }
    const btn = byId("twoFactorSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Tekshirilmoqda...";
    try {
      const res = await fetch("/api/login/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId, code, remember: pendingRemember }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kod xatoligi");
      state.token = data.token;
      state.me = data.user;
      state.viewerId = data.user.id;
      localStorage.setItem("token", data.token);
      localStorage.setItem("viewerId", String(data.user.id));
      if (closeEl) closeEl.style.visibility = "";
      closeFormModal();
      await loadProfiles();
      await loadData();
    } catch (err) {
      byId("formMessage").innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      btn.disabled = false;
      btn.textContent = "✅ Tasdiqlash";
    }
  });
}

// Eski profil pickerni saqlab qolamiz (orqa moslik uchun chaqiriladigan joylar bor)
function showProfilePicker() { showLoginForm(); }

function buildScopeQuery() {
  const parts = [];
  if (state.viewerId) parts.push(`asUser=${state.viewerId}`);
  if (state.branchId) parts.push(`branchId=${state.branchId}`);
  return parts.join("&");
}

async function loadData() {
  try {
    if (!state.viewerId) await loadProfiles();
    const q = buildScopeQuery();
    state.data = await api(`/api/stats${q ? "?" + q : ""}`);
    render(state.data);
  } catch (err) {
    console.error("Stats load failed:", err);
    showFatalError(err.message);
  }
}

function showFatalError(msg) {
  const totalDebt = byId("totalDebt");
  if (totalDebt) totalDebt.textContent = "—";
  console.error("FATAL:", msg);
}

// ====== HEADER PROFILE BUTTON =========================================
function renderProfileButton(viewer) {
  const avatar = byId("profileAvatar");
  if (!avatar) return;
  avatar.textContent = profileInitials(viewer.fullName);
  avatar.classList.remove("role-owner", "role-admin");
  avatar.classList.add("role-" + viewer.role);
  byId("profileName").textContent = viewer.fullName;
  byId("profileRole").textContent =
    t(viewer.role === "owner" ? "roleOwner" : "roleAdmin") +
    (viewer.branchName ? " · " + viewer.branchName : "");

  // Owner actions ko'rinadi faqat ega uchun
  const oa = byId("ownerActions");
  if (oa) oa.hidden = viewer.role !== "owner";
}

// Branch filter dropdown'ini render qilish (faqat owner uchun)
function renderBranchFilter(viewer, allBranches) {
  const sel = byId("branchFilter");
  if (!sel) return;
  if (viewer.role !== "owner" || !allBranches || allBranches.length <= 1) {
    sel.hidden = true;
    return;
  }
  sel.hidden = false;
  const currentValue = state.branchId ? String(state.branchId) : "";
  sel.innerHTML = `
    <option value="">🏢 ${t("allBranches")}</option>
    ${allBranches.map((b) => `<option value="${b.id}" ${currentValue === String(b.id) ? "selected" : ""}>${escapeHtml(b.name)}</option>`).join("")}
  `;
}

function renderHeroBadges(viewer) {
  const role = byId("heroRoleBadge");
  const branch = byId("heroBranchBadge");
  if (role) role.textContent = "👤 " + viewer.fullName + " — " + t(viewer.role === "owner" ? "roleOwner" : "roleAdmin");
  if (branch) {
    if (viewer.branchName) {
      branch.textContent = "🏢 " + viewer.branchName;
      branch.hidden = false;
    } else {
      branch.hidden = true;
    }
  }
}

function renderProfileDropdown() {
  const list = byId("profileList");
  if (!list) return;
  // Admin faqat o'z profilini ko'radi — boshqa adminlar yoki ownerga o'ta olmaydi
  const currentViewer = state.profiles.find((p) => p.id === state.viewerId);
  const visibleProfiles = currentViewer && currentViewer.role === "admin"
    ? state.profiles.filter((p) => p.id === currentViewer.id)
    : state.profiles;
  list.innerHTML = visibleProfiles.map((p) => {
    const meta = t(p.role === "owner" ? "roleOwner" : "roleAdmin") + (p.branchName ? " · " + p.branchName : "");
    return `
      <div class="dropdown-item ${p.id === state.viewerId ? "active" : ""}" data-profile-id="${p.id}">
        <div class="profile-avatar role-${p.role}">${escapeHtml(profileInitials(p.fullName))}</div>
        <div class="di-info">
          <div class="di-name">${escapeHtml(p.fullName)}</div>
          <div class="di-meta">${escapeHtml(meta)}</div>
        </div>
      </div>`;
  }).join("");
}

// ====== STAT CARDS ====================================================
function renderTopStats(money, statusCounts) {
  byId("totalDebt").textContent = fmtMoney(money.totalDebt);
  byId("totalPaid").textContent = fmtMoney(money.totalPaid);
  byId("totalRemaining").textContent = fmtMoney(money.totalRemaining);
  byId("overdueCount").textContent = fmtNumber(statusCounts.overdue);
  byId("dueTodayCount").textContent = fmtNumber(statusCounts.dueToday);
  byId("thisMonthTotal").textContent = fmtMoney(money.thisMonthTotal);
}

function renderCounters(s) {
  byId("branchesCount").textContent = fmtNumber(s.branchesCount);
  byId("usersCount").textContent = fmtNumber(s.usersCount);
  byId("clientsCount").textContent = fmtNumber(s.clientsCount);
  byId("debtsCount").textContent = fmtNumber(s.debtsCount);
  byId("paymentsCount").textContent = fmtNumber(s.paymentsCount);
  byId("auditCount").textContent = fmtNumber(s.auditCount);
}

function renderBranches(branches) {
  const root = byId("branchesList");
  if (!root) return;
  if (!branches?.length) {
    root.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }
  root.innerHTML = branches.map((b) => {
    const total = b.totalAmount || 0;
    const paid = b.totalPaid || 0;
    const remaining = b.totalRemaining || 0;
    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
    return `
      <div class="branch-row">
        <div class="branch-head">
          <div class="branch-name">${escapeHtml(b.name)}</div>
          <div class="branch-stats-mini">
            <span><b>${fmtNumber(b.clientsCount)}</b> ${t("clients").toLowerCase()}</span>
            <span><b>${fmtNumber(b.debtsCount)}</b> ${t("debts").toLowerCase()}</span>
            <span><b>${fmtNumber(b.paymentsCount)}</b> ${t("payments").toLowerCase()}</span>
          </div>
        </div>
        <div class="branch-bar"><div class="branch-bar-fill" style="width:${pct}%"></div></div>
        <div class="branch-numbers">
          <span class="label-paid">▲ ${t("paid")}: ${fmtMoney(paid)} (${pct}%)</span>
          <span class="label-remaining">${t("remaining")}: ${fmtMoney(remaining)}</span>
        </div>
      </div>`;
  }).join("");
}

function renderPaymentMethods(money) {
  const cash = money.cashThisMonth || 0, card = money.cardThisMonth || 0, trf = money.transferThisMonth || 0;
  const total = cash + card + trf;
  const methods = [
    { key: "cash", label: t("methodCash"), amount: cash, icon: "💵" },
    { key: "card", label: t("methodCard"), amount: card, icon: "💳" },
    { key: "transfer", label: t("methodTransfer"), amount: trf, icon: "🔄" },
  ];
  const root = byId("methodBars");
  if (!root) return;
  root.innerHTML = methods.map((m) => {
    const pct = total > 0 ? Math.round((m.amount / total) * 100) : 0;
    return `
      <div class="method-row ${m.key}">
        <div class="method-icon ${m.key}">${m.icon}</div>
        <div class="method-info">
          <div class="method-name"><span>${m.label}</span>
            <span class="method-amount">${fmtMoney(m.amount)} <b>(${pct}%)</b></span>
          </div>
          <div class="method-bar"><div class="method-bar-fill" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }).join("");
  byId("methodLegend").textContent = `${t("thisMonth")}: ${fmtMoney(total)}`;
}

function renderStatusGrid(s) {
  const items = [
    { key: "active", count: s.active, label: t("statusActive") },
    { key: "partial", count: s.partial, label: t("statusPartial") },
    { key: "paid", count: s.paid, label: t("statusPaid") },
    { key: "overdue", count: s.overdue, label: t("statusOverdue") },
    { key: "duetoday", count: s.dueToday, label: t("statusDuetoday") },
    { key: "cancelled", count: s.cancelled, label: t("statusCancelled") },
  ];
  byId("statusGrid").innerHTML = items.map((i) => `
    <button type="button" class="status-pill ${i.key}" data-status="${i.key}">
      <div class="pill-count">${fmtNumber(i.count)}</div>
      <div class="pill-label">${i.label}</div>
    </button>`).join("");
}

function renderTopClients(clients) {
  const tbody = byId("topClientsBody");
  if (!tbody) return;
  if (!clients?.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t("noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = clients.map((c, i) => `
    <tr class="clickable" data-client-id="${c.clientId}">
      <td>${i + 1}</td>
      <td><b>${escapeHtml(c.name)}</b></td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.branch)}</td>
      <td class="num">${fmtMoney(c.totalRemaining)}</td>
    </tr>`).join("");
}

function renderRecentDebts(debts) {
  const tbody = byId("recentDebtsBody");
  if (!tbody) return;
  if (!debts?.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${t("noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = debts.map((d) => `
    <tr class="clickable" data-client-id="${d.clientId}">
      <td><b>${escapeHtml(d.client)}</b><div class="cell-sub">${escapeHtml(d.phone)}</div></td>
      <td>${escapeHtml(d.branch)}</td>
      <td>${fmtItem(d.itemType)}${d.itemDetails ? `<div class="cell-sub">${escapeHtml(d.itemDetails)}</div>` : ""}</td>
      <td class="num">${fmtMoney(d.amount)}</td>
      <td class="num">${fmtMoney(d.remainingAmount)}</td>
      <td>${fmtDate(d.dueDate)}</td>
      <td><span class="badge ${d.status}">${t(statusKey(d.status))}</span></td>
    </tr>`).join("");
}

function renderRecentPayments(payments) {
  const tbody = byId("recentPaymentsBody");
  if (!tbody) return;
  if (!payments?.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t("noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = payments.map((p) => `
    <tr class="clickable" data-client-id="${p.clientId}">
      <td>${fmtDate(p.paidDate)}</td>
      <td><b>${escapeHtml(p.client)}</b><div class="cell-sub">${escapeHtml(p.branch)}</div></td>
      <td><span class="badge method-${p.method}">${methodIcon(p.method)} ${fmtMethod(p.method)}</span></td>
      <td class="num">${fmtMoney(p.amount)}</td>
    </tr>`).join("");
}

function renderActivity(audits) {
  const root = byId("activityList");
  if (!root) return;
  if (!audits?.length) {
    root.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }
  root.innerHTML = audits.map((a) => `
    <li class="activity-item">
      <div class="activity-dot ${a.action}"></div>
      <div class="activity-body">
        <div class="activity-text">
          <b>${escapeHtml(a.user)}</b> ${escapeHtml(t(actionKey(a.action)))}
          ${escapeHtml(tableLabel(a.tableName))} #${a.recordId}
          ${a.branch ? `<span class="muted"> — ${escapeHtml(a.branch)}</span>` : ""}
        </div>
        <div class="activity-meta">${fmtDateTime(a.createdAt)}</div>
      </div>
    </li>`).join("");
}

// ====== CHARTS (Chart.js) =============================================
function getChartColors() {
  const css = getComputedStyle(document.documentElement);
  const get = (n, fb) => (css.getPropertyValue(n).trim() || fb);
  return {
    text: get("--text", "#e8ecf7"),
    muted: get("--text-muted", "#95a0bf"),
    grid: state.theme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)",
    primary: get("--primary", "#6366f1"),
    success: get("--success", "#10b981"),
    warning: get("--warning", "#f59e0b"),
    danger: get("--danger", "#ef4444"),
    info: get("--info", "#0ea5e9"),
    purple: get("--purple", "#a855f7"),
    orange: get("--orange", "#f97316"),
    gray: get("--gray", "#6b7280"),
  };
}

function destroyChart(name) {
  if (state.charts[name]) {
    try { state.charts[name].destroy(); } catch {}
    state.charts[name] = null;
  }
}

function renderTimelineChart(timeseries) {
  destroyChart("timeline");
  const c = getChartColors();
  const ctx = byId("chartTimeline");
  if (!ctx || typeof Chart === "undefined") return;
  const ctx2d = ctx.getContext ? ctx.getContext("2d") : null;
  if (!ctx2d) return; // jsdom yoki canvas yo'q muhitlar uchun
  const labels = timeseries.map((p) => {
    const d = new Date(p.date);
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0");
  });
  const grad = (color) => {
    const g = ctx2d.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, color + "55"); g.addColorStop(1, color + "00");
    return g;
  };
  state.charts.timeline = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: t("chartDebtAdded"), data: timeseries.map((p) => p.debtAdded),
          borderColor: c.primary, backgroundColor: grad(c.primary), fill: true, tension: 0.35,
          borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6 },
        { label: t("chartPaid"), data: timeseries.map((p) => p.paid),
          borderColor: c.success, backgroundColor: grad(c.success), fill: true, tension: 0.35,
          borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top", labels: { color: c.text, usePointStyle: true, padding: 18 } },
        tooltip: { callbacks: { label: (x) => `${x.dataset.label}: ${fmtMoney(x.parsed.y)}` } },
      },
      scales: {
        x: { ticks: { color: c.muted }, grid: { display: false } },
        y: { ticks: { color: c.muted, callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : v },
             grid: { color: c.grid } },
      },
    },
  });
}

function renderDoughnut(canvasId, data, chartName) {
  destroyChart(chartName);
  const c = getChartColors();
  const ctx = byId(canvasId);
  if (!ctx || typeof Chart === "undefined") return;
  const filtered = data.filter((d) => d.value > 0);
  const items = filtered.length ? filtered : [{ label: t("noData"), value: 1, color: c.gray }];
  state.charts[chartName] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: items.map((d) => d.label),
      datasets: [{ data: items.map((d) => d.value), backgroundColor: items.map((d) => d.color),
                   borderColor: state.theme === "dark" ? "#141a30" : "#ffffff", borderWidth: 3, hoverOffset: 8 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "65%",
      plugins: { legend: { position: "bottom", labels: { color: c.text, usePointStyle: true, padding: 12 } } },
    },
  });
}

function renderStatusChart(s) {
  const c = getChartColors();
  renderDoughnut("chartStatus", [
    { label: t("statusActive"), value: s.active, color: c.info },
    { label: t("statusPartial"), value: s.partial, color: c.orange },
    { label: t("statusPaid"), value: s.paid, color: c.success },
    { label: t("statusOverdue"), value: s.overdue, color: c.danger },
    { label: t("statusCancelled"), value: s.cancelled, color: c.gray },
  ], "status");
}
function renderMethodsChart(m) {
  const c = getChartColors();
  renderDoughnut("chartMethods", [
    { label: t("methodCash"), value: m.cashThisMonth || 0, color: c.success },
    { label: t("methodCard"), value: m.cardThisMonth || 0, color: c.info },
    { label: t("methodTransfer"), value: m.transferThisMonth || 0, color: c.purple },
  ], "methods");
}
function renderItemsChart(items) {
  const c = getChartColors();
  const palette = { playstation: c.primary, computer: c.info, billiard: c.warning, other: c.gray };
  renderDoughnut("chartItems", items.map((i) => ({
    label: fmtItem(i.type), value: i.count, color: palette[i.type] || c.gray,
  })), "items");
}
function renderBranchesChart(branches) {
  destroyChart("branches");
  const c = getChartColors();
  const ctx = byId("chartBranches");
  if (!ctx || typeof Chart === "undefined") return;
  state.charts.branches = new Chart(ctx, {
    type: "bar",
    data: {
      labels: branches.map((b) => b.name),
      datasets: [
        { label: t("totalDebt"), data: branches.map((b) => b.totalAmount || 0), backgroundColor: c.primary + "cc", borderRadius: 8 },
        { label: t("totalPaid"), data: branches.map((b) => b.totalPaid || 0), backgroundColor: c.success + "cc", borderRadius: 8 },
        { label: t("totalRemaining"), data: branches.map((b) => b.totalRemaining || 0), backgroundColor: c.warning + "cc", borderRadius: 8 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { color: c.text, usePointStyle: true } },
        tooltip: { callbacks: { label: (x) => `${x.dataset.label}: ${fmtMoney(x.parsed.y)}` } },
      },
      scales: {
        x: { ticks: { color: c.muted }, grid: { display: false } },
        y: { ticks: { color: c.muted, callback: (v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : v },
             grid: { color: c.grid } },
      },
    },
  });
}

// ====== MAIN RENDER ===================================================
function safe(fn, name) {
  try { fn(); } catch (e) { console.error(`[render:${name}] xatolik:`, e); }
}

function render(data) {
  if (!data) return;
  if (data.viewer) {
    safe(() => renderProfileButton(data.viewer), "profileButton");
    safe(() => renderHeroBadges(data.viewer), "heroBadges");
    // Filiallar ro'yxati: agar filter aktiv bo'lmasa, statistikadagi to'liq ro'yxatdan, aks holda saqlangan ro'yxatdan
    if (data.viewer.role === "owner") {
      if (!state.branchId && data.branches) {
        state.allBranches = data.branches.map((b) => ({ id: b.id, name: b.name }));
      }
    }
    // renderBranchFilter har doim chaqiriladi — admin uchun u dropdown'ni avto yashiradi
    safe(() => renderBranchFilter(data.viewer, state.allBranches || data.branches), "branchFilter");
  }
  safe(() => renderProfileDropdown(), "profileDropdown");
  safe(() => renderTopStats(data.money, data.statusCounts), "topStats");
  safe(() => renderBranches(data.branches), "branches");
  safe(() => renderStatusGrid(data.statusCounts), "statusGrid");
  safe(() => renderTopClients(data.topClients), "topClients");
  safe(() => renderRecentDebts(data.recentDebts), "recentDebts");
  safe(() => renderRecentPayments(data.recentPayments), "recentPayments");
  safe(() => renderActivity(data.recentAudits), "activity");
  safe(() => renderTimelineChart(data.timeseries || []), "timelineChart");
  safe(() => renderStatusChart(data.statusCounts), "statusChart");
  safe(() => renderMethodsChart(data.money), "methodsChart");
  // Filiallar kartasi: faqat owner uchun
  const branchesCard = byId("branchesCard");
  if (branchesCard) branchesCard.hidden = data.viewer?.role !== "owner";
  // Recent activity (oxirgi hodisalar) — faqat owner uchun
  const activityCard = byId("activityCard");
  if (activityCard) activityCard.hidden = data.viewer?.role !== "owner";
  // Notification yuklash
  safe(() => loadNotifications(), "notifications");
  const footer = byId("footerMeta");
  if (footer) footer.textContent = `${t("generatedAt")}: ${fmtDateTime(data.generatedAt)}`;
}

// ====== MODAL =========================================================
const FILTER_TITLES = {
  "total-debt": "modalTotalDebt",
  "total-paid": "modalTotalPaid",
  "remaining": "modalRemaining",
  "overdue": "modalOverdue",
  "due-today": "modalDueToday",
  "this-month": "modalThisMonth",
  "status:active": "modalStatusActive",
  "status:partial": "modalStatusPartial",
  "status:paid": "modalStatusPaid",
  "status:overdue": "modalStatusOverdue",
  "status:cancelled": "modalStatusCancelled",
  "status:duetoday": "modalDueToday",
};

function openModal(title, sub) {
  const overlay = byId("modalOverlay");
  const tEl = byId("modalTitle");
  const sEl = byId("modalSub");
  const bEl = byId("modalBody");
  if (!overlay || !tEl || !sEl || !bEl) {
    alert("Modal HTML topilmadi! Sahifani yangilang (Ctrl+F5).");
    return null;
  }
  tEl.textContent = title;
  sEl.textContent = sub || "";
  bEl.innerHTML = `<div class="modal-loading">⏳ ${t("loading")}</div>`;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  return bEl;
}

function closeModal() {
  const o = byId("modalOverlay");
  if (o) o.hidden = true;
  document.body.style.overflow = "";
}

function showError(body, msg) {
  body.innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:6px;color:var(--danger);">${t("error")}</div>
      <div style="color:var(--text-muted);font-size:13px;">${escapeHtml(msg)}</div>
    </div>`;
}

async function showFilterModal(filter) {
  const titleKey = FILTER_TITLES[filter] || "modalTotalDebt";
  const body = openModal(t(titleKey), "");
  if (!body) return;

  if (!state.viewerId) {
    showError(body, "Profil ID topilmadi. Sahifani yangilang.");
    return;
  }

  try {
    const url = `/api/list?filter=${encodeURIComponent(filter)}&${buildScopeQuery()}`;
    const data = await api(url);
    renderModalList(data, body);
  } catch (err) {
    console.error("Filter modal error:", err);
    showError(body, err.message || String(err));
  }
}

async function showClientModal(clientId) {
  const body = openModal(t("modalClient"), "");
  if (!body) return;

  if (!state.viewerId) {
    showError(body, "Profil ID topilmadi. Sahifani yangilang.");
    return;
  }

  try {
    const data = await api(`/api/client/${clientId}?asUser=${state.viewerId}`);
    renderClientModal(data, body);
  } catch (err) {
    console.error("Client modal error:", err);
    showError(body, err.message || String(err));
  }
}

function renderModalList(data, body) {
  const isAdmin = data.viewer.role === "admin";
  const items = data.items || [];

  byId("modalSub").textContent =
    `${t("viewingAs")}: ${data.viewer.fullName} (${t(isAdmin ? "roleAdmin" : "roleOwner")})`;

  if (items.length === 0) {
    body.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }

  let summaryHtml = "";
  if (data.kind === "debts") {
    const totalAmount = items.reduce((a, i) => a + (i.amount || 0), 0);
    const totalPaid = items.reduce((a, i) => a + (i.paidAmount || 0), 0);
    const totalRemaining = items.reduce((a, i) => a + (i.remainingAmount || 0), 0);
    summaryHtml = `
      <div class="modal-summary">
        <div><span class="label">${t("summaryCount")}</span><span class="value">${fmtNumber(items.length)}</span></div>
        <div><span class="label">${t("summaryAmount")}</span><span class="value">${fmtMoney(totalAmount)}</span></div>
        <div><span class="label">${t("summaryPaid")}</span><span class="value" style="color:var(--success)">${fmtMoney(totalPaid)}</span></div>
        <div><span class="label">${t("summaryRemaining")}</span><span class="value" style="color:var(--warning)">${fmtMoney(totalRemaining)}</span></div>
      </div>`;
  } else if (data.kind === "payments") {
    const total = items.reduce((a, i) => a + (i.amount || 0), 0);
    const cash = items.filter((i) => i.method === "cash").reduce((a, i) => a + i.amount, 0);
    const card = items.filter((i) => i.method === "card").reduce((a, i) => a + i.amount, 0);
    const trf = items.filter((i) => i.method === "transfer").reduce((a, i) => a + i.amount, 0);
    summaryHtml = `
      <div class="modal-summary">
        <div><span class="label">${t("summaryCount")}</span><span class="value">${fmtNumber(items.length)}</span></div>
        <div><span class="label">${t("summaryAmount")}</span><span class="value">${fmtMoney(total)}</span></div>
        <div><span class="label">${t("methodCash")}</span><span class="value" style="color:var(--success)">${fmtMoney(cash)}</span></div>
        <div><span class="label">${t("methodCard")}</span><span class="value" style="color:var(--info)">${fmtMoney(card)}</span></div>
        <div><span class="label">${t("methodTransfer")}</span><span class="value" style="color:var(--purple)">${fmtMoney(trf)}</span></div>
      </div>`;
  }

  const warnHtml = isAdmin ? `<div class="admin-warn">${t("adminNoLogs")}</div>` : "";
  const listHtml = data.kind === "debts"
    ? items.map((d) => debtCardHtml(d, isAdmin)).join("")
    : items.map(paymentCardHtml).join("");

  body.innerHTML = summaryHtml + warnHtml + listHtml;
}

function isUnknownDate(d) {
  if (!d) return true;
  const x = new Date(d);
  return x.getUTCFullYear() >= 2099;
}

function debtCardHtml(d, isAdmin) {
  const cls = d.status === "paid" ? "success" : d.status === "overdue" ? "danger" : "warning";
  const dueText = isUnknownDate(d.dueDate) ? "🤷 " + t("formDueUnknown") : "📅 " + t("dueDate") + ": " + fmtDate(d.dueDate);
  const canPay = d.status !== "paid" && d.status !== "cancelled" && d.remainingAmount > 0;
  const canCancel = d.status !== "cancelled" && d.status !== "paid";

  const paymentsHtml = !d.payments?.length
    ? `<div class="no-logs">${t("noPayments")}</div>`
    : d.payments.map((p) => `
        <div class="sub-item">
          <div>
            <span class="badge method-${p.method}">${methodIcon(p.method)} ${fmtMethod(p.method)}</span>
            <span style="margin-left:8px;font-weight:600">${fmtMoney(p.amount)}</span>
          </div>
          <div class="sub-item-meta">${fmtDateTime(p.paidDate)}${p.notes ? " • " + escapeHtml(p.notes) : ""}</div>
        </div>`).join("");

  let auditHtml = "";
  if (!isAdmin) {
    if (d.auditLogs && d.auditLogs.length > 0) {
      auditHtml = `
        <div class="sub-section">
          <div class="sub-section-title">📋 ${t("auditLogTitle")} <span class="count-pill">${d.auditLogs.length}</span></div>
          ${d.auditLogs.map((a) => `
            <div class="audit-row">
              <div class="audit-dot" style="background:${auditColor(a.action)}"></div>
              <div class="audit-info">
                <div><b>${escapeHtml(a.user)}</b> ${escapeHtml(t(actionKey(a.action)))}</div>
                <div class="sub-item-meta">${fmtDateTime(a.createdAt)}${a.newValue ? " • " + escapeHtml(truncate(a.newValue, 80)) : ""}</div>
              </div>
            </div>`).join("")}
        </div>`;
    } else {
      auditHtml = `<div class="sub-section"><div class="sub-section-title">📋 ${t("auditLogTitle")}</div><div class="no-logs">${t("noLogs")}</div></div>`;
    }
  }

  return `
    <div class="item-card clickable" data-expand="1">
      <div class="item-card-head">
        <div style="flex:1;min-width:0">
          <div class="item-card-title">
            <span class="client-link" data-client-id="${d.clientId}" style="cursor:pointer;color:var(--primary)">👤 ${escapeHtml(d.client)}</span>
            <span class="badge ${d.status}">${t(statusKey(d.status))}</span>
          </div>
          <div class="item-card-meta">
            <span>📞 ${escapeHtml(d.clientPhone)}</span>
            <span>🏢 ${escapeHtml(d.branch)}</span>
            <span>🎮 ${fmtItem(d.itemType)}${d.itemDetails ? " — " + escapeHtml(d.itemDetails) : ""}</span>
            <span>${dueText}</span>
          </div>
          <div class="debt-actions">
            ${canPay ? `<button type="button" class="action-btn success" data-action="pay-debt" data-debt-id="${d.id}" data-client="${escapeHtml(d.client)}" data-amount="${d.amount}" data-remaining="${d.remainingAmount}" data-item="${escapeHtml(d.itemDetails || fmtItem(d.itemType))}">${t("actionPay")}</button>` : ""}
            <button type="button" class="action-btn" data-action="edit-debt" data-debt-id="${d.id}">${t("actionEdit")}</button>
            ${canCancel ? `<button type="button" class="action-btn" data-action="cancel-debt" data-debt-id="${d.id}" data-client="${escapeHtml(d.client)}">${t("actionCancel")}</button>` : ""}
            ${!isAdmin ? `<button type="button" class="action-btn danger" data-action="delete-debt" data-debt-id="${d.id}" data-client="${escapeHtml(d.client)}">${t("actionDelete")}</button>` : ""}
          </div>
        </div>
        <div style="text-align:right">
          <div class="item-card-amount ${cls}">${fmtMoney(d.remainingAmount)}</div>
          <div class="sub-item-meta">${fmtMoney(d.amount)} ${t("totalDebt").toLowerCase()}</div>
          <button class="expand-toggle" type="button" style="margin-top:6px" data-expand-btn>${t("expand")}</button>
        </div>
      </div>
      <div class="item-card-body">
        <div class="sub-section">
          <div class="sub-section-title">📌 ${t("notes")}</div>
          <div class="sub-item">
            <div>
              <div><b>${t("createdBy")}:</b> ${escapeHtml(d.createdBy)} • ${fmtDateTime(d.createdAt)}</div>
              <div class="sub-item-meta">${t("borrowedDate")}: ${fmtDate(d.borrowedDate)}</div>
              ${d.notes ? `<div class="sub-item-meta">💬 ${escapeHtml(d.notes)}</div>` : ""}
            </div>
          </div>
        </div>
        <div class="sub-section">
          <div class="sub-section-title">💵 ${t("paymentsHistory")} <span class="count-pill">${d.payments?.length || 0}</span></div>
          ${paymentsHtml}
        </div>
        ${auditHtml}
      </div>
    </div>`;
}

function paymentCardHtml(p) {
  return `
    <div class="item-card">
      <div class="item-card-head">
        <div style="flex:1;min-width:0">
          <div class="item-card-title">
            <span class="badge method-${p.method}">${methodIcon(p.method)} ${fmtMethod(p.method)}</span>
            <span class="client-link" data-client-id="${p.clientId}" style="cursor:pointer;color:var(--primary)">👤 ${escapeHtml(p.client)}</span>
          </div>
          <div class="item-card-meta">
            <span>📞 ${escapeHtml(p.clientPhone)}</span>
            <span>🏢 ${escapeHtml(p.branch)}</span>
            <span>🎮 ${escapeHtml(p.debtItem)}</span>
            <span>📅 ${fmtDateTime(p.paidDate)}</span>
            <span>✍️ ${escapeHtml(p.recordedBy)}</span>
          </div>
        </div>
        <div style="text-align:right">
          <div class="item-card-amount success">${fmtMoney(p.amount)}</div>
          <div class="sub-item-meta">${fmtMoney(p.debtRemaining)} ${t("remaining")}</div>
        </div>
      </div>
    </div>`;
}

function renderClientModal(data, body) {
  const isAdmin = data.viewer.role === "admin";
  const c = data.client;
  byId("modalTitle").textContent = c.name + (c.isBlacklisted ? " ⛔" : "");
  byId("modalSub").textContent = `📞 ${c.phone} · 🏢 ${c.branch}`;

  let warnHtml = isAdmin ? `<div class="admin-warn">${t("adminNoLogs")}</div>` : "";
  if (c.isBlacklisted) {
    warnHtml += `<div class="admin-warn" style="background:var(--danger-soft);border-color:var(--danger);color:var(--danger)">
      ⛔ <b>QORA RO'YXATDA</b>${c.blacklistReason ? " — " + escapeHtml(c.blacklistReason) : ""}
      ${c.blacklistedAt ? ` <span class="muted" style="font-size:11px">(${fmtDateTime(c.blacklistedAt)})</span>` : ""}
    </div>`;
  }

  const summaryHtml = `
    <div class="modal-summary">
      <div><span class="label">${t("summaryDebts")}</span><span class="value">${fmtNumber(data.summary.debtsCount)}</span></div>
      <div><span class="label">${t("summaryPayments")}</span><span class="value">${fmtNumber(data.summary.paymentsCount)}</span></div>
      <div><span class="label">${t("summaryAmount")}</span><span class="value">${fmtMoney(data.summary.totalAmount)}</span></div>
      <div><span class="label">${t("summaryPaid")}</span><span class="value" style="color:var(--success)">${fmtMoney(data.summary.totalPaid)}</span></div>
      <div><span class="label">${t("summaryRemaining")}</span><span class="value" style="color:var(--warning)">${fmtMoney(data.summary.totalRemaining)}</span></div>
    </div>`;

  const debtsHtml = !data.debts.length
    ? `<div class="empty-state">${t("noData")}</div>`
    : data.debts.map((d) => debtCardHtml({
        ...d, clientId: c.id, client: c.name, clientPhone: c.phone, auditLogs: null,
      }, isAdmin)).join("");

  let auditHtml = "";
  if (!isAdmin && data.auditLogs?.length) {
    auditHtml = `
      <div class="sub-section" style="margin-top:24px">
        <div class="sub-section-title">📋 ${t("auditLogTitle")} <span class="count-pill">${data.auditLogs.length}</span></div>
        ${data.auditLogs.map((a) => `
          <div class="audit-row">
            <div class="audit-dot" style="background:${auditColor(a.action)}"></div>
            <div class="audit-info">
              <div><b>${escapeHtml(a.user)}</b> ${escapeHtml(t(actionKey(a.action)))} ${escapeHtml(tableLabel(a.tableName))} #${a.recordId}</div>
              <div class="sub-item-meta">${fmtDateTime(a.createdAt)}${a.newValue ? " • " + escapeHtml(truncate(a.newValue, 100)) : ""}</div>
            </div>
          </div>`).join("")}
      </div>`;
  }

  const isOwner = !isAdmin;
  const blacklistBtn = c.isBlacklisted
    ? `<button type="button" class="action-btn success" data-action="unblacklist-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">✅ Ro'yxatdan chiqarish</button>`
    : `<button type="button" class="action-btn danger" data-action="blacklist-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">⛔ Qora ro'yxatga</button>`;
  body.innerHTML = `
    ${warnHtml}
    ${summaryHtml}
    <div style="margin-bottom:14px;display:flex;flex-wrap:wrap;gap:8px">
      ${c.isBlacklisted ? "" : `<button type="button" class="btn btn-success" data-action="add-debt-for-client" data-client-id="${c.id}" style="display:inline-flex;align-items:center;gap:6px;width:auto;padding:8px 16px">
        ➕ ${t("addDebt")}
      </button>`}
      <button type="button" class="action-btn" data-action="edit-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}" data-phone="${escapeHtml(c.phone)}" data-notes="${escapeHtml(c.notes || "")}">✏️ ${t("clientEdit")}</button>
      ${blacklistBtn}
      <button type="button" class="action-btn" data-action="soft-delete-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">👁️‍🗨️ ${t("clientDeleteSoft")}</button>
      ${isOwner ? `<button type="button" class="action-btn danger" data-action="hard-delete-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">🗑️ ${t("clientDeleteHard")}</button>` : ""}
    </div>
    <div class="sub-section-title" style="margin-bottom:12px">📦 ${t("debtsHistory")} <span class="count-pill">${data.debts.length}</span></div>
    ${debtsHtml}
    ${auditHtml}`;
}

function auditColor(action) {
  const c = getChartColors();
  switch (action) {
    case "create": return c.success;
    case "update": return c.info;
    case "delete":
    case "soft_delete": return c.danger;
    case "payment": return c.purple;
    case "login":
    case "logout": return c.warning;
    default: return c.primary;
  }
}

// ====== FORM MODAL (qarz qo'shish, to'lov, tasdiqlash) ================
function openFormModal(title, sub, bodyHtml) {
  const overlay = byId("formOverlay");
  const tEl = byId("formTitle");
  const sEl = byId("formSub");
  const bEl = byId("formBody");
  if (!overlay || !tEl || !sEl || !bEl) {
    alert("Form modal HTML topilmadi");
    return null;
  }
  tEl.textContent = title;
  sEl.textContent = sub || "";
  bEl.innerHTML = bodyHtml;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  return bEl;
}

function closeFormModal() {
  const o = byId("formOverlay");
  if (o) o.hidden = true;
  if (byId("modalOverlay")?.hidden !== false) {
    document.body.style.overflow = "";
  }
}

async function postJson(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch {}
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

async function deleteJson(path) {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function todayInput() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

// =========================================
// FORM 1: Yangi qarz qo'shish
// =========================================
async function showAddDebtForm(presetClient) {
  if (!state.viewerId) return;
  const viewer = state.profiles.find((p) => p.id === state.viewerId);
  if (!viewer) return;

  // Filiallar va mijozlarni olish
  let allClients = [];
  try {
    if (state.data?.recentDebts) {
      // recentDebts'dan + topClients'dan unique mijozlar yig'amiz
      const uniq = new Map();
      (state.data.recentDebts || []).forEach((d) => {
        if (!uniq.has(d.clientId)) uniq.set(d.clientId, { id: d.clientId, name: d.client, phone: d.phone, branch: d.branch });
      });
      (state.data.topClients || []).forEach((c) => {
        if (!uniq.has(c.clientId)) uniq.set(c.clientId, { id: c.clientId, name: c.name, phone: c.phone, branch: c.branch });
      });
      allClients = Array.from(uniq.values());
    }
  } catch {}

  const branches = state.data?.branches || [];
  const isOwner = viewer.role === "owner";

  const today = todayInput();
  const dueDefault = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();

  const branchOptions = isOwner
    ? branches.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("")
    : "";

  const clientOptions = allClients
    .filter((c) => isOwner || branches.some((b) => b.name === c.branch))
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(c.phone)})</option>`)
    .join("");

  const html = `
    <form id="debtForm">
      <div id="formMessage"></div>

      <div class="form-group">
        <label class="form-label">${t("formClient")}</label>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button type="button" class="btn btn-secondary" data-mode="existing" id="modeExisting" style="flex:1">${t("btnAddExisting")}</button>
          <button type="button" class="btn btn-secondary" data-mode="new" id="modeNew" style="flex:1">${t("btnAddNew")}</button>
        </div>

        <div id="existingClientBlock">
          <select class="form-select" name="clientId" id="clientSelect">
            <option value="">${t("selectClient")}</option>
            ${clientOptions}
          </select>
        </div>

        <div id="newClientBlock" hidden>
          <div class="form-row">
            <div>
              <label class="form-label">${t("formName")}</label>
              <input class="form-input" name="newName" type="text" placeholder="${t("formNamePlaceholder")}" />
            </div>
            <div>
              <label class="form-label">${t("formPhone")}</label>
              <input class="form-input" name="newPhone" type="tel" placeholder="${t("formPhonePlaceholder")}" />
            </div>
          </div>
        </div>
      </div>

      ${isOwner ? `
        <div class="form-group">
          <label class="form-label">${t("formBranch")}</label>
          <select class="form-select" name="branchId" required>
            ${branchOptions}
          </select>
          <div class="form-hint">Yangi mijoz uchun filial tanlanadi (mavjud mijoz uchun avtomatik)</div>
        </div>
      ` : ""}

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("formItemType")}</label>
          <select class="form-select" name="itemType" required>
            <option value="playstation">🎮 PlayStation</option>
            <option value="computer">💻 Kompyuter</option>
            <option value="billiard">🎱 Bilyard</option>
            <option value="other">📦 Boshqa</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t("formAmount")}</label>
          <input class="form-input" name="amount" type="number" min="1000" step="500" placeholder="50000" required />
          <div class="form-hint">Eng kami 1000 so'm</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("formItemDetails")}</label>
        <input class="form-input" name="itemDetails" type="text" placeholder="${t("formItemPlaceholder")}" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("formBorrowedDate")}</label>
          <input class="form-input" name="borrowedDate" type="date" value="${today}" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t("formDueDate")}</label>
          <input class="form-input" name="dueDate" type="date" value="${dueDefault}" id="dueDateInput" />
          <label class="form-checkbox" style="margin-top:6px">
            <input type="checkbox" name="dueDateUnknown" id="dueDateUnknown" />
            ${t("formDueUnknown")}
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("formNotes")}</label>
        <textarea class="form-textarea" name="notes" placeholder="${t("formNotesPlaceholder")}"></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
      </div>
    </form>`;

  const body = openFormModal(t("addDebtTitle"), `${t("viewingAs")}: ${viewer.fullName}`, html);
  if (!body) return;

  // Mode toggle
  const modeExisting = byId("modeExisting");
  const modeNew = byId("modeNew");
  const existingBlock = byId("existingClientBlock");
  const newBlock = byId("newClientBlock");

  function setMode(mode) {
    if (mode === "new") {
      modeNew.classList.add("btn-primary"); modeNew.classList.remove("btn-secondary");
      modeExisting.classList.add("btn-secondary"); modeExisting.classList.remove("btn-primary");
      existingBlock.hidden = true;
      newBlock.hidden = false;
    } else {
      modeExisting.classList.add("btn-primary"); modeExisting.classList.remove("btn-secondary");
      modeNew.classList.add("btn-secondary"); modeNew.classList.remove("btn-primary");
      existingBlock.hidden = false;
      newBlock.hidden = true;
    }
  }

  modeExisting.addEventListener("click", () => setMode("existing"));
  modeNew.addEventListener("click", () => setMode("new"));

  if (presetClient) {
    setMode("existing");
    const sel = byId("clientSelect");
    if (sel && [...sel.options].some((o) => o.value === String(presetClient))) {
      sel.value = String(presetClient);
    }
  } else {
    setMode(allClients.length > 0 ? "existing" : "new");
  }

  // Due date checkbox
  const dueChk = byId("dueDateUnknown");
  const dueInput = byId("dueDateInput");
  dueChk.addEventListener("change", () => {
    dueInput.disabled = dueChk.checked;
    if (dueChk.checked) dueInput.value = "";
  });

  // Cancel
  byId("formCancelBtn").addEventListener("click", closeFormModal);

  // Submit
  byId("debtForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";

    const fd = new FormData(form);
    const isNew = !newBlock.hidden;

    let clientId = null;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");

      if (isNew) {
        const newName = String(fd.get("newName") || "").trim();
        const newPhone = String(fd.get("newPhone") || "").trim();
        if (!newName || !newPhone) throw new Error("Ism va telefon majburiy");
        const branchId = isOwner ? Number(fd.get("branchId")) : viewer.branchId;
        const created = await postJson(`/api/clients?asUser=${state.viewerId}`, {
          name: newName, phone: newPhone, branchId,
        });
        clientId = created.id;
      } else {
        clientId = Number(fd.get("clientId") || 0);
        if (!clientId) throw new Error("Mijoz tanlanmagan");
      }

      const dueUnknown = !!fd.get("dueDateUnknown");
      const payload = {
        clientId,
        itemType: String(fd.get("itemType")),
        itemDetails: String(fd.get("itemDetails") || "") || null,
        amount: Number(fd.get("amount")),
        borrowedDate: String(fd.get("borrowedDate")),
        dueDate: dueUnknown ? null : String(fd.get("dueDate")),
        dueDateUnknown: dueUnknown,
        notes: String(fd.get("notes") || "") || null,
      };

      await postJson(`/api/debts?asUser=${state.viewerId}`, payload);

      toast(t("successDebtAdded"), "success");
      closeFormModal();
      loadData();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

// =========================================
// FORM 2: To'lov yozish (qarzni kamaytirish)
// =========================================
function showPaymentForm(debtId, clientName, debtAmount, debtRemaining, debtItem) {
  const remaining = Number(debtRemaining || 0);
  const today = todayInput();
  const html = `
    <form id="paymentForm">
      <div id="formMessage"></div>

      <div class="form-group" style="background:var(--bg-soft);padding:12px;border-radius:10px">
        <div style="font-size:12px;color:var(--text-muted)">👤 ${escapeHtml(clientName)} — ${escapeHtml(debtItem || "")}</div>
        <div style="font-size:13px;margin-top:4px">
          <b>${t("totalDebt")}:</b> ${fmtMoney(debtAmount)} •
          <b style="color:var(--warning)">${t("paymentRemaining")}: ${fmtMoney(remaining)}</b>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("paymentAmount")}</label>
        <input class="form-input" name="amount" type="number" min="1000" max="${remaining}" step="500" value="${remaining}" required />
        <div class="form-hint">${t("paymentMaxHint")}: ${fmtMoney(remaining)}</div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("paymentMethod")}</label>
        <div class="form-radio-group">
          <div class="form-radio">
            <input type="radio" name="method" value="cash" id="m_cash" checked />
            <label for="m_cash">💵 ${t("methodCash")}</label>
          </div>
          <div class="form-radio">
            <input type="radio" name="method" value="card" id="m_card" />
            <label for="m_card">💳 ${t("methodCard")}</label>
          </div>
          <div class="form-radio">
            <input type="radio" name="method" value="transfer" id="m_transfer" />
            <label for="m_transfer">🔄 ${t("methodTransfer")}</label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("paymentDate")}</label>
        <input class="form-input" name="paidDate" type="date" value="${today}" required />
      </div>

      <div class="form-group">
        <label class="form-label">${t("paymentNotes")}</label>
        <textarea class="form-textarea" name="notes" placeholder="${t("formNotesPlaceholder")}"></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💵 ${t("formSave")}</button>
      </div>
    </form>`;

  const body = openFormModal(t("paymentTitle"), clientName, html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("paymentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";

    const fd = new FormData(form);
    const amount = Number(fd.get("amount"));
    if (amount <= 0 || amount > remaining) {
      msg.innerHTML = `<div class="form-error">⚠️ Summa noto'g'ri (max: ${fmtMoney(remaining)})</div>`;
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      const method = String(fd.get("method"));
      const paidDate = String(fd.get("paidDate"));
      const notes = String(fd.get("notes") || "") || null;
      await postJson(`/api/debts/${debtId}/payments?asUser=${state.viewerId}`, {
        amount, method, paidDate, notes,
      });
      toast(t("successPayment"), "success");
      // Chek chiqarishni so'rash
      const newRemaining = remaining - amount;
      showReceiptPrompt({
        clientName, debtItem,
        amount, method, paidDate, notes,
        debtAmount: Number(debtAmount), debtRemaining: newRemaining,
        cashier: state.me?.fullName || "—",
      });
      loadData();
      const overlay = byId("modalOverlay");
      if (overlay && !overlay.hidden) closeModal();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💵 " + t("formSave");
    }
  });
}

// ===== CHEK CHOP ETISH ===============================================
function showReceiptPrompt(data) {
  const overlay = byId("formOverlay");
  if (!overlay) return;
  const titleEl = byId("formTitle");
  const subEl = byId("formSub");
  const bodyEl = byId("formBody");
  if (titleEl) titleEl.textContent = "✅ To'lov yozildi";
  if (subEl) subEl.textContent = data.clientName || "";
  bodyEl.innerHTML = `
    <div style="padding:18px 0;text-align:center">
      <div style="font-size:48px;margin-bottom:10px">🧾</div>
      <p style="margin-bottom:8px;font-weight:600">To'lov muvaffaqiyatli qabul qilindi.</p>
      <p style="color:var(--text-muted);font-size:13px">Chek chop etishni xohlaysizmi?</p>
      <div class="modal-summary" style="margin-top:18px;text-align:left">
        <div><span class="label">Mijoz</span><span class="value">${escapeHtml(data.clientName)}</span></div>
        <div><span class="label">Xizmat</span><span class="value">${escapeHtml(data.debtItem || "—")}</span></div>
        <div><span class="label">Summa</span><span class="value" style="color:var(--success)">${fmtMoney(data.amount)}</span></div>
        <div><span class="label">Usul</span><span class="value">${methodIcon(data.method)} ${fmtMethod(data.method)}</span></div>
        <div><span class="label">Qoldiq qarz</span><span class="value" style="color:var(--warning)">${fmtMoney(data.debtRemaining)}</span></div>
      </div>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" id="receiptSkipBtn">Yopish</button>
      <button type="button" class="btn btn-success" id="receiptPrintBtn" style="flex:1">🖨️ Chek chop etish</button>
    </div>`;
  overlay.hidden = false;
  byId("receiptSkipBtn").addEventListener("click", closeFormModal);
  byId("receiptPrintBtn").addEventListener("click", () => {
    printReceipt(data);
  });
}

// ===== BACKUP / RESTORE ==============================================
async function downloadBackup() {
  try {
    toast("Backup tayyorlanmoqda...", "info");
    const res = await fetch("/api/backup");
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || `HTTP ${res.status}`);
    }
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") || "";
    const m = cd.match(/filename="([^"]+)"/);
    const filename = m ? m[1] : `gamezone-backup-${Date.now()}.db`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    toast("✅ Backup yuklab olindi", "success");
  } catch (err) {
    toast(`⚠️ ${err.message}`, "error");
  }
}

function showRestoreForm() {
  const html = `
    <form id="restoreForm">
      <div id="formMessage"></div>
      <div class="admin-warn" style="margin-bottom:14px;background:var(--danger-soft);color:var(--danger);border-color:var(--danger)">
        ⚠️ <b>OGOHLANTIRISH:</b> Tiklash joriy bazaning to'liq ustiga yoziladi.<br>
        Avval joriy bazaning <b>Backup yuklab olish</b> tugmasi bilan zaxirasini saqlang.
      </div>
      <div class="form-group">
        <label class="form-label">.db fayl tanlang</label>
        <input class="form-input" name="file" type="file" accept=".db,application/octet-stream" required />
        <div class="form-hint">Faqat avval shu tizimdan yuklab olingan SQLite fayl. Server avtomatik qayta ishga tushadi.</div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-danger" id="formSubmitBtn">⏪ Tiklash</button>
      </div>
    </form>`;
  const body = openFormModal("Backup'dan tiklash", "", html);
  if (!body) return;
  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("restoreForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[name="file"]');
    const file = fileInput.files?.[0];
    if (!file) return;
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    submitBtn.disabled = true;
    submitBtn.textContent = "Yuklanmoqda...";
    try {
      const buf = await file.arrayBuffer();
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buf,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      msg.innerHTML = `<div class="admin-warn" style="background:var(--success-soft);color:var(--success);border-color:var(--success)">
        ✅ Baza tiklandi (xavfsizlik backup: ${escapeHtml(data.safetyBackup)}).<br>
        Server qayta ishga tushadi — sahifa 5 soniyadan keyin yangilanadi.
      </div>`;
      submitBtn.disabled = true;
      submitBtn.textContent = "Tiklandi";
      setTimeout(() => { window.location.reload(); }, 5000);
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = "⏪ Tiklash";
    }
  });
}

// ===== EKSPORT (Excel / PDF) =========================================
function showExportForm() {
  const today = todayInput();
  const monthAgo = (() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();
  const html = `
    <form id="exportForm">
      <div id="formMessage"></div>
      <div class="form-group">
        <label class="form-label">Hisobot turi</label>
        <select class="form-select" name="kind" id="exportKind">
          <option value="debtors">📋 Qarzdorlar (faol/qisman/kechikkan)</option>
          <option value="all-debts">📦 Barcha qarzlar</option>
          <option value="payments">💵 To'lovlar (sana oralig'i bilan)</option>
        </select>
      </div>
      <div class="form-row" id="dateRangeBlock" hidden>
        <div class="form-group">
          <label class="form-label">Boshlanish</label>
          <input class="form-input" name="from" type="date" value="${monthAgo}" />
        </div>
        <div class="form-group">
          <label class="form-label">Tugash</label>
          <input class="form-input" name="to" type="date" value="${today}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Format</label>
        <div class="form-radio-group">
          <div class="form-radio">
            <input type="radio" name="format" value="excel" id="fmt_xlsx" checked />
            <label for="fmt_xlsx">📊 Excel (.xlsx)</label>
          </div>
          <div class="form-radio">
            <input type="radio" name="format" value="pdf" id="fmt_pdf" />
            <label for="fmt_pdf">📄 PDF</label>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">⬇️ Yuklab olish</button>
      </div>
    </form>`;
  const body = openFormModal("Hisobotni eksport qilish", "", html);
  if (!body) return;
  const kindSel = byId("exportKind");
  const dateBlock = byId("dateRangeBlock");
  function syncRange() {
    dateBlock.hidden = kindSel.value !== "payments";
  }
  syncRange();
  kindSel.addEventListener("change", syncRange);

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("exportForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const kind = String(fd.get("kind"));
    const format = String(fd.get("format"));
    const params = new URLSearchParams();
    params.set("kind", kind);
    if (kind === "payments") {
      if (fd.get("from")) params.set("from", String(fd.get("from")));
      if (fd.get("to")) params.set("to", String(fd.get("to")));
    }
    const url = format === "pdf" ? `/api/export/pdf?${params}` : `/api/export/excel?${params}`;
    const submitBtn = byId("formSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Tayyorlanmoqda...";
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const m = cd.match(/filename="([^"]+)"/);
      const filename = m ? m[1] : `gamezone-${kind}.${format === "pdf" ? "pdf" : "xlsx"}`;
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(dlUrl); }, 0);
      toast(`✅ ${filename} yuklab olindi`, "success");
      closeFormModal();
    } catch (err) {
      byId("formMessage").innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = "⬇️ Yuklab olish";
    }
  });
}

function showBlacklistForm(clientId, clientName) {
  const html = `
    <form id="blacklistForm">
      <div id="formMessage"></div>
      <div class="admin-warn" style="margin-bottom:14px;background:var(--danger-soft);color:var(--danger);border-color:var(--danger)">
        ⚠️ <b>${escapeHtml(clientName)}</b>'ni qora ro'yxatga qo'shyapsiz.<br>
        Endi bu mijozga yangi qarz yozib bo'lmaydi.
      </div>
      <div class="form-group">
        <label class="form-label">Sabab (ixtiyoriy)</label>
        <textarea class="form-textarea" name="reason" placeholder="Masalan: ko'p marta qaytarmagan, telefon o'chirilgan, ..."></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-danger" id="formSubmitBtn">⛔ Qora ro'yxatga qo'shish</button>
      </div>
    </form>`;
  const body = openFormModal("Qora ro'yxat", clientName, html);
  if (!body) return;
  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("blacklistForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const reason = String(fd.get("reason") || "").trim();
    const submitBtn = byId("formSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = t("saving");
    try {
      const res = await fetch(`/api/clients/${clientId}/blacklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklist: true, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      toast("Qora ro'yxatga qo'shildi", "success");
      closeFormModal();
      showClientModal(clientId);
    } catch (err) {
      byId("formMessage").innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      submitBtn.disabled = false;
      submitBtn.textContent = "⛔ Qora ro'yxatga qo'shish";
    }
  });
}

function printReceipt(data) {
  const settings = state.settings || {};
  const systemName = settings.systemName || "Game Zone";
  const subtitle = settings.systemSubtitle || "";
  const logo = settings.logo || "";
  const now = new Date();
  const dateStr = fmtDateTime(now);
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Chek</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 12px; padding: 8px; width: 80mm; color: #000; }
  .receipt { width: 100%; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .big { font-size: 14px; }
  .huge { font-size: 18px; }
  .muted { color: #555; font-size: 10px; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; gap: 4px; margin-bottom: 2px; }
  .row .label { color: #333; }
  .row .val { font-weight: 600; text-align: right; flex: 1; }
  .logo { max-width: 60px; max-height: 60px; margin: 0 auto 4px; display: block; }
  .footer { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #000; text-align: center; font-size: 10px; }
  @media print {
    body { padding: 4px; }
    button { display: none !important; }
  }
</style></head><body>
<div class="receipt">
  <div class="center">
    ${logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="logo">` : ""}
    <div class="huge bold">${escapeHtml(systemName)}</div>
    ${subtitle ? `<div class="muted">${escapeHtml(subtitle)}</div>` : ""}
  </div>
  <hr>
  <div class="center bold big">TO'LOV CHEKI</div>
  <div class="center muted">${escapeHtml(dateStr)}</div>
  <hr>
  <div class="row"><span class="label">Mijoz:</span><span class="val">${escapeHtml(data.clientName)}</span></div>
  <div class="row"><span class="label">Xizmat:</span><span class="val">${escapeHtml(data.debtItem || "—")}</span></div>
  <div class="row"><span class="label">Usul:</span><span class="val">${escapeHtml(fmtMethod(data.method))}</span></div>
  ${data.notes ? `<div class="row"><span class="label">Izoh:</span><span class="val">${escapeHtml(data.notes)}</span></div>` : ""}
  <hr>
  <div class="row big bold"><span>To'landi:</span><span class="val">${escapeHtml(fmtMoney(data.amount))}</span></div>
  <div class="row"><span class="label">Jami qarz:</span><span class="val">${escapeHtml(fmtMoney(data.debtAmount))}</span></div>
  <div class="row bold"><span class="label">Qoldiq:</span><span class="val">${escapeHtml(fmtMoney(data.debtRemaining))}</span></div>
  <hr>
  <div class="row"><span class="label">Kassir:</span><span class="val">${escapeHtml(data.cashier || "—")}</span></div>
  <div class="footer">
    Rahmat! ${data.debtRemaining > 0 ? "Qoldiq qarz uchun yana kelishingizni kutamiz." : "To'liq to'lov uchun rahmat!"}
  </div>
</div>
<script>window.addEventListener('load',()=>setTimeout(()=>{window.print();setTimeout(()=>window.close(),300);},150));</script>
</body></html>`;
  const win = window.open("", "_blank", "width=380,height=600");
  if (!win) {
    toast("Pop-up blokirovkalangan — chekni chop etib bo'lmaydi", "error");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// =========================================
// FORM 3: Tasdiqlash (delete / cancel / clear)
// =========================================
function showConfirmForm(title, message, subMessage, onConfirm, dangerLevel) {
  const html = `
    <div id="formMessage"></div>
    <div style="padding:18px 12px;text-align:center">
      <div style="font-size:48px;margin-bottom:10px">${dangerLevel === "danger" ? "⚠️" : "❓"}</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:6px">${escapeHtml(message)}</div>
      <div style="font-size:12px;color:var(--text-muted)">${escapeHtml(subMessage || "")}</div>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("confirmNo")}</button>
      <button type="button" class="btn ${dangerLevel === "danger" ? "btn-danger" : "btn-primary"}" id="formConfirmBtn">${t("confirmYes")}</button>
    </div>`;
  const body = openFormModal(title, "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("formConfirmBtn").addEventListener("click", async () => {
    const btn = byId("formConfirmBtn");
    const msg = byId("formMessage");
    btn.disabled = true;
    btn.textContent = t("saving");
    try {
      await onConfirm();
      toast(t("successDeleted"), "success");
      closeFormModal();
      loadData();
      const overlay = byId("modalOverlay");
      if (overlay && !overlay.hidden) closeModal();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      btn.disabled = false;
      btn.textContent = t("confirmYes");
    }
  });
}

function showDeleteDebtConfirm(debtId, clientName) {
  showConfirmForm(
    t("actionDelete"),
    t("confirmDelete"),
    t("confirmDeleteSub") + " (" + clientName + ")",
    async () => { await deleteJson(`/api/debts/${debtId}?asUser=${state.viewerId}`); },
    "danger",
  );
}

function showCancelDebtConfirm(debtId, clientName) {
  showConfirmForm(
    t("actionCancel"),
    t("confirmCancel"),
    t("confirmCancelSub") + " (" + clientName + ")",
    async () => { await postJson(`/api/debts/${debtId}/soft-delete?asUser=${state.viewerId}`, {}); },
    "warning",
  );
}

// =========================================
// FORM 6: Qarzni tahrirlash
// =========================================
function showEditDebtForm(debt) {
  const today = todayInput();
  const isUnknown = isUnknownDate(debt.dueDate);
  const dueValue = isUnknown ? "" : (() => {
    const d = new Date(debt.dueDate);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();
  const borrowedValue = (() => {
    const d = new Date(debt.borrowedDate);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();

  const html = `
    <form id="editDebtForm">
      <div id="formMessage"></div>
      <div style="background:var(--bg-soft);padding:10px;border-radius:8px;margin-bottom:14px;font-size:12px">
        👤 <b>${escapeHtml(debt.client)}</b> — ${escapeHtml(debt.clientPhone || "")}
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("formItemType")}</label>
          <select class="form-select" name="itemType">
            <option value="playstation" ${debt.itemType === "playstation" ? "selected" : ""}>🎮 PlayStation</option>
            <option value="computer" ${debt.itemType === "computer" ? "selected" : ""}>💻 Kompyuter</option>
            <option value="billiard" ${debt.itemType === "billiard" ? "selected" : ""}>🎱 Bilyard</option>
            <option value="other" ${debt.itemType === "other" ? "selected" : ""}>📦 Boshqa</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t("formAmount")}</label>
          <div style="display:flex;gap:6px">
            <button type="button" class="btn btn-secondary" id="amountMinus" style="flex:0 0 46px;padding:8px;font-size:18px">−</button>
            <input class="form-input" name="amount" id="amountInput" type="number" min="1000" step="500" value="${debt.amount}" required style="flex:1;text-align:center" />
            <button type="button" class="btn btn-secondary" id="amountPlus" style="flex:0 0 46px;padding:8px;font-size:18px">+</button>
          </div>
          <div class="form-hint">
            Boshlang'ich: ${fmtMoney(debt.amount)} • To'langan: ${fmtMoney(debt.paidAmount)}<br>
            <b>+/-</b> tugmalari 5000 so'mga oshiradi/kamaytiradi
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${t("formItemDetails")}</label>
        <input class="form-input" name="itemDetails" type="text" value="${escapeHtml(debt.itemDetails || "")}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("formBorrowedDate")}</label>
          <input class="form-input" name="borrowedDate" type="date" value="${borrowedValue}" required />
        </div>
        <div class="form-group">
          <label class="form-label">${t("formDueDate")}</label>
          <input class="form-input" name="dueDate" type="date" value="${dueValue}" id="editDue" ${isUnknown ? "disabled" : ""} />
          <label class="form-checkbox" style="margin-top:6px">
            <input type="checkbox" name="dueDateUnknown" id="editDueUnknown" ${isUnknown ? "checked" : ""} />
            ${t("formDueUnknown")}
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${t("formNotes")}</label>
        <textarea class="form-textarea" name="notes">${escapeHtml(debt.notes || "")}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
      </div>
    </form>`;

  const body = openFormModal(t("editDebtTitle"), debt.client, html);
  if (!body) return;

  const dueChk = byId("editDueUnknown");
  const dueInput = byId("editDue");
  dueChk.addEventListener("change", () => {
    dueInput.disabled = dueChk.checked;
    if (dueChk.checked) dueInput.value = "";
  });

  // +/- tugmalari (5000 so'm qadam)
  const amtInput = byId("amountInput");
  byId("amountPlus").addEventListener("click", () => {
    const v = Number(amtInput.value || 0);
    amtInput.value = String(v + 5000);
  });
  byId("amountMinus").addEventListener("click", () => {
    const v = Number(amtInput.value || 0);
    amtInput.value = String(Math.max(1000, v - 5000));
  });

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("editDebtForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      const dueUnknown = !!fd.get("dueDateUnknown");
      const payload = {
        itemType: String(fd.get("itemType")),
        itemDetails: String(fd.get("itemDetails") || "") || null,
        amount: Number(fd.get("amount")),
        borrowedDate: String(fd.get("borrowedDate")),
        dueDate: dueUnknown ? null : String(fd.get("dueDate")),
        dueDateUnknown: dueUnknown,
        notes: String(fd.get("notes") || "") || null,
      };
      const res = await fetch(`/api/debts/${debt.id}?asUser=${state.viewerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      toast(t("successEdited"), "success");
      closeFormModal();
      loadData();
      const overlay = byId("modalOverlay");
      if (overlay && !overlay.hidden) closeModal();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

function showClearDataConfirm() {
  showConfirmForm(
    t("clearAllData"),
    t("confirmClear"),
    t("confirmClearSub"),
    async () => { await postJson(`/api/admin/clear-data?asUser=${state.viewerId}`, {}); },
    "danger",
  );
}

// =========================================
// FORM 4: Filiallarni boshqarish
// =========================================
async function showBranchesForm() {
  let branches = [];
  try {
    branches = await api(`/api/branches/full?asUser=${state.viewerId}`);
  } catch (err) {
    branches = state.data?.branches || [];
  }
  const html = `
    <div id="formMessage"></div>
    <button type="button" class="btn btn-success" id="addBranchBtn" style="width:auto;padding:8px 16px;margin-bottom:14px">
      ➕ ${t("branchAdd")}
    </button>
    <div id="branchesList">
      ${branches.map((b) => `
        <div class="item-card" data-branch-id="${b.id}">
          <div class="item-card-head">
            <div style="flex:1">
              <div class="item-card-title">${escapeHtml(b.name)}</div>
              <div class="item-card-meta">
                <span>👥 ${fmtNumber(b.clientsCount)} ${t("clients").toLowerCase()}</span>
                <span>📦 ${fmtNumber(b.debtsCount)} ${t("debts").toLowerCase()}</span>
                <span>💵 ${fmtNumber(b.paymentsCount)} ${t("payments").toLowerCase()}</span>
              </div>
            </div>
          </div>
          <div class="debt-actions">
            <button type="button" class="action-btn" data-edit-branch="${b.id}" data-name="${escapeHtml(b.name)}">✏️ ${t("branchEdit")}</button>
            <button type="button" class="action-btn danger" data-delete-branch="${b.id}" data-name="${escapeHtml(b.name)}">🗑️ ${t("branchDelete")}</button>
          </div>
        </div>
      `).join("")}
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("close")}</button>
    </div>`;
  const body = openFormModal(t("branchesTitle"), "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("addBranchBtn").addEventListener("click", () => showBranchEditForm(null));
  body.querySelectorAll("[data-edit-branch]").forEach((btn) => {
    btn.addEventListener("click", () => showBranchEditForm(Number(btn.dataset.editBranch)));
  });
  body.querySelectorAll("[data-delete-branch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.deleteBranch);
      const name = btn.dataset.name;
      showConfirmForm(
        t("branchDelete") + ": " + name,
        t("confirmBranchDelete"),
        t("confirmBranchDeleteSub"),
        async () => {
          const r = await deleteJson(`/api/branches/${id}`);
          if (r.mode === "deleted") {
            toast(t("branchDeleted"), "success");
            // Avtomatik showBranchesForm — closeFormModal ekvivalenti showConfirmForm ichida bor
            setTimeout(() => showBranchesForm(), 50);
            return;
          }
          // Soft-delete bo'ldi — ikkinchi tasdiq: butunlay o'chirish?
          const counts = r.counts || {};
          const detail = `${counts.users || 0} admin, ${counts.clients || 0} mijoz, ${counts.debts || 0} qarz mavjud.`;
          setTimeout(() => {
            showConfirmForm(
              "⚠️ Butunlay o'chirish?",
              `${name} faolsizlantirildi.`,
              `${detail} Butunlay o'chirsangiz, mijozlar/qarzlar/to'lovlar BUTUNLAY YO'QOLADI. Bu amal qaytarib bo'lmaydi.`,
              async () => {
                await deleteJson(`/api/branches/${id}?force=1`);
                toast("Filial butunlay o'chirildi", "success");
                setTimeout(() => showBranchesForm(), 50);
              },
              "danger",
            );
          }, 100);
        },
        "danger",
      );
    });
  });
}

async function showBranchEditForm(branchId) {
  // Tahrirlash uchun to'liq ma'lumotni alohida olish — stats faqat name beradi
  let branch = null;
  let isEdit = !!branchId;
  if (branchId) {
    try {
      const all = await api(`/api/branches/full?asUser=${state.viewerId}`).catch(() => null);
      if (Array.isArray(all)) branch = all.find((b) => b.id === branchId);
    } catch {}
    if (!branch) branch = (state.data?.branches || []).find((b) => b.id === branchId);
  }
  const html = `
    <form id="branchForm">
      <div id="formMessage"></div>
      <div class="form-group">
        <label class="form-label">${t("branchName")}</label>
        <input class="form-input" name="name" type="text" required value="${branch ? escapeHtml(branch.name) : ""}" placeholder="Markaziy filial" />
      </div>
      <div class="form-group">
        <label class="form-label">${t("branchAddress")}</label>
        <input class="form-input" name="address" type="text" value="${branch?.address ? escapeHtml(branch.address) : ""}" placeholder="Toshkent shahri..." />
      </div>
      <div class="form-group">
        <label class="form-label">${t("branchPhone")}</label>
        <input class="form-input" name="phone" type="tel" value="${branch?.phone ? escapeHtml(branch.phone) : ""}" placeholder="+998 71 200 10 10" />
      </div>
      ${isEdit ? `
        <div class="form-group">
          <label class="form-checkbox" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:10px">
            <input type="checkbox" name="isActive" ${(branch?.isActive ?? true) ? "checked" : ""} />
            <span>Faol holatda</span>
          </label>
        </div>` : ""}
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
      </div>
    </form>`;
  const body = openFormModal(isEdit ? `${t("branchEdit")}: ${branch.name}` : t("branchAdd"), "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", () => showBranchesForm());
  byId("branchForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      const payload = {
        name: String(fd.get("name") || "").trim(),
        address: String(fd.get("address") || "").trim() || null,
        phone: String(fd.get("phone") || "").trim() || null,
      };
      if (isEdit) payload.isActive = !!fd.get("isActive");
      if (isEdit) {
        await fetch(`/api/branches/${branchId}?asUser=${state.viewerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((r) => r.json()).then((d) => { if (d.error) throw new Error(d.error); });
      } else {
        await postJson(`/api/branches?asUser=${state.viewerId}`, payload);
      }
      toast(t("successSaved"), "success");
      closeFormModal();
      loadData();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

// =========================================
// FORM 5: Adminlarni boshqarish (ruxsatlar + Telegram)
// =========================================
async function showAdminsForm(showInactive = false) {
  let admins = [];
  try {
    admins = await api(`/api/admins${showInactive ? "?showInactive=1" : ""}`);
  } catch (err) {
    toast(err.message, "error");
    return;
  }

  const html = `
    <div id="formMessage"></div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
      <button type="button" class="btn btn-success" id="addAdminBtn" style="width:auto;padding:8px 16px">
        ➕ Yangi admin qo'shish
      </button>
      <label class="form-checkbox" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px">
        <input type="checkbox" id="showInactiveAdmins" ${showInactive ? "checked" : ""} />
        <span>⛔ Faolsizlarni ko'rsatish</span>
      </label>
    </div>
    <div id="adminsList">
      ${admins.map((a) => {
        const isOwnerRow = a.role === "owner";
        const roleBadge = isOwnerRow
          ? `<span class="badge" style="background:var(--primary);color:#fff">👑 ${t("roleOwner")}</span>`
          : `<span class="badge">${t("roleAdmin")}</span>`;
        return `
        <div class="item-card" data-admin-id="${a.id}">
          <div class="item-card-head">
            <div style="flex:1">
              <div class="item-card-title">${escapeHtml(a.fullName)} (@${escapeHtml(a.username)}) ${roleBadge}</div>
              <div class="item-card-meta">
                ${isOwnerRow ? `<span>🏢 ${t("allBranches")}</span>` : `<span>🏢 ${escapeHtml(a.branchName || "—")}</span>`}
                <span>${a.isActive ? "✅ Faol" : "⛔ Faolsiz"}</span>
                <span>📱 ${a.telegramId ? `${t("linked")} (${a.telegramUsername || a.telegramId})` : t("notLinked")}</span>
              </div>
            </div>
          </div>
          <div class="debt-actions">
            <button type="button" class="action-btn" data-edit-admin="${a.id}">✏️ ${t("clientEdit")}</button>
            ${isOwnerRow ? "" : `<button type="button" class="action-btn" data-edit-perms="${a.id}" data-name="${escapeHtml(a.fullName)}">🔐 ${t("adminPerms")}</button>`}
            <button type="button" class="action-btn success" data-tg-link="${a.id}" data-name="${escapeHtml(a.fullName)}">📱 ${t("adminTelegram")}</button>
            ${a.telegramId ? `<button type="button" class="action-btn danger" data-tg-unlink="${a.id}">${t("telegramUnlink")}</button>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("close")}</button>
    </div>`;
  const body = openFormModal(t("adminsTitle"), "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("addAdminBtn").addEventListener("click", () => showAddAdminForm());
  const inactiveChk = byId("showInactiveAdmins");
  if (inactiveChk) {
    inactiveChk.addEventListener("change", () => showAdminsForm(inactiveChk.checked));
  }

  body.querySelectorAll("[data-edit-admin]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.editAdmin);
      const ad = admins.find((x) => x.id === id);
      if (ad) showEditAdminForm(id, ad);
    });
  });
  body.querySelectorAll("[data-edit-perms]").forEach((btn) => {
    btn.addEventListener("click", () => showPermissionsForm(Number(btn.dataset.editPerms), btn.dataset.name));
  });
  body.querySelectorAll("[data-tg-link]").forEach((btn) => {
    btn.addEventListener("click", () => showTelegramLinkForm(Number(btn.dataset.tgLink), btn.dataset.name));
  });
  body.querySelectorAll("[data-tg-unlink]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await postJson(`/api/admins/${btn.dataset.tgUnlink}/telegram-unlink?asUser=${state.viewerId}`, {});
        toast(t("successSaved"), "success");
        showAdminsForm();
      } catch (err) {
        toast(err.message, "error");
      }
    });
  });
}

async function showAddAdminForm() {
  const branches = state.allBranches || state.data?.branches || [];
  const html = `
    <form id="addAdminForm">
      <div id="formMessage"></div>
      <div class="form-group">
        <label class="form-label">Ism familiya</label>
        <input class="form-input" name="fullName" type="text" required placeholder="Aliyev Sanjar" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="form-input" name="username" type="text" required pattern="[a-z0-9_]+" placeholder="admin3" />
          <div class="form-hint">faqat kichik harf, raqam, _</div>
        </div>
        <div class="form-group">
          <label class="form-label">Parol</label>
          <input class="form-input" name="password" type="text" required minlength="6" placeholder="parol123" />
          <div class="form-hint">kamida 6 belgi</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Filial</label>
        <select class="form-select" name="branchId" required>
          <option value="">— tanlang —</option>
          ${branches.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
      </div>
    </form>`;

  const body = openFormModal("➕ Yangi admin", "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", () => showAdminsForm());
  byId("addAdminForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      await postJson(`/api/admins?asUser=${state.viewerId}`, {
        username: String(fd.get("username")).trim(),
        password: String(fd.get("password")),
        fullName: String(fd.get("fullName")).trim(),
        branchId: Number(fd.get("branchId")),
      });
      toast(t("successSaved"), "success");
      showAdminsForm();
      // Profillarni qayta yuklash
      loadProfiles().then(() => loadData());
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

async function showPermissionsForm(adminId, adminName) {
  let perms;
  try {
    perms = await api(`/api/admins/${adminId}/permissions?asUser=${state.viewerId}`);
  } catch (err) {
    toast(err.message, "error"); return;
  }

  const checks = [
    { key: "canAddDebt", label: t("permAddDebt") },
    { key: "canEditDebt", label: t("permEditDebt") },
    { key: "canRecordPayment", label: t("permRecordPayment") },
    { key: "canCancelDebt", label: t("permCancelDebt") },
    { key: "canAddClient", label: t("permAddClient") },
  ];

  const html = `
    <form id="permsForm">
      <div id="formMessage"></div>
      <div class="form-group">
        ${checks.map((c) => `
          <label class="form-checkbox" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
            <input type="checkbox" name="${c.key}" ${perms[c.key] ? "checked" : ""} />
            <span>${c.label}</span>
          </label>
        `).join("")}
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success">💾 ${t("formSave")}</button>
      </div>
    </form>`;

  const body = openFormModal(`${t("adminPerms")}: ${adminName}`, "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", () => showAdminsForm());
  byId("permsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      canAddDebt: !!fd.get("canAddDebt"),
      canEditDebt: !!fd.get("canEditDebt"),
      canRecordPayment: !!fd.get("canRecordPayment"),
      canCancelDebt: !!fd.get("canCancelDebt"),
      canAddClient: !!fd.get("canAddClient"),
    };
    try {
      await fetch(`/api/admins/${adminId}/permissions?asUser=${state.viewerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json()).then((d) => { if (d.error) throw new Error(d.error); });
      toast(t("successSaved"), "success");
      showAdminsForm();
    } catch (err) {
      toast(err.message, "error");
    }
  });
}

// =========================================
// Qarzdorlar ro'yxati — ketma-ket varaqlar
// =========================================
async function showDebtorsList() {
  const body = openModal("👥 " + t("debtors"), t("loading"));
  if (!body) return;

  try {
    const data = await api(`/api/debtors?${buildScopeQuery()}`);
    const items = data.items || [];

    let summary = `
      <div class="modal-summary">
        <div><span class="label">${t("summaryCount")}</span><span class="value">${fmtNumber(data.total)}</span></div>
        <div><span class="label">${t("totalRemaining")}</span><span class="value" style="color:var(--warning)">${fmtMoney(data.totalRemaining)}</span></div>
      </div>`;

    if (items.length === 0) {
      body.innerHTML = summary + `<div class="empty-state">${t("noData")}</div>`;
      return;
    }

    body.innerHTML = summary + items.map((c, idx) => {
      const overdue = c.hasOverdue ? "🔴" : c.activeDebtsCount > 0 ? "🟡" : "🟢";
      const daysFromOldest = c.oldestActiveDate
        ? Math.floor((Date.now() - new Date(c.oldestActiveDate).getTime()) / (24 * 60 * 60 * 1000))
        : 0;
      return `
        <div class="item-card clickable" data-client-id="${c.id}">
          <div class="item-card-head">
            <div style="flex:1;min-width:0">
              <div class="item-card-title">
                <span style="font-size:14px;color:var(--text-muted);font-weight:500">#${idx + 1}</span>
                <span>${overdue}</span>
                <span class="client-link" data-client-id="${c.id}" style="color:var(--primary);cursor:pointer">👤 ${escapeHtml(c.name)}</span>
              </div>
              <div class="item-card-meta">
                <span>📞 ${escapeHtml(c.phone)}</span>
                <span>🏢 ${escapeHtml(c.branch)}</span>
                <span>📦 ${c.activeDebtsCount} ${t("debts").toLowerCase()}</span>
                ${daysFromOldest > 0 ? `<span>⏱️ ${daysFromOldest} kun</span>` : ""}
                ${c.lastPaymentDate ? `<span>💵 ${fmtDate(c.lastPaymentDate)}</span>` : ""}
              </div>
              ${c.notes ? `<div class="sub-item-meta" style="margin-top:6px">💬 ${escapeHtml(c.notes)}</div>` : ""}
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div class="item-card-amount ${c.hasOverdue ? "danger" : "warning"}">${fmtMoney(c.totalRemaining)}</div>
              <div class="sub-item-meta">jami: ${fmtMoney(c.totalDebt)}</div>
              <div class="sub-item-meta" style="color:var(--success)">to'langan: ${fmtMoney(c.totalPaid)}</div>
            </div>
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    body.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
  }
}

// =========================================
// FORM 7: Audit log viewer (owner)
// =========================================
async function showAuditLogViewer() {
  const today = todayInput();
  const weekAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();

  let admins = [];
  let branches = state.data?.branches || [];
  try {
    admins = await api(`/api/admins?asUser=${state.viewerId}`);
  } catch {}

  const html = `
    <form id="auditFilterForm">
      <div id="formMessage"></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("auditFromDate")}</label>
          <input class="form-input" name="from" type="date" value="${weekAgo}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t("auditToDate")}</label>
          <input class="form-input" name="to" type="date" value="${today}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("auditUser")}</label>
          <select class="form-select" name="userId">
            <option value="">${t("auditAllUsers")}</option>
            ${admins.map((a) => `<option value="${a.id}">${escapeHtml(a.fullName)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t("auditAction")}</label>
          <select class="form-select" name="action">
            <option value="">${t("auditAllActions")}</option>
            <option value="create">${t("actionCreate")}</option>
            <option value="update">${t("actionUpdate")}</option>
            <option value="payment">${t("actionPayment")}</option>
            <option value="soft_delete">${t("actionSoft_delete")}</option>
            <option value="restore">${t("actionRestore")}</option>
            <option value="delete">${t("actionDelete")}</option>
            <option value="login">${t("actionLogin")}</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("auditTable")}</label>
          <select class="form-select" name="tableName">
            <option value="">${t("allTables")}</option>
            <option value="Branch">${t("tableBranch")}</option>
            <option value="User">${t("tableUser")}</option>
            <option value="Client">${t("tableClient")}</option>
            <option value="Debt">${t("tableDebt")}</option>
            <option value="Payment">${t("tablePayment")}</option>
            <option value="AppSetting">⚙️ Sozlamalar</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t("branch")}</label>
          <select class="form-select" name="branchId">
            <option value="">${t("allBranches")}</option>
            ${branches.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("close")}</button>
        <button type="submit" class="btn btn-primary">🔍 ${t("auditApply")}</button>
      </div>
    </form>
    <div id="auditResults" style="margin-top:18px"></div>`;

  const body = openFormModal(t("auditLogTitle2"), "", html);
  if (!body) return;

  const resultsBox = byId("auditResults");
  const form = byId("auditFilterForm");

  byId("formCancelBtn").addEventListener("click", closeFormModal);

  async function runQuery() {
    resultsBox.innerHTML = `<div class="modal-loading">⏳ ${t("loading")}</div>`;
    const fd = new FormData(form);
    const params = new URLSearchParams();
    params.set("asUser", String(state.viewerId));
    if (fd.get("from")) params.set("from", String(fd.get("from")));
    if (fd.get("to")) params.set("to", String(fd.get("to")));
    if (fd.get("userId")) params.set("userId", String(fd.get("userId")));
    if (fd.get("action")) params.set("action", String(fd.get("action")));
    if (fd.get("tableName")) params.set("tableName", String(fd.get("tableName")));
    if (fd.get("branchId")) params.set("branchId", String(fd.get("branchId")));
    try {
      const logs = await api(`/api/audit-logs?${params}`);
      if (logs.length === 0) {
        resultsBox.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
        return;
      }
      resultsBox.innerHTML = `
        <div class="sub-section-title" style="margin-bottom:10px">${logs.length} ta yozuv</div>
        ${logs.map((l) => `
          <div class="audit-row">
            <div class="audit-dot" style="background:${auditColor(l.action)}"></div>
            <div class="audit-info">
              <div><b>${escapeHtml(l.user)}</b> ${escapeHtml(t(actionKey(l.action)))} ${escapeHtml(tableLabel(l.tableName))} #${l.recordId}${l.branch ? ` <span class="muted">— ${escapeHtml(l.branch)}</span>` : ""}</div>
              <div class="sub-item-meta">${fmtDateTime(l.createdAt)}${l.ipAddress ? " • IP: " + escapeHtml(l.ipAddress) : ""}</div>
              ${l.newValue ? `<div class="sub-item-meta" style="margin-top:3px">📝 ${escapeHtml(truncate(l.newValue, 200))}</div>` : ""}
            </div>
          </div>
        `).join("")}`;
    } catch (err) {
      resultsBox.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
    }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); runQuery(); });
  runQuery();
}

// =========================================
// FORM 8: Oylik hisobot (owner)
// =========================================
async function showMonthlyReport() {
  const now = new Date();
  const html = `
    <form id="reportForm">
      <div id="formMessage"></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Yil</label>
          <input class="form-input" name="year" type="number" value="${now.getFullYear()}" min="2020" max="2099" />
        </div>
        <div class="form-group">
          <label class="form-label">Oy</label>
          <select class="form-select" name="month">
            ${["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"].map((m, i) =>
              `<option value="${i+1}" ${i === now.getMonth() ? "selected" : ""}>${m}</option>`,
            ).join("")}
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("close")}</button>
        <button type="submit" class="btn btn-primary">📊 ${t("showReport")}</button>
      </div>
    </form>
    <div id="reportResults" style="margin-top:18px"></div>`;

  const body = openFormModal(t("monthlyReport"), "", html);
  if (!body) return;

  const results = byId("reportResults");
  const form = byId("reportForm");
  byId("formCancelBtn").addEventListener("click", closeFormModal);

  async function runReport() {
    results.innerHTML = `<div class="modal-loading">⏳ ${t("loading")}</div>`;
    const fd = new FormData(form);
    const year = fd.get("year");
    const month = fd.get("month");
    try {
      const r = await api(`/api/reports/monthly?asUser=${state.viewerId}&year=${year}&month=${month}`);
      results.innerHTML = `
        <div class="modal-summary">
          <div><span class="label">Qarzlar soni</span><span class="value">${fmtNumber(r.summary.debtsCount)}</span></div>
          <div><span class="label">Qarz summasi</span><span class="value">${fmtMoney(r.summary.totalDebtAdded)}</span></div>
          <div><span class="label">To'lov soni</span><span class="value">${fmtNumber(r.summary.paymentsCount)}</span></div>
          <div><span class="label">To'langan jami</span><span class="value" style="color:var(--success)">${fmtMoney(r.summary.totalPaid)}</span></div>
          <div><span class="label">${t("methodCash")}</span><span class="value">${fmtMoney(r.summary.cashTotal)}</span></div>
          <div><span class="label">${t("methodCard")}</span><span class="value">${fmtMoney(r.summary.cardTotal)}</span></div>
          <div><span class="label">${t("methodTransfer")}</span><span class="value">${fmtMoney(r.summary.transferTotal)}</span></div>
        </div>
        <div class="sub-section">
          <div class="sub-section-title">🏢 ${t("branches")} bo'yicha</div>
          ${r.byBranch.map((b) => `
            <div class="sub-item">
              <div><b>${escapeHtml(b.name)}</b><div class="sub-item-meta">${b.debtsCount} qarz • ${b.paymentsCount} to'lov</div></div>
              <div style="text-align:right;font-weight:700">
                <div>+${fmtMoney(b.debtsAmount)}</div>
                <div style="color:var(--success)">${fmtMoney(b.paymentsAmount)}</div>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="sub-section">
          <div class="sub-section-title">👥 Adminlar samaradorligi</div>
          ${r.byAdmin.map((a) => `
            <div class="sub-item">
              <div><b>${escapeHtml(a.name)}</b><div class="sub-item-meta">${a.debtsCount} qarz qo'shgan • ${a.paymentsCount} to'lov yozgan</div></div>
              <div style="text-align:right;font-weight:700">
                <div>+${fmtMoney(a.debtsAmount)}</div>
                <div style="color:var(--success)">${fmtMoney(a.paymentsAmount)}</div>
              </div>
            </div>
          `).join("")}
        </div>`;
    } catch (err) {
      results.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
    }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); runReport(); });
  runReport();
}

// =========================================
// FORM 9: Tizim sozlamalari (logo, nom, ranglar)
// =========================================
async function showSettingsForm() {
  let s = state.settings;
  if (!s) {
    try { s = await api("/api/settings"); state.settings = s; } catch (err) { toast(err.message, "error"); return; }
  }

  const logoVal = s.logo?.value || "🎮";
  const isImage = s.logo?.type === "image" || (logoVal && logoVal.startsWith("data:image"));
  const previewHtml = isImage
    ? `<img src="${escapeHtml(logoVal)}" alt="logo" style="width:64px;height:64px;border-radius:14px;object-fit:cover;border:1px solid var(--border)" />`
    : `<div style="width:64px;height:64px;border-radius:14px;background:var(--primary-soft);display:flex;align-items:center;justify-content:center;font-size:36px;border:1px solid var(--border)">${escapeHtml(logoVal)}</div>`;

  const html = `
    <form id="settingsForm">
      <div id="formMessage"></div>

      <div class="form-group">
        <label class="form-label">${t("settingsLogoPreview")}</label>
        <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg-soft);border-radius:12px">
          <div id="logoPreview">${previewHtml}</div>
          <div style="flex:1">
            <div style="font-weight:700">${escapeHtml(s.systemName?.value || "Game Zone Qarz")}</div>
            <div style="font-size:12px;color:var(--text-muted)">${escapeHtml(s.systemSubtitle?.value || "Boshqaruv tizimi")}</div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("settingsLogoUpload")}</label>
        <input class="form-input" type="file" id="logoFile" accept="image/png,image/jpeg,image/svg+xml,image/webp" />
        <div class="form-hint">PNG, JPG, SVG yoki WebP — max 2MB. Yuklangach saqlash tugmasini bosing.</div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("settingsLogoEmoji")}</label>
        <input class="form-input" name="logoEmoji" type="text" maxlength="4" placeholder="🎮" value="${isImage ? "" : escapeHtml(logoVal)}" />
        <div class="form-hint">${t("settingsLogoEmojiHint")}</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("settingsName")}</label>
          <input class="form-input" name="systemName" type="text" required value="${escapeHtml(s.systemName?.value || "")}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t("settingsSubtitle")}</label>
          <input class="form-input" name="systemSubtitle" type="text" value="${escapeHtml(s.systemSubtitle?.value || "")}" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("settingsColor")}</label>
          <input class="form-input" name="primaryColor" type="color" value="${escapeHtml(s.primaryColor?.value || "#6366f1")}" style="height:42px;cursor:pointer" />
        </div>
        <div class="form-group">
          <label class="form-label">${t("settingsOwnerLabel")}</label>
          <input class="form-input" name="ownerLabel" type="text" value="${escapeHtml(s.ownerLabel?.value || "")}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-checkbox" style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--bg-soft)">
          <input type="checkbox" name="twoFactorOwner" ${s.twoFactorOwner?.value === "1" ? "checked" : ""} />
          <div style="flex:1">
            <div style="font-weight:600">🔐 2FA — Telegram orqali tasdiqlash kodi</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">
              Yoqilganda owner login qilganda Telegram'ga 6 xonali kod yuboriladi (faqat owner Telegram'ga ulangan bo'lsa).
            </div>
          </div>
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
      </div>
    </form>`;

  const body = openFormModal(t("settingsTitle"), "", html);
  if (!body) return;

  let pendingLogoData = null;
  byId("logoFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast(t("settingsImageTooLarge"), "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      pendingLogoData = ev.target.result;
      byId("logoPreview").innerHTML = `<img src="${escapeHtml(pendingLogoData)}" alt="preview" style="width:64px;height:64px;border-radius:14px;object-fit:cover;border:1px solid var(--border)" />`;
    };
    reader.readAsDataURL(file);
  });

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      const payload = {
        systemName: String(fd.get("systemName") || "").trim(),
        systemSubtitle: String(fd.get("systemSubtitle") || "").trim(),
        primaryColor: String(fd.get("primaryColor") || "").trim(),
        ownerLabel: String(fd.get("ownerLabel") || "").trim(),
        twoFactorOwner: fd.get("twoFactorOwner") ? "1" : "0",
      };
      // Logo: agar fayl yuklangan bo'lsa, base64; yo'q bo'lsa emoji
      const emoji = String(fd.get("logoEmoji") || "").trim();
      if (pendingLogoData) payload.logo = pendingLogoData;
      else if (emoji) payload.logo = emoji;

      const res = await fetch("/api/settings?asUser=" + state.viewerId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      state.settings = data;
      applySettings();
      applyLang(); // yangi nomlarni qo'llash uchun
      toast(t("settingsSaved"), "success");
      closeFormModal();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

// =========================================
// FORM 10: Barcha mijozlar ro'yxati (owner va admin)
// =========================================
async function showAllClientsForm() {
  const isOwnerView = state.me?.role === "owner";
  const body = openModal("🧑‍🤝‍🧑 " + t("viewAllClients"), "");
  if (!body) return;
  try {
    const data = await api(`/api/clients/all`);
    const items = data.items || [];
    const subEl = byId("modalSub");
    if (subEl) subEl.textContent = `${items.length} ta mijoz`;

    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:8px;flex-wrap:wrap">
        <div class="modal-summary" style="margin:0;flex:1;min-width:240px">
          <div><span class="label">${t("summaryCount")}</span><span class="value">${fmtNumber(items.length)}</span></div>
          <div><span class="label">${t("totalRemaining")}</span><span class="value" style="color:var(--warning)">${fmtMoney(data.totalRemaining)}</span></div>
        </div>
        <input type="text" id="clientsLocalSearch" placeholder="🔍 Ism yoki telefon..." style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-soft);color:var(--text);font-size:13px;min-width:220px" />
      </div>
      <div id="clientsListContainer">
      ${items.length === 0
        ? `<div class="empty-state">${t("noData")}</div>`
        : items.map((c) => `
            <div class="item-card client-row" data-client-name="${escapeHtml(c.name).toLowerCase()}" data-client-phone="${escapeHtml(c.phone).toLowerCase()}">
              <div class="item-card-head">
                <div style="flex:1;min-width:0">
                  <div class="item-card-title">
                    <span class="client-link" data-client-id="${c.id}" style="color:var(--primary);cursor:pointer">👤 ${escapeHtml(c.name)}</span>
                    ${c.isBlacklisted ? '<span class="badge" style="background:var(--danger);color:#fff">⛔ Qora</span>' : ""}
                    ${c.activeDebtsCount > 0 ? `<span class="badge ${c.hasOverdue ? "overdue" : "active"}">${c.activeDebtsCount} faol qarz</span>` : '<span class="badge paid">✅ Qarzsiz</span>'}
                  </div>
                  <div class="item-card-meta">
                    <span>📞 ${escapeHtml(c.phone)}</span>
                    <span>🏢 ${escapeHtml(c.branch)}</span>
                    ${c.notes ? `<span>💬 ${escapeHtml(c.notes)}</span>` : ""}
                  </div>
                </div>
                <div style="text-align:right">
                  <div class="item-card-amount ${c.totalRemaining > 0 ? (c.hasOverdue ? "danger" : "warning") : "success"}">${fmtMoney(c.totalRemaining)}</div>
                </div>
              </div>
              <div class="debt-actions">
                ${c.isBlacklisted ? "" : `<button type="button" class="action-btn success" data-action="add-debt-for-client" data-client-id="${c.id}">➕ ${t("addDebt")}</button>`}
                <button type="button" class="action-btn" data-action="edit-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}" data-phone="${escapeHtml(c.phone)}" data-notes="${escapeHtml(c.notes || "")}">✏️ ${t("clientEdit")}</button>
                ${c.isBlacklisted
                  ? `<button type="button" class="action-btn success" data-action="unblacklist-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">✅ Ro'yxatdan chiqarish</button>`
                  : `<button type="button" class="action-btn danger" data-action="blacklist-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">⛔ Qora ro'yxatga</button>`}
                <button type="button" class="action-btn" data-action="soft-delete-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">👁️‍🗨️ ${t("clientDeleteSoft")}</button>
                ${isOwnerView ? `<button type="button" class="action-btn danger" data-action="hard-delete-client" data-client-id="${c.id}" data-name="${escapeHtml(c.name)}">🗑️ ${t("clientDeleteHard")}</button>` : ""}
              </div>
            </div>
          `).join("")}
      </div>`;

    // Mahalliy qidiruv (lokal filter — server'ga bormaydi)
    const localSearch = byId("clientsLocalSearch");
    if (localSearch) {
      localSearch.addEventListener("input", () => {
        const q = localSearch.value.trim().toLowerCase();
        body.querySelectorAll(".client-row").forEach((row) => {
          const name = row.dataset.clientName || "";
          const phone = row.dataset.clientPhone || "";
          row.style.display = (q === "" || name.includes(q) || phone.includes(q)) ? "" : "none";
        });
      });
    }
  } catch (err) {
    body.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
  }
}

// =========================================
// FORM 11: Mijozni tahrirlash
// =========================================
function showEditClientForm(clientId, name, phone, notes) {
  const html = `
    <form id="editClientForm">
      <div id="formMessage"></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("formName")}</label>
          <input class="form-input" name="name" type="text" required value="${escapeHtml(name)}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t("formPhone")}</label>
          <input class="form-input" name="phone" type="tel" required value="${escapeHtml(phone)}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">${t("formNotes")}</label>
        <textarea class="form-textarea" name="notes" placeholder="${t("formNotesPlaceholder")}">${escapeHtml(notes || "")}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
        <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
      </div>
    </form>`;
  const body = openFormModal(t("clientEdit") + " — " + name, "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", closeFormModal);
  byId("editClientForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      const payload = {
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        notes: String(fd.get("notes") || "").trim() || null,
      };
      const res = await fetch(`/api/clients/${clientId}?asUser=${state.viewerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      toast(t("successEdited"), "success");
      closeFormModal();
      loadData();
      const overlay = byId("modalOverlay");
      if (overlay && !overlay.hidden) closeModal();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

// =========================================
// FORM 12: Tizim holati (system info)
// =========================================
async function showSystemInfo() {
  const body = openModal("🩺 " + t("systemInfoTitle"), t("loading"));
  if (!body) return;
  try {
    const info = await api(`/api/system-info?asUser=${state.viewerId}`);
    const c = info.counts;
    const sizeMb = (info.dbSizeBytes / 1024 / 1024).toFixed(2);
    const uptimeMin = Math.floor(info.uptime / 60);
    const uptimeText = uptimeMin > 60 ? `${Math.floor(uptimeMin/60)}s ${uptimeMin%60}d` : `${uptimeMin} daqiqa`;
    body.innerHTML = `
      <div class="modal-summary">
        <div><span class="label">${t("branches")}</span><span class="value">${fmtNumber(c.branches)}</span></div>
        <div><span class="label">${t("users")}</span><span class="value">${fmtNumber(c.users)}</span></div>
        <div><span class="label">${t("clients")}</span><span class="value">${fmtNumber(c.clients)}</span></div>
        <div><span class="label">${t("debts")}</span><span class="value">${fmtNumber(c.debts)}</span></div>
        <div><span class="label">${t("payments")}</span><span class="value">${fmtNumber(c.payments)}</span></div>
        <div><span class="label">${t("auditEvents")}</span><span class="value">${fmtNumber(c.audits)}</span></div>
      </div>
      <div class="sub-section">
        <div class="sub-section-title">📊 Tizim</div>
        <div class="sub-item"><div><b>${t("systemDbSize")}</b></div><div style="font-weight:600">${sizeMb} MB</div></div>
        <div class="sub-item"><div><b>${t("systemUptime")}</b></div><div style="font-weight:600">${uptimeText}</div></div>
        <div class="sub-item"><div><b>Server vaqti</b></div><div style="font-weight:600">${fmtDateTime(info.now)}</div></div>
      </div>`;
  } catch (err) {
    body.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
  }
}

// =========================================
// FORM 13: Adminni tahrirlash (rename, parol, deactivate)
// =========================================
async function showEditAdminForm(adminId, adminData) {
  const branches = state.allBranches || state.data?.branches || [];
  const isOwnerTarget = adminData.role === "owner";
  const html = `
    <form id="editAdminForm">
      <div id="formMessage"></div>
      ${isOwnerTarget ? `<div class="admin-warn">👑 ${t("roleOwner")} profilini tahrirlamoqdasiz — filial va faol holati o'zgarmaydi</div>` : ""}
      <div class="form-group">
        <label class="form-label">Ism familiya</label>
        <input class="form-input" name="fullName" type="text" required value="${escapeHtml(adminData.fullName)}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">${t("adminUsername")}</label>
          <input class="form-input" name="username" type="text" required pattern="[a-zA-Z0-9_]+" value="${escapeHtml(adminData.username)}" />
        </div>
        ${isOwnerTarget ? "" : `
        <div class="form-group">
          <label class="form-label">Filial</label>
          <select class="form-select" name="branchId">
            <option value="">— filialsiz —</option>
            ${branches.map((b) => `<option value="${b.id}" ${b.id === adminData.branchId ? "selected" : ""}>${escapeHtml(b.name)}</option>`).join("")}
          </select>
        </div>
        `}
      </div>
      <div class="form-group">
        <label class="form-label">${t("adminPassword")}</label>
        <input class="form-input" name="password" type="text" minlength="6" placeholder="••••••" />
        <div class="form-hint">${t("adminPasswordHint")}</div>
      </div>
      ${isOwnerTarget ? "" : `
      <div class="form-group">
        <label class="form-checkbox" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border);border-radius:10px">
          <input type="checkbox" name="isActive" ${adminData.isActive ? "checked" : ""} />
          <span>Faol holatda</span>
        </label>
      </div>
      `}
      <div class="form-actions" style="justify-content:space-between">
        ${isOwnerTarget ? "<div></div>" : `<button type="button" class="btn btn-danger" id="deleteAdminBtn">🗑️ ${t("adminDelete")}</button>`}
        <div style="display:flex;gap:8px">
          <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("formCancel")}</button>
          <button type="submit" class="btn btn-success" id="formSubmitBtn">💾 ${t("formSave")}</button>
        </div>
      </div>
    </form>`;
  const body = openFormModal(t("adminEditTitle") + " — " + adminData.fullName, "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", () => showAdminsForm());
  const delBtn = byId("deleteAdminBtn");
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      showConfirmForm(
        t("adminDelete"),
        t("confirmAdminDelete"),
        t("confirmAdminDeleteSub") + " (" + adminData.fullName + ")",
        async () => {
          const r = await deleteJson(`/api/admins/${adminId}`);
          if (r.mode === "deleted") {
            toast("Admin butunlay o'chirildi", "success");
            setTimeout(() => { showAdminsForm(); loadProfiles(); }, 50);
            return;
          }
          // Soft-delete bo'ldi — 2-tasdiq
          const cnt = r.counts || {};
          const hasData = (cnt.createdDebts || 0) + (cnt.recordedPayments || 0) + (cnt.auditLogs || 0) > 0;
          if (!hasData) {
            // Ma'lumot yo'q edi — soft-delete ham yetarli, yoki force qilamiz
            toast("Admin faolsizlantirildi", "success");
            setTimeout(() => { showAdminsForm(); loadProfiles(); }, 50);
            return;
          }
          setTimeout(() => {
            showConfirmForm(
              "⚠️ Butunlay o'chirish?",
              `${adminData.fullName} faolsizlantirildi.`,
              `${cnt.createdDebts || 0} qarz, ${cnt.recordedPayments || 0} to'lov, ${cnt.auditLogs || 0} audit log mavjud. Butunlay o'chirsangiz, ma'lumotlar egaga o'tkaziladi va admin yozuvi yo'qoladi. Bu amal qaytarib bo'lmaydi.`,
              async () => {
                await deleteJson(`/api/admins/${adminId}?force=1`);
                toast("Admin butunlay o'chirildi", "success");
                setTimeout(() => { showAdminsForm(); loadProfiles(); }, 50);
              },
              "danger",
            );
          }, 100);
        },
        "danger",
      );
    });
  }

  byId("editAdminForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const submitBtn = byId("formSubmitBtn");
    const msg = byId("formMessage");
    msg.innerHTML = "";
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t("saving");
      const payload = {
        fullName: String(fd.get("fullName") || "").trim(),
        username: String(fd.get("username") || "").trim(),
      };
      if (!isOwnerTarget) {
        payload.branchId = fd.get("branchId") ? Number(fd.get("branchId")) : null;
        payload.isActive = !!fd.get("isActive");
      }
      const res = await fetch(`/api/admins/${adminId}?asUser=${state.viewerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      // Yangi parol kiritilgan bo'lsa, alohida endpoint
      const newPwd = String(fd.get("password") || "");
      if (newPwd.length >= 6) {
        const r2 = await fetch(`/api/admins/${adminId}/reset-password?asUser=${state.viewerId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPwd }),
        });
        if (!r2.ok) {
          const d2 = await r2.json().catch(() => ({}));
          throw new Error(d2.error || "Parol tiklanmadi");
        }
        toast(t("successPasswordReset"), "success");
      }
      toast(t("successSaved"), "success");
      showAdminsForm();
      loadProfiles();
    } catch (err) {
      msg.innerHTML = `<div class="form-error">⚠️ ${escapeHtml(err.message)}</div>`;
      toast(err.message, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "💾 " + t("formSave");
    }
  });
}

async function showTelegramLinkForm(adminId, adminName) {
  let codeData;
  try {
    codeData = await postJson(`/api/admins/${adminId}/telegram-code?asUser=${state.viewerId}`, {});
  } catch (err) {
    toast(err.message, "error"); return;
  }

  const html = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:14px;color:var(--text-muted);margin-bottom:8px">${escapeHtml(adminName)}</div>
      <div style="font-size:48px;font-weight:800;letter-spacing:0.1em;font-family:monospace;color:var(--primary);margin:14px 0;padding:18px;background:var(--primary-soft);border-radius:14px">
        ${codeData.code}
      </div>
      <div style="font-size:13px;color:var(--text);margin-bottom:6px">${t("telegramCopyHint")}</div>
      <div style="font-size:11px;color:var(--text-muted)">⏱️ ${t("codeExpires")}</div>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-primary" id="formCopyBtn">📋 Kodni nusxalash</button>
      <button type="button" class="btn btn-secondary" id="formCancelBtn">${t("close")}</button>
    </div>`;

  const body = openFormModal(t("telegramLinkCode"), "", html);
  if (!body) return;

  byId("formCancelBtn").addEventListener("click", () => showAdminsForm());
  byId("formCopyBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codeData.code);
      toast("Nusxalandi", "success");
    } catch {}
  });
}

// ====== EVENT DELEGATION (one global handler) =========================
document.addEventListener("click", (e) => {
  // 1) Stat card click -> filter modal
  const statCard = e.target.closest(".stat-card[data-filter]");
  if (statCard) {
    const f = statCard.dataset.filter;
    if (f) showFilterModal(f);
    return;
  }

  // 2) Status pill click -> status filter modal
  const pill = e.target.closest(".status-pill[data-status]");
  if (pill) {
    showFilterModal("status:" + pill.dataset.status);
    return;
  }

  // 3) Client link inside modal -> open client modal
  const clientLink = e.target.closest(".client-link[data-client-id]");
  if (clientLink) {
    e.stopPropagation();
    showClientModal(Number(clientLink.dataset.clientId));
    return;
  }

  // 4) Item card expand
  const expandBtn = e.target.closest("[data-expand-btn]");
  if (expandBtn) {
    e.stopPropagation();
    const card = expandBtn.closest(".item-card");
    if (card) {
      card.classList.toggle("expanded");
      expandBtn.textContent = card.classList.contains("expanded") ? t("collapse") : t("expand");
    }
    return;
  }
  const itemCard = e.target.closest(".item-card.clickable[data-expand]");
  if (itemCard && !e.target.closest("button, a, [data-action], .client-link, input, label, select, textarea")) {
    itemCard.classList.toggle("expanded");
    const btn = itemCard.querySelector("[data-expand-btn]");
    if (btn) btn.textContent = itemCard.classList.contains("expanded") ? t("collapse") : t("expand");
    return;
  }

  // 5) Top clients / recent rows -> client modal
  const clickableRow = e.target.closest("tr.clickable[data-client-id]");
  if (clickableRow) {
    showClientModal(Number(clickableRow.dataset.clientId));
    return;
  }

  // 6) Modal close button or overlay
  const closeBtn = e.target.closest("#modalClose");
  if (closeBtn) { closeModal(); return; }
  if (e.target.id === "modalOverlay") { closeModal(); return; }

  // 7) Profile button toggle
  const profBtn = e.target.closest("#profileBtn");
  if (profBtn) {
    e.stopPropagation();
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = !dd.hidden;
    return;
  }

  // 8) Profile dropdown item -> switch
  const profItem = e.target.closest(".dropdown-item[data-profile-id]");
  if (profItem) {
    const id = Number(profItem.dataset.profileId);
    if (id && id !== state.viewerId) {
      state.viewerId = id;
      localStorage.setItem("viewerId", String(id));
      // Profil o'zgarganda owner'ning filial filtri qoldiqlari tozalanadi
      const newProf = state.profiles.find((p) => p.id === id);
      if (newProf && newProf.role !== "owner") {
        state.branchId = null;
        localStorage.removeItem("branchId");
      }
      const dd = byId("profileDropdown");
      if (dd) dd.hidden = true;
      loadData();
    }
    return;
  }

  // 9) Click outside profile dropdown -> close
  const sw = byId("profileSwitcher");
  if (sw && !sw.contains(e.target)) {
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = true;
  }

  // 10) Lang button
  const langBtn = e.target.closest(".lang-btn[data-lang]");
  if (langBtn) {
    state.lang = langBtn.dataset.lang;
    localStorage.setItem("lang", state.lang);
    applyLang();
    return;
  }

  // 11) Theme button
  const themeBtn = e.target.closest("#themeBtn");
  if (themeBtn) {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", state.theme);
    applyTheme();
    if (state.data) render(state.data);
    return;
  }

  // 12) "+ Yangi qarz" tugmasi
  const addBtn = e.target.closest("#addDebtBtn");
  if (addBtn) {
    showAddDebtForm();
    return;
  }

  // 13) Form modal close
  if (e.target.closest("#formClose") || e.target.id === "formOverlay") {
    // Profil tanlash ekrani majburiy — yopib bo'lmaydi (viewerId yo'q bo'lsa)
    if (!state.viewerId) return;
    closeFormModal();
    return;
  }

  // 14) Clear data (owner only)
  const clearBtn = e.target.closest("#clearDataBtn");
  if (clearBtn) {
    showClearDataConfirm();
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = true;
    return;
  }

  // 14a) Branches manage (owner)
  const brBtn = e.target.closest("#manageBranchesBtn");
  if (brBtn) {
    showBranchesForm();
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = true;
    return;
  }

  // 14b) Admins manage (owner)
  const adBtn = e.target.closest("#manageAdminsBtn");
  if (adBtn) {
    showAdminsForm();
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = true;
    return;
  }

  // 14c) Audit log viewer (owner)
  const auditBtn = e.target.closest("#auditLogBtn");
  if (auditBtn) {
    showAuditLogViewer();
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = true;
    return;
  }

  // 14d) Monthly report (owner)
  const repBtn = e.target.closest("#monthlyReportBtn");
  if (repBtn) {
    showMonthlyReport();
    const dd = byId("profileDropdown");
    if (dd) dd.hidden = true;
    return;
  }

  // 14e) Settings (owner)
  const setBtn = e.target.closest("#settingsBtn");
  if (setBtn) {
    showSettingsForm();
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    return;
  }

  // 14f) Manage clients (owner)
  const cliBtn = e.target.closest("#manageClientsBtn");
  if (cliBtn) {
    showAllClientsForm();
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    return;
  }

  // 14g) System info (owner)
  const sysBtn = e.target.closest("#systemInfoBtn");
  if (sysBtn) {
    showSystemInfo();
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    return;
  }

  // 14g-export) Eksport (Excel/PDF)
  const expBtn = e.target.closest("#exportBtn");
  if (expBtn) {
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    showExportForm();
    return;
  }

  // 14g-rem) Eslatma majburiy yuborish
  const remBtn = e.target.closest("#sendRemindersBtn");
  if (remBtn) {
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    showConfirmForm(
      "Eslatma yuborish",
      "Hozir Telegram orqali eslatma yuborilsinmi?",
      "Owner va telegram bog'langan adminlarga kechikkan/bugun/ertaga muddati tugaydigan qarzlar haqida xabar boradi.",
      async () => {
        try {
          const res = await fetch("/api/reminders/run-now", { method: "POST" });
          const d = await res.json();
          if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
          toast(`✅ ${d.debtsTouched} qarz, ${d.ownerSent} owner + ${d.adminsSent} admin'ga yuborildi`, "success");
          closeFormModal();
        } catch (err) {
          toast(`⚠️ ${err.message}`, "error");
        }
      },
      "primary",
    );
    return;
  }

  // 14g-backup) Backup yuklab olish
  const backupBtn = e.target.closest("#backupBtn");
  if (backupBtn) {
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    downloadBackup();
    return;
  }

  // 14g-restore) Restore — fayl yuklash
  const restoreBtn = e.target.closest("#restoreBtn");
  if (restoreBtn) {
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    showRestoreForm();
    return;
  }

  // 14h-blacklist) Mijozni qora ro'yxatga qo'shish
  const blBtn = e.target.closest("[data-action='blacklist-client']");
  if (blBtn) {
    e.stopPropagation();
    const id = Number(blBtn.dataset.clientId);
    const name = blBtn.dataset.name || "";
    showBlacklistForm(id, name);
    return;
  }
  const unblBtn = e.target.closest("[data-action='unblacklist-client']");
  if (unblBtn) {
    e.stopPropagation();
    const id = Number(unblBtn.dataset.clientId);
    const name = unblBtn.dataset.name || "";
    showConfirmForm(
      "Qora ro'yxatdan chiqarish",
      `${name}'ni qora ro'yxatdan chiqarish?`,
      "Mijozga yana qarz yozish mumkin bo'ladi.",
      async () => {
        await fetch(`/api/clients/${id}/blacklist`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blacklist: false }),
        });
        toast("Qora ro'yxatdan chiqarildi", "success");
        closeFormModal();
        showClientModal(id);
      },
      "success",
    );
    return;
  }

  // 14h) Logout — sessiyani tozalash va login formasiga qaytish
  const logoutBtn = e.target.closest("#logoutBtn");
  if (logoutBtn) {
    fetch("/api/logout", { method: "POST" }).catch(() => {});
    state.token = null;
    state.me = null;
    state.viewerId = null;
    state.branchId = null;
    state.data = null;
    localStorage.removeItem("token");
    localStorage.removeItem("viewerId");
    localStorage.removeItem("branchId");
    const dd = byId("profileDropdown"); if (dd) dd.hidden = true;
    showLoginForm();
    return;
  }

  // 15) "To'lov yozish" tugmasi (qarz kartasi ichida)
  const payBtn = e.target.closest("[data-action='pay-debt']");
  if (payBtn) {
    e.stopPropagation();
    showPaymentForm(
      Number(payBtn.dataset.debtId),
      payBtn.dataset.client || "",
      Number(payBtn.dataset.amount || 0),
      Number(payBtn.dataset.remaining || 0),
      payBtn.dataset.item || "",
    );
    return;
  }

  // 16) "Bekor qilish" (soft delete)
  const cancelBtn = e.target.closest("[data-action='cancel-debt']");
  if (cancelBtn) {
    e.stopPropagation();
    showCancelDebtConfirm(Number(cancelBtn.dataset.debtId), cancelBtn.dataset.client || "");
    return;
  }

  // 17) "O'chirish" (hard delete, owner only)
  const delBtn = e.target.closest("[data-action='delete-debt']");
  if (delBtn) {
    e.stopPropagation();
    showDeleteDebtConfirm(Number(delBtn.dataset.debtId), delBtn.dataset.client || "");
    return;
  }

  // 18) "Yangi qarz qo'shish" mijoz modalidan
  const addForClient = e.target.closest("[data-action='add-debt-for-client']");
  if (addForClient) {
    e.stopPropagation();
    closeModal();
    showAddDebtForm(Number(addForClient.dataset.clientId));
    return;
  }

  // 19) "Tahrirlash" tugmasi — API'dan to'liq ma'lumot olib chaqiramiz
  const editBtn = e.target.closest("[data-action='edit-debt']");
  if (editBtn) {
    e.stopPropagation();
    const debtId = Number(editBtn.dataset.debtId);
    api(`/api/debts/${debtId}?asUser=${state.viewerId}`)
      .then((debt) => showEditDebtForm(debt))
      .catch((err) => toast(err.message, "error"));
    return;
  }

  // 20) Bell button
  const bellBtn = e.target.closest("#bellBtn");
  if (bellBtn) {
    e.stopPropagation();
    const dd = byId("bellDropdown");
    if (dd) dd.hidden = !dd.hidden;
    return;
  }

  // 21) Bell dropdown — kutilmagan tashqarida bosish
  const bell = byId("bellDropdown");
  const bellTrigger = byId("bellBtn");
  if (bell && !bell.hidden && !bell.contains(e.target) && !bellTrigger?.contains(e.target)) {
    bell.hidden = true;
  }

  // 22) Bell item click → mijoz tarixi
  const bellItem = e.target.closest(".bell-item[data-client-id]");
  if (bellItem) {
    const id = Number(bellItem.dataset.clientId);
    if (id) {
      byId("bellDropdown").hidden = true;
      showClientModal(id);
    }
    return;
  }

  // 23) Urgent item click → mijoz tarixi
  const urgentItem = e.target.closest(".urgent-item[data-client-id]");
  if (urgentItem) {
    const id = Number(urgentItem.dataset.clientId);
    if (id) showClientModal(id);
    return;
  }

  // 24) Debtors button
  const debtorsBtn = e.target.closest("#debtorsBtn");
  if (debtorsBtn) {
    showDebtorsList();
    return;
  }

  // 24a) View clients button (header)
  const viewClientsBtn = e.target.closest("#viewClientsBtn");
  if (viewClientsBtn) {
    showAllClientsForm();
    return;
  }

  // 25) Mijozni tahrirlash
  const editClientBtn = e.target.closest("[data-action='edit-client']");
  if (editClientBtn) {
    e.stopPropagation();
    showEditClientForm(
      Number(editClientBtn.dataset.clientId),
      editClientBtn.dataset.name || "",
      editClientBtn.dataset.phone || "",
      editClientBtn.dataset.notes || "",
    );
    return;
  }

  // 26) Mijozni soft-delete (yashirish)
  const softDelClient = e.target.closest("[data-action='soft-delete-client']");
  if (softDelClient) {
    e.stopPropagation();
    const id = Number(softDelClient.dataset.clientId);
    const name = softDelClient.dataset.name || "";
    showConfirmForm(
      t("clientDeleteSoft") + " — " + name,
      t("confirmClientSoftDelete"),
      t("confirmClientSoftDeleteSub"),
      async () => { await postJson(`/api/clients/${id}/soft-delete?asUser=${state.viewerId}`, {}); },
      "warning",
    );
    return;
  }

  // 27) Mijozni hard-delete (faqat owner)
  const hardDelClient = e.target.closest("[data-action='hard-delete-client']");
  if (hardDelClient) {
    e.stopPropagation();
    const id = Number(hardDelClient.dataset.clientId);
    const name = hardDelClient.dataset.name || "";
    showConfirmForm(
      t("clientDeleteHard") + " — " + name,
      t("confirmClientDelete"),
      t("confirmClientDeleteSub"),
      async () => { await deleteJson(`/api/clients/${id}?asUser=${state.viewerId}`); },
      "danger",
    );
    return;
  }
});

// Branch filter dropdown change
document.addEventListener("change", (e) => {
  const sel = e.target.closest("#branchFilter");
  if (sel) {
    const v = sel.value;
    state.branchId = v ? Number(v) : null;
    if (state.branchId) localStorage.setItem("branchId", String(state.branchId));
    else localStorage.removeItem("branchId");
    loadData();
    return;
  }
});

// ====== MIJOZ QIDIRISH ================================================
let _searchTimer = null;
let _searchSeq = 0;
async function doClientSearch(q) {
  const results = byId("searchResults");
  if (!results) return;
  const trimmed = String(q || "").trim();
  if (trimmed.length < 2) {
    results.hidden = true;
    results.innerHTML = "";
    return;
  }
  const seq = ++_searchSeq;
  try {
    const data = await api(`/api/search/clients?q=${encodeURIComponent(trimmed)}`);
    if (seq !== _searchSeq) return; // eskirgan natija
    if (!Array.isArray(data) || data.length === 0) {
      results.innerHTML = `<div class="search-empty">Mijoz topilmadi</div>`;
    } else {
      results.innerHTML = data.map((c) => `
        <div class="search-result-item" data-search-client="${c.id}">
          <div class="search-result-name">
            👤 ${escapeHtml(c.name)}
            ${c.isBlacklisted ? '<span class="badge" style="background:var(--danger);color:#fff;font-size:9px">⛔ QORA</span>' : ""}
            ${c.hasOverdue ? '<span class="badge overdue" style="font-size:9px">⚠️ KECHIKKAN</span>' : ""}
          </div>
          <div class="search-result-meta">
            <span>📞 ${escapeHtml(c.phone)}</span>
            <span>🏢 ${escapeHtml(c.branch)}</span>
            <span>📦 ${c.debtsCount} qarz</span>
            ${c.totalRemaining > 0 ? `<span style="color:var(--warning);font-weight:600">💰 ${fmtMoney(c.totalRemaining)}</span>` : ""}
          </div>
        </div>
      `).join("");
    }
    results.hidden = false;
  } catch (err) {
    console.error("Search error:", err);
    results.innerHTML = `<div class="search-empty">⚠️ Xatolik: ${escapeHtml(err.message)}</div>`;
    results.hidden = false;
  }
}

document.addEventListener("input", (e) => {
  if (e.target.id !== "searchInput") return;
  const q = e.target.value;
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => doClientSearch(q), 250);
});

document.addEventListener("click", (e) => {
  // qidiruv natijasiga bosish — mijoz modalini ochish
  const item = e.target.closest("[data-search-client]");
  if (item) {
    const id = Number(item.dataset.searchClient);
    if (id) {
      byId("searchInput").value = "";
      byId("searchResults").hidden = true;
      showClientModal(id);
    }
    return;
  }
  // qidiruv qutisidan tashqariga bosish — natijalarni yashirish
  const box = byId("searchBox");
  if (box && !box.contains(e.target)) {
    const r = byId("searchResults");
    if (r) r.hidden = true;
  }
});

document.addEventListener("focusin", (e) => {
  if (e.target.id === "searchInput" && e.target.value.trim().length >= 2) {
    const r = byId("searchResults");
    if (r) r.hidden = false;
  }
});

// Esc — form modal yoki main modalni yopish
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const fo = byId("formOverlay");
  if (fo && !fo.hidden) {
    if (!state.viewerId) return; // Profil tanlash majburiy
    closeFormModal();
    return;
  }
});

// Esc to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const o = byId("modalOverlay");
    if (o && !o.hidden) closeModal();
  }
});

// ====== BOOT ==========================================================
(async () => {
  applyTheme();
  applyLang();
  tickTime();
  setInterval(tickTime, 1000);

  await loadSettings();

  // Token bor bo'lsa /api/me orqali tekshiramiz
  if (state.token) {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        state.me = await res.json();
        state.viewerId = state.me.id;
        localStorage.setItem("viewerId", String(state.me.id));
        await loadProfiles();
        await loadData();
      } else {
        // 401 fetch wrapper'i tomonidan handle qilingan
        state.token = null;
        localStorage.removeItem("token");
        showLoginForm();
      }
    } catch (err) {
      console.error("Auth tekshiruv xatoligi:", err);
      showLoginForm();
    }
  } else {
    showLoginForm();
  }

  setInterval(() => { if (state.token) loadData(); }, 30000);
  // Notifications har 60 soniyada yangilanadi
  setInterval(() => { if (state.token) loadNotifications(); }, 60000);
})();
