// =====================================================================
// Game Zone Qarz Dashboard — Frontend logic
// 3 til (uz / cyr / ru), tungi/tongi rejim, real ma'lumotlar
// =====================================================================

// ---------- I18n ----------
const i18n = {
  uz: {
    appName: "Game Zone Qarz",
    appSub: "Boshqaruv tizimi",
    heroTitle: "Tarmoq qarzlari ko'rinishi",
    heroSub: "Barcha filiallar bo'yicha real vaqt statistikasi",

    totalDebt: "Jami qarz",
    totalPaid: "Jami to'langan",
    totalRemaining: "Qoldiq qarz",
    overdue: "Muddati o'tgan",
    dueToday: "Bugun muddat",
    thisMonth: "Bu oy tushum",

    allBranches: "barcha filiallar",
    allTime: "umumiy",
    toCollect: "undirish kerak",
    urgent: "shoshilinch",
    needsAttention: "e'tibor bering",
    paymentsReceived: "qabul qilingan",

    branches: "Filiallar",
    users: "Foydalanuvchilar",
    clients: "Mijozlar",
    debts: "Qarzlar",
    payments: "To'lovlar",
    auditEvents: "Audit yozuvlari",

    branchComparison: "Filiallar taqqoslash",
    branchComparisonSub: "qarzlar va to'lovlar bo'yicha",
    paymentMethods: "To'lov usullari",
    paymentMethodsSub: "bu oy bo'yicha",

    debtStatuses: "Qarzlar holati",
    debtStatusesSub: "status bo'yicha taqsimot",

    topDebtors: "Eng katta qarzdorlar",
    topDebtorsSub: "qoldiq qarz bo'yicha TOP-5",

    recentDebts: "Oxirgi qarzlar",
    recentDebtsSub: "eng so'nggi 10 ta yozuv",

    recentPayments: "Oxirgi to'lovlar",
    recentPaymentsSub: "10 ta so'nggi yozuv",

    recentActivity: "Oxirgi hodisalar",
    recentActivitySub: "audit log",

    thName: "Ism",
    thPhone: "Telefon",
    thBranch: "Filial",
    thRemaining: "Qoldiq",
    thClient: "Mijoz",
    thItem: "Xizmat",
    thAmount: "Summa",
    thDue: "Muddat",
    thStatus: "Status",
    thDate: "Sana",
    thMethod: "Usul",

    statusActive: "Faol",
    statusPartial: "Qisman",
    statusPaid: "To'liq to'langan",
    statusOverdue: "Muddati o'tgan",
    statusDueToday: "Bugun muddat",
    statusCancelled: "Bekor qilingan",

    methodCash: "Naqd",
    methodCard: "Karta",
    methodTransfer: "O'tkazma",

    itemPlaystation: "PlayStation",
    itemComputer: "Kompyuter",
    itemBilliard: "Bilyard",
    itemOther: "Boshqa",

    paid: "to'langan",
    remaining: "qoldiq",

    actionCreate: "yaratdi",
    actionUpdate: "tahrirladi",
    actionDelete: "o'chirdi",
    actionSoftDelete: "bekor qildi",
    actionPayment: "to'lov yozdi",
    actionLogin: "kirdi",
    actionLogout: "chiqdi",
    actionRestore: "qayta tikladi",

    tableBranch: "filial",
    tableUser: "foydalanuvchi",
    tableClient: "mijoz",
    tableDebt: "qarz",
    tablePayment: "to'lov",

    footerNote: "1-bosqich preview — Express API va React frontend keyingi bosqichlarda quriladi",
    loading: "Yuklanmoqda...",
    noData: "Ma'lumot yo'q",
    currency: "so'm",
    generatedAt: "yangilandi",

    roleOwner: "Ega",
    roleAdmin: "Admin",
    switchProfile: "Profilni almashtirish",
    previewNote: "Auth hali yo'q — RBAC namoyishi uchun",
    viewingAs: "Ko'rinish",

    chartTimeline: "Oxirgi 30 kun",
    chartTimelineSub: "qo'shilgan qarz va qabul qilingan to'lovlar",
    chartStatus: "Status taqsimoti",
    chartMethods: "To'lov usullari",
    chartItems: "Xizmat turlari",
    chartBranches: "Filiallar bar chart",
    chartBranchesSub: "summa bo'yicha taqqoslash",
    chartDebtAdded: "Qo'shilgan qarz",
    chartPaid: "To'langan",

    modalTotalDebt: "Jami qarzlar — barcha yozuvlar",
    modalTotalPaid: "Jami to'lovlar tarixi",
    modalRemaining: "Qoldiq qarzli yozuvlar",
    modalOverdue: "Muddati o'tgan qarzlar",
    modalDueToday: "Bugun muddati tugaydi",
    modalThisMonth: "Bu oyning to'lovlari",
    modalStatusActive: "Faol qarzlar — to'liq ro'yxat",
    modalStatusPartial: "Qisman to'langan qarzlar",
    modalStatusPaid: "To'liq to'langan qarzlar",
    modalStatusOverdue: "Muddati o'tgan qarzlar",
    modalStatusCancelled: "Bekor qilingan qarzlar",
    modalClient: "Mijoz tarixi",

    summaryCount: "Soni",
    summaryAmount: "Summa",
    summaryPaid: "To'langan",
    summaryRemaining: "Qoldiq",
    summaryDebts: "Qarzlar",
    summaryPayments: "To'lovlar",

    paymentsHistory: "To'lovlar tarixi",
    auditLogTitle: "Audit log",
    debtsHistory: "Qarzlar tarixi",

    expand: "Ochish",
    collapse: "Yopish",
    noPayments: "To'lovlar yo'q",
    noLogs: "Bu yozuv uchun audit log yo'q",
    adminNoLogs: "⚠️ Audit log faqat ega (owner) uchun ko'rinadi",
    clickToExpand: "Batafsil ko'rish",

    item: "Xizmat",
    borrowedDate: "Olingan",
    dueDate: "Muddat",
    notes: "Eslatma",
    createdBy: "Yozgan",
    branch: "Filial",
    phone: "Telefon",
    method: "Usul",
    paidDate: "To'lov sanasi",
    actionDoneBy: "Bajardi",
    when: "Vaqt",
    oldValue: "Avvalgi qiymat",
    newValue: "Yangi qiymat",

    closeModal: "Yopish (Esc)",
  },

  cyr: {
    appName: "Гейм Зона Қарз",
    appSub: "Бошқарув тизими",
    heroTitle: "Тармоқ қарзлари кўриниши",
    heroSub: "Барча филиаллар бўйича реал вақт статистикаси",

    totalDebt: "Жами қарз",
    totalPaid: "Жами тўланган",
    totalRemaining: "Қолдиқ қарз",
    overdue: "Муддати ўтган",
    dueToday: "Бугун муддат",
    thisMonth: "Бу ой тушум",

    allBranches: "барча филиаллар",
    allTime: "умумий",
    toCollect: "ундириш керак",
    urgent: "шошилинч",
    needsAttention: "эътибор беринг",
    paymentsReceived: "қабул қилинган",

    branches: "Филиаллар",
    users: "Фойдаланувчилар",
    clients: "Мижозлар",
    debts: "Қарзлар",
    payments: "Тўловлар",
    auditEvents: "Аудит ёзувлари",

    branchComparison: "Филиаллар таққослаш",
    branchComparisonSub: "қарзлар ва тўловлар бўйича",
    paymentMethods: "Тўлов усуллари",
    paymentMethodsSub: "бу ой бўйича",

    debtStatuses: "Қарзлар ҳолати",
    debtStatusesSub: "статус бўйича тақсимот",

    topDebtors: "Энг катта қарздорлар",
    topDebtorsSub: "қолдиқ қарз бўйича ТОП-5",

    recentDebts: "Охирги қарзлар",
    recentDebtsSub: "энг сўнгги 10 та ёзув",

    recentPayments: "Охирги тўловлар",
    recentPaymentsSub: "10 та сўнгги ёзув",

    recentActivity: "Охирги ҳодисалар",
    recentActivitySub: "аудит лог",

    thName: "Исм",
    thPhone: "Телефон",
    thBranch: "Филиал",
    thRemaining: "Қолдиқ",
    thClient: "Мижоз",
    thItem: "Хизмат",
    thAmount: "Сумма",
    thDue: "Муддат",
    thStatus: "Статус",
    thDate: "Сана",
    thMethod: "Усул",

    statusActive: "Фаол",
    statusPartial: "Қисман",
    statusPaid: "Тўлиқ тўланган",
    statusOverdue: "Муддати ўтган",
    statusDueToday: "Бугун муддат",
    statusCancelled: "Бекор қилинган",

    methodCash: "Нақд",
    methodCard: "Карта",
    methodTransfer: "Ўтказма",

    itemPlaystation: "PlayStation",
    itemComputer: "Компьютер",
    itemBilliard: "Бильярд",
    itemOther: "Бошқа",

    paid: "тўланган",
    remaining: "қолдиқ",

    actionCreate: "яратди",
    actionUpdate: "таҳрирлади",
    actionDelete: "ўчирди",
    actionSoftDelete: "бекор қилди",
    actionPayment: "тўлов ёзди",
    actionLogin: "кирди",
    actionLogout: "чиқди",
    actionRestore: "қайта тиклади",

    tableBranch: "филиал",
    tableUser: "фойдаланувчи",
    tableClient: "мижоз",
    tableDebt: "қарз",
    tablePayment: "тўлов",

    footerNote: "1-босқич preview — Express API ва React frontend кейинги босқичларда қурилади",
    loading: "Юкланмоқда...",
    noData: "Маълумот йўқ",
    currency: "сўм",
    generatedAt: "янгиланди",

    roleOwner: "Эга",
    roleAdmin: "Админ",
    switchProfile: "Профилни алмаштириш",
    previewNote: "Auth ҳали йўқ — RBAC намойиши учун",
    viewingAs: "Кўриниш",

    chartTimeline: "Охирги 30 кун",
    chartTimelineSub: "қўшилган қарз ва қабул қилинган тўловлар",
    chartStatus: "Статус тақсимоти",
    chartMethods: "Тўлов усуллари",
    chartItems: "Хизмат турлари",
    chartBranches: "Филиаллар bar chart",
    chartBranchesSub: "сумма бўйича таққослаш",
    chartDebtAdded: "Қўшилган қарз",
    chartPaid: "Тўланган",

    modalTotalDebt: "Жами қарзлар — барча ёзувлар",
    modalTotalPaid: "Жами тўловлар тарихи",
    modalRemaining: "Қолдиқ қарзли ёзувлар",
    modalOverdue: "Муддати ўтган қарзлар",
    modalDueToday: "Бугун муддати тугайди",
    modalThisMonth: "Бу ойнинг тўловлари",
    modalStatusActive: "Фаол қарзлар — тўлиқ рўйхат",
    modalStatusPartial: "Қисман тўланган қарзлар",
    modalStatusPaid: "Тўлиқ тўланган қарзлар",
    modalStatusOverdue: "Муддати ўтган қарзлар",
    modalStatusCancelled: "Бекор қилинган қарзлар",
    modalClient: "Мижоз тарихи",

    summaryCount: "Сони",
    summaryAmount: "Сумма",
    summaryPaid: "Тўланган",
    summaryRemaining: "Қолдиқ",
    summaryDebts: "Қарзлар",
    summaryPayments: "Тўловлар",

    paymentsHistory: "Тўловлар тарихи",
    auditLogTitle: "Аудит лог",
    debtsHistory: "Қарзлар тарихи",

    expand: "Очиш",
    collapse: "Ёпиш",
    noPayments: "Тўловлар йўқ",
    noLogs: "Бу ёзув учун аудит лог йўқ",
    adminNoLogs: "⚠️ Аудит лог фақат эга (owner) учун кўринади",
    clickToExpand: "Батафсил кўриш",

    item: "Хизмат",
    borrowedDate: "Олинган",
    dueDate: "Муддат",
    notes: "Эслатма",
    createdBy: "Ёзган",
    branch: "Филиал",
    phone: "Телефон",
    method: "Усул",
    paidDate: "Тўлов санаси",
    actionDoneBy: "Бажарди",
    when: "Вақт",
    oldValue: "Аввалги қиймат",
    newValue: "Янги қиймат",

    closeModal: "Ёпиш (Esc)",
  },

  ru: {
    appName: "Game Zone Долги",
    appSub: "Система управления",
    heroTitle: "Обзор долгов сети",
    heroSub: "Статистика в реальном времени по всем филиалам",

    totalDebt: "Общий долг",
    totalPaid: "Всего оплачено",
    totalRemaining: "Остаток долга",
    overdue: "Просроченные",
    dueToday: "Сегодня срок",
    thisMonth: "Поступления за месяц",

    allBranches: "все филиалы",
    allTime: "за всё время",
    toCollect: "к взысканию",
    urgent: "срочно",
    needsAttention: "обратите внимание",
    paymentsReceived: "получено",

    branches: "Филиалы",
    users: "Пользователи",
    clients: "Клиенты",
    debts: "Долги",
    payments: "Платежи",
    auditEvents: "Записи аудита",

    branchComparison: "Сравнение филиалов",
    branchComparisonSub: "по долгам и платежам",
    paymentMethods: "Методы оплаты",
    paymentMethodsSub: "за этот месяц",

    debtStatuses: "Статусы долгов",
    debtStatusesSub: "распределение по статусам",

    topDebtors: "Крупнейшие должники",
    topDebtorsSub: "ТОП-5 по остатку долга",

    recentDebts: "Последние долги",
    recentDebtsSub: "10 самых свежих записей",

    recentPayments: "Последние платежи",
    recentPaymentsSub: "10 последних записей",

    recentActivity: "Последние события",
    recentActivitySub: "журнал аудита",

    thName: "Имя",
    thPhone: "Телефон",
    thBranch: "Филиал",
    thRemaining: "Остаток",
    thClient: "Клиент",
    thItem: "Услуга",
    thAmount: "Сумма",
    thDue: "Срок",
    thStatus: "Статус",
    thDate: "Дата",
    thMethod: "Метод",

    statusActive: "Активный",
    statusPartial: "Частично",
    statusPaid: "Оплачен",
    statusOverdue: "Просрочен",
    statusDueToday: "Сегодня",
    statusCancelled: "Отменён",

    methodCash: "Наличные",
    methodCard: "Карта",
    methodTransfer: "Перевод",

    itemPlaystation: "PlayStation",
    itemComputer: "Компьютер",
    itemBilliard: "Бильярд",
    itemOther: "Другое",

    paid: "оплачено",
    remaining: "остаток",

    actionCreate: "создал",
    actionUpdate: "изменил",
    actionDelete: "удалил",
    actionSoftDelete: "отменил",
    actionPayment: "записал платёж",
    actionLogin: "вошёл",
    actionLogout: "вышел",
    actionRestore: "восстановил",

    tableBranch: "филиал",
    tableUser: "пользователь",
    tableClient: "клиент",
    tableDebt: "долг",
    tablePayment: "платёж",

    footerNote: "Превью этапа 1 — Express API и React frontend будут построены на следующих этапах",
    loading: "Загрузка...",
    noData: "Нет данных",
    currency: "сум",
    generatedAt: "обновлено",

    roleOwner: "Владелец",
    roleAdmin: "Админ",
    switchProfile: "Сменить профиль",
    previewNote: "Auth пока нет — демонстрация RBAC",
    viewingAs: "Просмотр",

    chartTimeline: "Последние 30 дней",
    chartTimelineSub: "добавленные долги и принятые платежи",
    chartStatus: "Распределение статусов",
    chartMethods: "Методы оплаты",
    chartItems: "Типы услуг",
    chartBranches: "Сравнение филиалов",
    chartBranchesSub: "по сумме",
    chartDebtAdded: "Добавлено долга",
    chartPaid: "Оплачено",

    modalTotalDebt: "Все долги — полный список",
    modalTotalPaid: "История всех платежей",
    modalRemaining: "Записи с остатком долга",
    modalOverdue: "Просроченные долги",
    modalDueToday: "Сегодня истекает срок",
    modalThisMonth: "Платежи за этот месяц",
    modalStatusActive: "Активные долги — полный список",
    modalStatusPartial: "Частично оплаченные",
    modalStatusPaid: "Полностью оплаченные",
    modalStatusOverdue: "Просроченные",
    modalStatusCancelled: "Отменённые",
    modalClient: "История клиента",

    summaryCount: "Количество",
    summaryAmount: "Сумма",
    summaryPaid: "Оплачено",
    summaryRemaining: "Остаток",
    summaryDebts: "Долги",
    summaryPayments: "Платежи",

    paymentsHistory: "История платежей",
    auditLogTitle: "Журнал аудита",
    debtsHistory: "История долгов",

    expand: "Раскрыть",
    collapse: "Свернуть",
    noPayments: "Нет платежей",
    noLogs: "Записей аудита нет",
    adminNoLogs: "⚠️ Журнал аудита виден только владельцу",
    clickToExpand: "Подробнее",

    item: "Услуга",
    borrowedDate: "Взято",
    dueDate: "Срок",
    notes: "Примечание",
    createdBy: "Записал",
    branch: "Филиал",
    phone: "Телефон",
    method: "Метод",
    paidDate: "Дата оплаты",
    actionDoneBy: "Выполнил",
    when: "Время",
    oldValue: "Старое значение",
    newValue: "Новое значение",

    closeModal: "Закрыть (Esc)",
  },
};

// ---------- State ----------
const state = {
  lang: localStorage.getItem("lang") || "uz",
  theme: localStorage.getItem("theme") || "light",
  viewerId: Number(localStorage.getItem("viewerId")) || null,
  profiles: [],
  data: null,
  charts: {
    timeline: null,
    status: null,
    methods: null,
    items: null,
    branches: null,
  },
};

// ---------- Helpers ----------
function t(key) {
  return i18n[state.lang]?.[key] ?? i18n.uz[key] ?? key;
}

function fmtMoney(amount) {
  const n = Number(amount || 0);
  return new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 0,
  }).format(n) + " " + t("currency");
}

function fmtNumber(n) {
  return new Intl.NumberFormat("uz-UZ").format(Number(n || 0));
}

function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function fmtDateTime(d) {
  if (!d) return "";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hh}:${mm}`;
}

function fmtItem(itemType) {
  const map = {
    playstation: "itemPlaystation",
    computer: "itemComputer",
    billiard: "itemBilliard",
    other: "itemOther",
  };
  return t(map[itemType] || "itemOther");
}

function methodIcon(method) {
  return method === "cash" ? "💵" : method === "card" ? "💳" : "🔄";
}

function statusKey(status) {
  return "status" + status.charAt(0).toUpperCase() + status.slice(1);
}

function actionKey(action) {
  const map = {
    create: "actionCreate",
    update: "actionUpdate",
    delete: "actionDelete",
    soft_delete: "actionSoftDelete",
    payment: "actionPayment",
    login: "actionLogin",
    logout: "actionLogout",
    restore: "actionRestore",
  };
  return map[action] || action;
}

function tableKey(tableName) {
  const map = {
    Branch: "tableBranch",
    User: "tableUser",
    Client: "tableClient",
    Debt: "tableDebt",
    Payment: "tablePayment",
  };
  return map[tableName] ? t(map[tableName]) : tableName;
}

// ---------- Theme ----------
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
}

document.getElementById("themeBtn").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", state.theme);
  applyTheme();
});

// ---------- Language ----------
function applyLang() {
  document.documentElement.lang = state.lang === "ru" ? "ru" : "uz";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === state.lang);
  });
  if (state.data) render(state.data);
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.lang = btn.dataset.lang;
    localStorage.setItem("lang", state.lang);
    applyLang();
  });
});

// ---------- Live time ----------
function tickTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("liveTime").textContent =
    `${fmtDate(now)} • ${hh}:${mm}:${ss}`;
}

// ---------- Profile ----------
function profileInitials(fullName) {
  return fullName
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function renderProfileButton(viewer) {
  const avatar = document.getElementById("profileAvatar");
  avatar.textContent = profileInitials(viewer.fullName);
  avatar.classList.remove("role-owner", "role-admin");
  avatar.classList.add("role-" + viewer.role);
  document.getElementById("profileName").textContent = viewer.fullName;
  document.getElementById("profileRole").textContent =
    t(viewer.role === "owner" ? "roleOwner" : "roleAdmin") +
    (viewer.branchName ? " · " + viewer.branchName : "");
}

function renderHeroBadges(viewer) {
  const roleBadge = document.getElementById("heroRoleBadge");
  const branchBadge = document.getElementById("heroBranchBadge");
  roleBadge.textContent =
    "👤 " + viewer.fullName + " — " + t(viewer.role === "owner" ? "roleOwner" : "roleAdmin");
  if (viewer.branchName) {
    branchBadge.textContent = "🏢 " + viewer.branchName;
    branchBadge.hidden = false;
  } else {
    branchBadge.hidden = true;
  }
}

function renderProfileDropdown() {
  const list = document.getElementById("profileList");
  list.innerHTML = state.profiles
    .map((p) => {
      const meta =
        t(p.role === "owner" ? "roleOwner" : "roleAdmin") +
        (p.branchName ? " · " + p.branchName : "");
      return `
        <div class="dropdown-item ${p.id === state.viewerId ? "active" : ""}" data-id="${p.id}">
          <div class="profile-avatar role-${p.role}">${escapeHtml(profileInitials(p.fullName))}</div>
          <div class="di-info">
            <div class="di-name">${escapeHtml(p.fullName)}</div>
            <div class="di-meta">${escapeHtml(meta)}</div>
          </div>
        </div>
      `;
    })
    .join("");

  list.querySelectorAll(".dropdown-item").forEach((el) => {
    el.addEventListener("click", () => {
      const id = Number(el.dataset.id);
      state.viewerId = id;
      localStorage.setItem("viewerId", String(id));
      document.getElementById("profileDropdown").hidden = true;
      loadData();
    });
  });
}

document.getElementById("profileBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  const dd = document.getElementById("profileDropdown");
  dd.hidden = !dd.hidden;
});

document.addEventListener("click", (e) => {
  const sw = document.getElementById("profileSwitcher");
  if (!sw.contains(e.target)) {
    document.getElementById("profileDropdown").hidden = true;
  }
});

// ---------- Charts ----------
function getChartColors() {
  const isDark = state.theme === "dark";
  const css = getComputedStyle(document.documentElement);
  return {
    text: css.getPropertyValue("--text").trim() || (isDark ? "#e8ecf7" : "#1a1f36"),
    muted: css.getPropertyValue("--text-muted").trim() || "#6b7385",
    grid: isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(15, 23, 42, 0.06)",
    primary: css.getPropertyValue("--primary").trim() || "#6366f1",
    success: css.getPropertyValue("--success").trim() || "#10b981",
    warning: css.getPropertyValue("--warning").trim() || "#f59e0b",
    danger: css.getPropertyValue("--danger").trim() || "#ef4444",
    info: css.getPropertyValue("--info").trim() || "#0ea5e9",
    purple: css.getPropertyValue("--purple").trim() || "#a855f7",
    orange: css.getPropertyValue("--orange").trim() || "#f97316",
    gray: css.getPropertyValue("--gray").trim() || "#6b7280",
  };
}

function destroyChart(name) {
  if (state.charts[name]) {
    state.charts[name].destroy();
    state.charts[name] = null;
  }
}

function renderTimelineChart(timeseries) {
  destroyChart("timeline");
  const colors = getChartColors();
  const ctx = document.getElementById("chartTimeline");
  if (!ctx) return;

  const labels = timeseries.map((p) => {
    const d = new Date(p.date);
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0");
  });

  const debtCanvas = document.createElement("canvas");
  // Gradient
  const gradient1 = ctx.getContext("2d").createLinearGradient(0, 0, 0, 280);
  gradient1.addColorStop(0, colors.primary + "55");
  gradient1.addColorStop(1, colors.primary + "00");
  const gradient2 = ctx.getContext("2d").createLinearGradient(0, 0, 0, 280);
  gradient2.addColorStop(0, colors.success + "55");
  gradient2.addColorStop(1, colors.success + "00");

  state.charts.timeline = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("chartDebtAdded"),
          data: timeseries.map((p) => p.debtAdded),
          borderColor: colors.primary,
          backgroundColor: gradient1,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: colors.primary,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
        {
          label: t("chartPaid"),
          data: timeseries.map((p) => p.paid),
          borderColor: colors.success,
          backgroundColor: gradient2,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: colors.success,
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: { color: colors.text, usePointStyle: true, padding: 18, font: { size: 12, weight: "600" } },
        },
        tooltip: {
          backgroundColor: state.theme === "dark" ? "#0b1020" : "#1a1f36",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: colors.muted, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 16 },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            callback: (v) => {
              if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
              if (v >= 1000) return (v / 1000).toFixed(0) + "k";
              return v;
            },
          },
          grid: { color: colors.grid, drawBorder: false },
        },
      },
    },
  });
}

function renderStatusChart(s) {
  destroyChart("status");
  const colors = getChartColors();
  const ctx = document.getElementById("chartStatus");
  if (!ctx) return;

  const data = [
    { label: t("statusActive"), value: s.active, color: colors.info },
    { label: t("statusPartial"), value: s.partial, color: colors.orange },
    { label: t("statusPaid"), value: s.paid, color: colors.success },
    { label: t("statusOverdue"), value: s.overdue, color: colors.danger },
    { label: t("statusCancelled"), value: s.cancelled, color: colors.gray },
  ].filter((d) => d.value > 0);

  state.charts.status = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color),
          borderColor: state.theme === "dark" ? "#141a30" : "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: colors.text, usePointStyle: true, padding: 12, font: { size: 11, weight: "500" } },
        },
        tooltip: {
          backgroundColor: state.theme === "dark" ? "#0b1020" : "#1a1f36",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          cornerRadius: 8,
        },
      },
    },
  });
}

function renderMethodsChart(money) {
  destroyChart("methods");
  const colors = getChartColors();
  const ctx = document.getElementById("chartMethods");
  if (!ctx) return;

  const data = [
    { label: t("methodCash"), value: money.cashThisMonth || 0, color: colors.success },
    { label: t("methodCard"), value: money.cardThisMonth || 0, color: colors.info },
    { label: t("methodTransfer"), value: money.transferThisMonth || 0, color: colors.purple },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    data.push({ label: t("noData"), value: 1, color: colors.gray });
  }

  state.charts.methods = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color),
          borderColor: state.theme === "dark" ? "#141a30" : "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: colors.text, usePointStyle: true, padding: 12, font: { size: 11, weight: "500" } },
        },
        tooltip: {
          backgroundColor: state.theme === "dark" ? "#0b1020" : "#1a1f36",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          cornerRadius: 8,
          callbacks: { label: (ctx) => `${ctx.label}: ${fmtMoney(ctx.parsed)}` },
        },
      },
    },
  });
}

function renderItemsChart(items) {
  destroyChart("items");
  const colors = getChartColors();
  const ctx = document.getElementById("chartItems");
  if (!ctx) return;

  const palette = {
    playstation: colors.primary,
    computer: colors.info,
    billiard: colors.warning,
    other: colors.gray,
  };

  const data = items
    .filter((i) => i.count > 0)
    .map((i) => ({
      label: fmtItem(i.type),
      value: i.count,
      amount: i.amount,
      color: palette[i.type] || colors.gray,
    }));

  if (data.length === 0) {
    data.push({ label: t("noData"), value: 1, amount: 0, color: colors.gray });
  }

  state.charts.items = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color),
          borderColor: state.theme === "dark" ? "#141a30" : "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: colors.text, usePointStyle: true, padding: 12, font: { size: 11, weight: "500" } },
        },
        tooltip: {
          backgroundColor: state.theme === "dark" ? "#0b1020" : "#1a1f36",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const item = data[ctx.dataIndex];
              return `${item.label}: ${item.value} (${fmtMoney(item.amount)})`;
            },
          },
        },
      },
    },
  });
}

function renderBranchesChart(branches) {
  destroyChart("branches");
  const colors = getChartColors();
  const ctx = document.getElementById("chartBranches");
  if (!ctx) return;

  state.charts.branches = new Chart(ctx, {
    type: "bar",
    data: {
      labels: branches.map((b) => b.name),
      datasets: [
        {
          label: t("totalDebt"),
          data: branches.map((b) => b.totalAmount || 0),
          backgroundColor: colors.primary + "cc",
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: t("totalPaid"),
          data: branches.map((b) => b.totalPaid || 0),
          backgroundColor: colors.success + "cc",
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: t("totalRemaining"),
          data: branches.map((b) => b.totalRemaining || 0),
          backgroundColor: colors.warning + "cc",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { color: colors.text, usePointStyle: true, padding: 16, font: { size: 12, weight: "600" } },
        },
        tooltip: {
          backgroundColor: state.theme === "dark" ? "#0b1020" : "#1a1f36",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmtMoney(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: colors.muted, font: { size: 12, weight: "600" } },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: colors.muted,
            font: { size: 11 },
            callback: (v) => {
              if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
              if (v >= 1000) return (v / 1000).toFixed(0) + "k";
              return v;
            },
          },
          grid: { color: colors.grid, drawBorder: false },
        },
      },
    },
  });
}

// ---------- Render functions ----------
function render(data) {
  // Profile
  renderProfileButton(data.viewer);
  renderHeroBadges(data.viewer);
  renderProfileDropdown();

  // Top stats
  document.getElementById("totalDebt").textContent = fmtMoney(data.money.totalDebt);
  document.getElementById("totalPaid").textContent = fmtMoney(data.money.totalPaid);
  document.getElementById("totalRemaining").textContent = fmtMoney(data.money.totalRemaining);
  document.getElementById("overdueCount").textContent = fmtNumber(data.statusCounts.overdue);
  document.getElementById("dueTodayCount").textContent = fmtNumber(data.statusCounts.dueToday);
  document.getElementById("thisMonthTotal").textContent = fmtMoney(data.money.thisMonthTotal);

  // Counters
  document.getElementById("branchesCount").textContent = fmtNumber(data.summary.branchesCount);
  document.getElementById("usersCount").textContent = fmtNumber(data.summary.usersCount);
  document.getElementById("clientsCount").textContent = fmtNumber(data.summary.clientsCount);
  document.getElementById("debtsCount").textContent = fmtNumber(data.summary.debtsCount);
  document.getElementById("paymentsCount").textContent = fmtNumber(data.summary.paymentsCount);
  document.getElementById("auditCount").textContent = fmtNumber(data.summary.auditCount);

  renderBranches(data.branches);
  renderPaymentMethods(data.money);
  renderStatuses(data.statusCounts);
  renderTopClients(data.topClients);
  renderRecentDebts(data.recentDebts);
  renderRecentPayments(data.recentPayments);
  renderActivity(data.recentAudits);

  // Charts
  renderTimelineChart(data.timeseries || []);
  renderStatusChart(data.statusCounts);
  renderMethodsChart(data.money);
  renderItemsChart(data.itemBreakdown || []);
  renderBranchesChart(data.branches);

  // Click bindings
  bindClickableCards();
  bindStatusPills();
  bindTopClientRows();
  bindRecentDebtRows();
  bindRecentPaymentRows();

  // Footer meta
  document.getElementById("footerMeta").textContent =
    `${t("generatedAt")}: ${fmtDateTime(data.generatedAt)}`;
}

function renderBranches(branches) {
  const root = document.getElementById("branchesList");
  if (!branches || branches.length === 0) {
    root.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }
  root.innerHTML = branches
    .map((b) => {
      const totalAmount = b.totalAmount || 0;
      const totalPaid = b.totalPaid || 0;
      const totalRemaining = b.totalRemaining || 0;
      const paidPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
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
          <div class="branch-bar">
            <div class="branch-bar-fill" style="width: ${paidPercent}%;"></div>
          </div>
          <div class="branch-numbers">
            <span class="label-paid">▲ ${t("paid")}: ${fmtMoney(totalPaid)} (${paidPercent}%)</span>
            <span class="label-remaining">${t("remaining")}: ${fmtMoney(totalRemaining)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderPaymentMethods(money) {
  const cash = money.cashThisMonth || 0;
  const card = money.cardThisMonth || 0;
  const transfer = money.transferThisMonth || 0;
  const total = cash + card + transfer;

  const methods = [
    { key: "cash", label: t("methodCash"), amount: cash, icon: "💵" },
    { key: "card", label: t("methodCard"), amount: card, icon: "💳" },
    { key: "transfer", label: t("methodTransfer"), amount: transfer, icon: "🔄" },
  ];

  const root = document.getElementById("methodBars");
  root.innerHTML = methods
    .map((m) => {
      const pct = total > 0 ? Math.round((m.amount / total) * 100) : 0;
      return `
        <div class="method-row ${m.key}">
          <div class="method-icon ${m.key}">${m.icon}</div>
          <div class="method-info">
            <div class="method-name">
              <span>${m.label}</span>
              <span class="method-amount">${fmtMoney(m.amount)} <b>(${pct}%)</b></span>
            </div>
            <div class="method-bar"><div class="method-bar-fill" style="width: ${pct}%;"></div></div>
          </div>
        </div>
      `;
    })
    .join("");

  document.getElementById("methodLegend").textContent =
    `${t("thisMonth")}: ${fmtMoney(total)}`;
}

function renderStatuses(s) {
  const items = [
    { key: "active", count: s.active, label: t("statusActive") },
    { key: "partial", count: s.partial, label: t("statusPartial") },
    { key: "paid", count: s.paid, label: t("statusPaid") },
    { key: "overdue", count: s.overdue, label: t("statusOverdue") },
    { key: "duetoday", count: s.dueToday, label: t("statusDueToday") },
    { key: "cancelled", count: s.cancelled, label: t("statusCancelled") },
  ];
  document.getElementById("statusGrid").innerHTML = items
    .map(
      (i) => `
      <button type="button" class="status-pill ${i.key}" data-status="${i.key}">
        <div class="pill-count">${fmtNumber(i.count)}</div>
        <div class="pill-label">${i.label}</div>
      </button>
    `,
    )
    .join("");
}

function renderTopClients(clients) {
  const tbody = document.getElementById("topClientsBody");
  if (!clients || clients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">${t("noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = clients
    .map(
      (c, idx) => `
      <tr class="clickable" data-client-id="${c.clientId}">
        <td>${idx + 1}</td>
        <td><b>${escapeHtml(c.name)}</b></td>
        <td>${escapeHtml(c.phone)}</td>
        <td>${escapeHtml(c.branch)}</td>
        <td class="num">${fmtMoney(c.totalRemaining)}</td>
      </tr>
    `,
    )
    .join("");
}

function renderRecentDebts(debts) {
  const tbody = document.getElementById("recentDebtsBody");
  if (!debts || debts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${t("noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = debts
    .map(
      (d) => `
      <tr class="clickable" data-client-id="${d.clientId}">
        <td>
          <b>${escapeHtml(d.client)}</b>
          <div style="font-size:11px;color:var(--text-muted)">${escapeHtml(d.phone)}</div>
        </td>
        <td>${escapeHtml(d.branch)}</td>
        <td>
          ${fmtItem(d.itemType)}
          ${d.itemDetails ? `<div style="font-size:11px;color:var(--text-muted)">${escapeHtml(d.itemDetails)}</div>` : ""}
        </td>
        <td class="num">${fmtMoney(d.amount)}</td>
        <td class="num">${fmtMoney(d.remainingAmount)}</td>
        <td>${fmtDate(d.dueDate)}</td>
        <td><span class="badge ${d.status}">${t(statusKey(d.status))}</span></td>
      </tr>
    `,
    )
    .join("");
}

function renderRecentPayments(payments) {
  const tbody = document.getElementById("recentPaymentsBody");
  if (!payments || payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">${t("noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = payments
    .map(
      (p) => `
      <tr class="clickable" data-client-id="${p.clientId}">
        <td>${fmtDate(p.paidDate)}</td>
        <td>
          <b>${escapeHtml(p.client)}</b>
          <div style="font-size:11px;color:var(--text-muted)">${escapeHtml(p.branch)}</div>
        </td>
        <td><span class="badge method-${p.method}">${methodIcon(p.method)} ${t("method" + p.method.charAt(0).toUpperCase() + p.method.slice(1))}</span></td>
        <td class="num">${fmtMoney(p.amount)}</td>
      </tr>
    `,
    )
    .join("");
}

function renderActivity(audits) {
  const root = document.getElementById("activityList");
  if (!audits || audits.length === 0) {
    root.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
    return;
  }
  root.innerHTML = audits
    .map(
      (a) => `
      <li class="activity-item">
        <div class="activity-dot ${a.action}"></div>
        <div class="activity-body">
          <div class="activity-text">
            <b>${escapeHtml(a.user)}</b>
            ${escapeHtml(t(actionKey(a.action)))}
            ${escapeHtml(tableKey(a.tableName))} #${a.recordId}
            ${a.branch ? `<span style="color:var(--text-muted)"> — ${escapeHtml(a.branch)}</span>` : ""}
          </div>
          <div class="activity-meta">${fmtDateTime(a.createdAt)}</div>
        </div>
      </li>
    `,
    )
    .join("");
}

// ---------- HTML escape ----------
function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// =====================================================================
// Modal — batafsil ma'lumot
// =====================================================================
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");

function openModal() {
  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = "";
}

document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
});

const filterTitleMap = {
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

async function showFilterModal(filter) {
  const titleKey = filterTitleMap[filter] || "modalTotalDebt";
  modalTitle.textContent = t(titleKey);
  modalSub.textContent = "";
  modalBody.innerHTML = `<div class="modal-loading">${t("loading")}</div>`;
  openModal();

  try {
    const url = `/api/list?filter=${encodeURIComponent(filter)}&asUser=${state.viewerId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderModalList(data);
  } catch (err) {
    modalBody.innerHTML = `<div class="modal-loading">⚠️ ${escapeHtml(String(err.message))}</div>`;
  }
}

async function showClientModal(clientId) {
  modalTitle.textContent = t("modalClient");
  modalSub.textContent = "";
  modalBody.innerHTML = `<div class="modal-loading">${t("loading")}</div>`;
  openModal();
  try {
    const res = await fetch(`/api/client/${clientId}?asUser=${state.viewerId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderClientModal(data);
  } catch (err) {
    modalBody.innerHTML = `<div class="modal-loading">⚠️ ${escapeHtml(String(err.message))}</div>`;
  }
}

function renderModalList(data) {
  const isAdmin = data.viewer.role === "admin";
  const items = data.items || [];

  modalSub.textContent = `${t("viewingAs")}: ${data.viewer.fullName} (${t(isAdmin ? "roleAdmin" : "roleOwner")})`;

  if (items.length === 0) {
    modalBody.innerHTML = `<div class="empty-state">${t("noData")}</div>`;
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
      </div>
    `;
  } else if (data.kind === "payments") {
    const total = items.reduce((a, i) => a + (i.amount || 0), 0);
    const cash = items.filter((i) => i.method === "cash").reduce((a, i) => a + i.amount, 0);
    const card = items.filter((i) => i.method === "card").reduce((a, i) => a + i.amount, 0);
    const transfer = items.filter((i) => i.method === "transfer").reduce((a, i) => a + i.amount, 0);
    summaryHtml = `
      <div class="modal-summary">
        <div><span class="label">${t("summaryCount")}</span><span class="value">${fmtNumber(items.length)}</span></div>
        <div><span class="label">${t("summaryAmount")}</span><span class="value">${fmtMoney(total)}</span></div>
        <div><span class="label">${t("methodCash")}</span><span class="value" style="color:var(--success)">${fmtMoney(cash)}</span></div>
        <div><span class="label">${t("methodCard")}</span><span class="value" style="color:var(--info)">${fmtMoney(card)}</span></div>
        <div><span class="label">${t("methodTransfer")}</span><span class="value" style="color:var(--purple)">${fmtMoney(transfer)}</span></div>
      </div>
    `;
  }

  let warnHtml = "";
  if (isAdmin) {
    warnHtml = `<div class="admin-warn">${t("adminNoLogs")}</div>`;
  }

  let listHtml = "";
  if (data.kind === "debts") {
    listHtml = items.map((d) => renderDebtCard(d, isAdmin)).join("");
  } else if (data.kind === "payments") {
    listHtml = items.map((p) => renderPaymentCard(p)).join("");
  }

  modalBody.innerHTML = summaryHtml + warnHtml + listHtml;

  // Click handlers for expandable items
  modalBody.querySelectorAll(".item-card.clickable").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".client-link")) return;
      card.classList.toggle("expanded");
      const btn = card.querySelector(".expand-toggle");
      if (btn) {
        btn.textContent = card.classList.contains("expanded") ? t("collapse") : t("expand");
      }
    });
  });

  // Client name click (open client detail)
  modalBody.querySelectorAll(".client-link").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(el.dataset.clientId);
      if (id) showClientModal(id);
    });
  });
}

function renderDebtCard(d, isAdmin) {
  const amountClass =
    d.status === "paid" ? "success" : d.status === "overdue" ? "danger" : "warning";

  const paymentsHtml =
    d.payments.length === 0
      ? `<div class="no-logs">${t("noPayments")}</div>`
      : d.payments
          .map(
            (p) => `
        <div class="sub-item">
          <div>
            <span class="badge method-${p.method}">${methodIcon(p.method)} ${t("method" + p.method.charAt(0).toUpperCase() + p.method.slice(1))}</span>
            <span style="margin-left:8px;font-weight:600">${fmtMoney(p.amount)}</span>
          </div>
          <div class="sub-item-meta">${fmtDateTime(p.paidDate)}${p.notes ? " • " + escapeHtml(p.notes) : ""}</div>
        </div>
      `,
          )
          .join("");

  let auditHtml = "";
  if (!isAdmin) {
    if (d.auditLogs && d.auditLogs.length > 0) {
      auditHtml = `
        <div class="sub-section">
          <div class="sub-section-title">📋 ${t("auditLogTitle")} <span class="count-pill">${d.auditLogs.length}</span></div>
          ${d.auditLogs
            .map(
              (a) => `
            <div class="audit-row">
              <div class="audit-dot" style="background:${auditColor(a.action)}"></div>
              <div class="audit-info">
                <div><b>${escapeHtml(a.user)}</b> ${escapeHtml(t(actionKey(a.action)))}</div>
                <div class="sub-item-meta">${fmtDateTime(a.createdAt)}${a.newValue ? " • " + escapeHtml(truncate(a.newValue, 80)) : ""}</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    } else {
      auditHtml = `<div class="sub-section"><div class="sub-section-title">📋 ${t("auditLogTitle")}</div><div class="no-logs">${t("noLogs")}</div></div>`;
    }
  }

  return `
    <div class="item-card clickable">
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
            <span>📅 ${t("dueDate")}: ${fmtDate(d.dueDate)}</span>
          </div>
        </div>
        <div style="text-align:right">
          <div class="item-card-amount ${amountClass}">${fmtMoney(d.remainingAmount)}</div>
          <div class="sub-item-meta">${fmtMoney(d.amount)} ${t("totalDebt").toLowerCase()}</div>
          <button class="expand-toggle" type="button" style="margin-top:6px">${t("expand")}</button>
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
          <div class="sub-section-title">💵 ${t("paymentsHistory")} <span class="count-pill">${d.payments.length}</span></div>
          ${paymentsHtml}
        </div>
        ${auditHtml}
      </div>
    </div>
  `;
}

function renderPaymentCard(p) {
  return `
    <div class="item-card">
      <div class="item-card-head">
        <div style="flex:1;min-width:0">
          <div class="item-card-title">
            <span class="badge method-${p.method}">${methodIcon(p.method)} ${t("method" + p.method.charAt(0).toUpperCase() + p.method.slice(1))}</span>
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
    </div>
  `;
}

function renderClientModal(data) {
  const isAdmin = data.viewer.role === "admin";
  const c = data.client;
  modalTitle.textContent = c.name;
  modalSub.textContent = `📞 ${c.phone} · 🏢 ${c.branch}`;

  let warnHtml = isAdmin
    ? `<div class="admin-warn">${t("adminNoLogs")}</div>`
    : "";

  const summaryHtml = `
    <div class="modal-summary">
      <div><span class="label">${t("summaryDebts")}</span><span class="value">${fmtNumber(data.summary.debtsCount)}</span></div>
      <div><span class="label">${t("summaryPayments")}</span><span class="value">${fmtNumber(data.summary.paymentsCount)}</span></div>
      <div><span class="label">${t("summaryAmount")}</span><span class="value">${fmtMoney(data.summary.totalAmount)}</span></div>
      <div><span class="label">${t("summaryPaid")}</span><span class="value" style="color:var(--success)">${fmtMoney(data.summary.totalPaid)}</span></div>
      <div><span class="label">${t("summaryRemaining")}</span><span class="value" style="color:var(--warning)">${fmtMoney(data.summary.totalRemaining)}</span></div>
    </div>
  `;

  const debtsHtml =
    data.debts.length === 0
      ? `<div class="empty-state">${t("noData")}</div>`
      : data.debts
          .map((d) =>
            renderDebtCard({ ...d, clientId: c.id, client: c.name, clientPhone: c.phone, auditLogs: null }, isAdmin),
          )
          .join("");

  let auditHtml = "";
  if (!isAdmin && data.auditLogs && data.auditLogs.length > 0) {
    auditHtml = `
      <div class="sub-section" style="margin-top:24px">
        <div class="sub-section-title">📋 ${t("auditLogTitle")} <span class="count-pill">${data.auditLogs.length}</span></div>
        ${data.auditLogs
          .map(
            (a) => `
          <div class="audit-row">
            <div class="audit-dot" style="background:${auditColor(a.action)}"></div>
            <div class="audit-info">
              <div><b>${escapeHtml(a.user)}</b> ${escapeHtml(t(actionKey(a.action)))} ${escapeHtml(tableKey(a.tableName))} #${a.recordId}</div>
              <div class="sub-item-meta">${fmtDateTime(a.createdAt)}${a.newValue ? " • " + escapeHtml(truncate(a.newValue, 100)) : ""}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  modalBody.innerHTML = `
    ${warnHtml}
    ${summaryHtml}
    <div class="sub-section-title" style="margin-bottom:12px">📦 ${t("debtsHistory")} <span class="count-pill">${data.debts.length}</span></div>
    ${debtsHtml}
    ${auditHtml}
  `;

  modalBody.querySelectorAll(".item-card.clickable").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".client-link")) return;
      card.classList.toggle("expanded");
      const btn = card.querySelector(".expand-toggle");
      if (btn) {
        btn.textContent = card.classList.contains("expanded") ? t("collapse") : t("expand");
      }
    });
  });
}

function auditColor(action) {
  const css = getComputedStyle(document.documentElement);
  switch (action) {
    case "create":
      return css.getPropertyValue("--success").trim();
    case "update":
      return css.getPropertyValue("--info").trim();
    case "delete":
    case "soft_delete":
      return css.getPropertyValue("--danger").trim();
    case "payment":
      return css.getPropertyValue("--purple").trim();
    case "login":
    case "logout":
      return css.getPropertyValue("--warning").trim();
    default:
      return css.getPropertyValue("--primary").trim();
  }
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Card click bindings
function bindClickableCards() {
  document.querySelectorAll(".stat-card[data-filter]").forEach((card) => {
    if (card.dataset.bound) return;
    card.dataset.bound = "1";
    card.addEventListener("click", () => {
      const filter = card.dataset.filter;
      if (filter) showFilterModal(filter);
    });
  });
}

// Status pill click bindings (added after render)
function bindStatusPills() {
  document.querySelectorAll(".status-pill[data-status]").forEach((pill) => {
    if (pill.dataset.bound) return;
    pill.dataset.bound = "1";
    pill.addEventListener("click", () => {
      const status = pill.dataset.status;
      if (status) showFilterModal("status:" + status);
    });
  });
}

// Top clients click bindings
function bindTopClientRows() {
  document.querySelectorAll("#topClientsBody tr[data-client-id]").forEach((row) => {
    if (row.dataset.bound) return;
    row.dataset.bound = "1";
    row.addEventListener("click", () => {
      const id = Number(row.dataset.clientId);
      if (id) showClientModal(id);
    });
  });
}

// Recent debts row click
function bindRecentDebtRows() {
  document.querySelectorAll("#recentDebtsBody tr[data-client-id]").forEach((row) => {
    if (row.dataset.bound) return;
    row.dataset.bound = "1";
    row.addEventListener("click", () => {
      const id = Number(row.dataset.clientId);
      if (id) showClientModal(id);
    });
  });
}

// Recent payments row click
function bindRecentPaymentRows() {
  document.querySelectorAll("#recentPaymentsBody tr[data-client-id]").forEach((row) => {
    if (row.dataset.bound) return;
    row.dataset.bound = "1";
    row.addEventListener("click", () => {
      const id = Number(row.dataset.clientId);
      if (id) showClientModal(id);
    });
  });
}

// ---------- Boot ----------
async function loadProfiles() {
  try {
    const res = await fetch("/api/profiles");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.profiles = await res.json();
    // viewerId ni mavjud profillarga moslashtirish
    const valid = state.profiles.some((p) => p.id === state.viewerId);
    if (!state.viewerId || !valid) {
      const owner = state.profiles.find((p) => p.role === "owner");
      state.viewerId = owner ? owner.id : state.profiles[0]?.id ?? null;
      if (state.viewerId) localStorage.setItem("viewerId", String(state.viewerId));
    }
  } catch (err) {
    console.error("Profillar yuklashda xatolik:", err);
  }
}

async function loadData() {
  try {
    const url = state.viewerId ? `/api/stats?asUser=${state.viewerId}` : "/api/stats";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
    render(state.data);
  } catch (err) {
    console.error("Stats yuklashda xatolik:", err);
    document.getElementById("totalDebt").textContent = "—";
  }
}

// Tema almashganda chartlarni qayta render qilish
const themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("click", () => {
  setTimeout(() => {
    if (state.data) render(state.data);
  }, 50);
});

(async () => {
  applyTheme();
  applyLang();
  tickTime();
  setInterval(tickTime, 1000);
  await loadProfiles();
  await loadData();
  // 30 soniyada bir ma'lumotlarni yangilash
  setInterval(loadData, 30000);
})();
