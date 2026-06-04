// Sodda i18n tizimi — 4 til: O'zbek (lotin/kiril), Rus, Ingliz.
// Tanlov localStorage'da saqlanadi.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "uz-Latn" | "uz-Cyrl" | "ru" | "en";

export const LANGS: ReadonlyArray<{ code: Lang; name: string; short: string }> = [
  { code: "uz-Latn", name: "O'zbek (Lotin)", short: "UZ" },
  { code: "uz-Cyrl", name: "Ўзбек (Кирилл)", short: "ЎЗ" },
  { code: "ru", name: "Русский", short: "RU" },
  { code: "en", name: "English", short: "EN" },
];

type Dict = Record<Lang, string>;

// Asosiy lug'at — barcha kalitlar bu yerda. Yangi til qo'shilsa,
// faqat shu fayl yangilanadi.
export const dict: Record<string, Dict> = {
  // ---------- Sidebar / nav ----------
  "nav.dashboard": {
    "uz-Latn": "Boshqaruv paneli",
    "uz-Cyrl": "Бошқарув панели",
    ru: "Панель управления",
    en: "Dashboard",
  },
  "nav.clients": {
    "uz-Latn": "Mijozlar",
    "uz-Cyrl": "Мижозлар",
    ru: "Клиенты",
    en: "Clients",
  },
  "nav.debts": {
    "uz-Latn": "Qarzlar",
    "uz-Cyrl": "Қарзлар",
    ru: "Долги",
    en: "Debts",
  },
  "nav.payments": {
    "uz-Latn": "To'lovlar",
    "uz-Cyrl": "Тўловлар",
    ru: "Платежи",
    en: "Payments",
  },
  "nav.reports": {
    "uz-Latn": "Hisobotlar",
    "uz-Cyrl": "Ҳисоботлар",
    ru: "Отчёты",
    en: "Reports",
  },
  "nav.audit": {
    "uz-Latn": "Audit log",
    "uz-Cyrl": "Аудит лог",
    ru: "Журнал аудита",
    en: "Audit log",
  },
  "nav.branches": {
    "uz-Latn": "Filiallar",
    "uz-Cyrl": "Филиаллар",
    ru: "Филиалы",
    en: "Branches",
  },
  "nav.admins": {
    "uz-Latn": "Adminlar",
    "uz-Cyrl": "Админлар",
    ru: "Администраторы",
    en: "Admins",
  },
  "nav.settings": {
    "uz-Latn": "Sozlamalar",
    "uz-Cyrl": "Созламалар",
    ru: "Настройки",
    en: "Settings",
  },

  // ---------- Header ----------
  "header.search": {
    "uz-Latn": "Mijoz, telefon...",
    "uz-Cyrl": "Мижоз, телефон...",
    ru: "Клиент, телефон...",
    en: "Client, phone...",
  },
  "header.theme": {
    "uz-Latn": "Tema",
    "uz-Cyrl": "Тема",
    ru: "Тема",
    en: "Theme",
  },
  "header.language": {
    "uz-Latn": "Til",
    "uz-Cyrl": "Тил",
    ru: "Язык",
    en: "Language",
  },
  "header.logout": {
    "uz-Latn": "Chiqish",
    "uz-Cyrl": "Чиқиш",
    ru: "Выход",
    en: "Logout",
  },
  "header.notifications": {
    "uz-Latn": "Bildirishnomalar",
    "uz-Cyrl": "Билдиришномалар",
    ru: "Уведомления",
    en: "Notifications",
  },
  "header.role.owner": {
    "uz-Latn": "Tarmoq egasi",
    "uz-Cyrl": "Тармоқ эгаси",
    ru: "Владелец сети",
    en: "Network owner",
  },
  "header.serverPaymentDate": {
    "uz-Latn": "Server uchun to'lov kuni",
    "uz-Cyrl": "Сервер учун тўлов куни",
    ru: "День оплаты сервера",
    en: "Server payment date",
  },
  "header.role.admin": {
    "uz-Latn": "Admin",
    "uz-Cyrl": "Админ",
    ru: "Админ",
    en: "Admin",
  },

  // ---------- Common ----------
  "common.save": {
    "uz-Latn": "Saqlash",
    "uz-Cyrl": "Сақлаш",
    ru: "Сохранить",
    en: "Save",
  },
  "common.cancel": {
    "uz-Latn": "Bekor qilish",
    "uz-Cyrl": "Бекор қилиш",
    ru: "Отмена",
    en: "Cancel",
  },
  "common.delete": {
    "uz-Latn": "O'chirish",
    "uz-Cyrl": "Ўчириш",
    ru: "Удалить",
    en: "Delete",
  },
  "common.edit": {
    "uz-Latn": "Tahrirlash",
    "uz-Cyrl": "Таҳрирлаш",
    ru: "Редактировать",
    en: "Edit",
  },
  "common.add": {
    "uz-Latn": "Qo'shish",
    "uz-Cyrl": "Қўшиш",
    ru: "Добавить",
    en: "Add",
  },
  "common.confirm": {
    "uz-Latn": "Tasdiqlash",
    "uz-Cyrl": "Тасдиқлаш",
    ru: "Подтвердить",
    en: "Confirm",
  },
  "common.search": {
    "uz-Latn": "Qidirish",
    "uz-Cyrl": "Қидириш",
    ru: "Поиск",
    en: "Search",
  },
  "common.loading": {
    "uz-Latn": "Yuklanmoqda...",
    "uz-Cyrl": "Юкланмоқда...",
    ru: "Загрузка...",
    en: "Loading...",
  },
  "common.empty": {
    "uz-Latn": "Ma'lumot yo'q",
    "uz-Cyrl": "Маълумот йўқ",
    ru: "Нет данных",
    en: "No data",
  },
  "common.error": {
    "uz-Latn": "Xato",
    "uz-Cyrl": "Хато",
    ru: "Ошибка",
    en: "Error",
  },
  "common.all": {
    "uz-Latn": "Barchasi",
    "uz-Cyrl": "Барчаси",
    ru: "Все",
    en: "All",
  },
  "common.from": {
    "uz-Latn": "Dan",
    "uz-Cyrl": "Дан",
    ru: "С",
    en: "From",
  },
  "common.to": {
    "uz-Latn": "Gacha",
    "uz-Cyrl": "Гача",
    ru: "По",
    en: "To",
  },
  "common.refresh": {
    "uz-Latn": "Yangilash",
    "uz-Cyrl": "Янгилаш",
    ru: "Обновить",
    en: "Refresh",
  },
  "common.download": {
    "uz-Latn": "Yuklab olish",
    "uz-Cyrl": "Юклаб олиш",
    ru: "Скачать",
    en: "Download",
  },
  "common.close": {
    "uz-Latn": "Yopish",
    "uz-Cyrl": "Ёпиш",
    ru: "Закрыть",
    en: "Close",
  },
  "common.details": {
    "uz-Latn": "Tafsilot",
    "uz-Cyrl": "Тафсилот",
    ru: "Подробнее",
    en: "Details",
  },
  "common.online": {
    "uz-Latn": "Online",
    "uz-Cyrl": "Онлайн",
    ru: "Онлайн",
    en: "Online",
  },
  "common.offline": {
    "uz-Latn": "Offline",
    "uz-Cyrl": "Офлайн",
    ru: "Офлайн",
    en: "Offline",
  },

  // ---------- Login ----------
  "login.title": {
    "uz-Latn": "Tizimga kirish",
    "uz-Cyrl": "Тизимга кириш",
    ru: "Вход в систему",
    en: "Sign in",
  },
  "login.username": {
    "uz-Latn": "Login",
    "uz-Cyrl": "Логин",
    ru: "Логин",
    en: "Username",
  },
  "login.password": {
    "uz-Latn": "Parol",
    "uz-Cyrl": "Парол",
    ru: "Пароль",
    en: "Password",
  },
  "login.remember": {
    "uz-Latn": "Meni eslab qol (30 kun)",
    "uz-Cyrl": "Мени эслаб қол (30 кун)",
    ru: "Запомнить меня (30 дней)",
    en: "Remember me (30 days)",
  },
  "login.submit": {
    "uz-Latn": "Kirish",
    "uz-Cyrl": "Кириш",
    ru: "Войти",
    en: "Sign in",
  },
  "login.welcome": {
    "uz-Latn": "Xush kelibsiz",
    "uz-Cyrl": "Хуш келибсиз",
    ru: "Добро пожаловать",
    en: "Welcome",
  },
  "login.required.username": {
    "uz-Latn": "Login majburiy",
    "uz-Cyrl": "Логин мажбурий",
    ru: "Логин обязателен",
    en: "Username is required",
  },
  "login.required.password": {
    "uz-Latn": "Parol majburiy",
    "uz-Cyrl": "Парол мажбурий",
    ru: "Пароль обязателен",
    en: "Password is required",
  },

  // ---------- Audit page ----------
  "audit.title": {
    "uz-Latn": "Audit log",
    "uz-Cyrl": "Аудит лог",
    ru: "Журнал аудита",
    en: "Audit log",
  },
  "audit.description": {
    "uz-Latn": "Tizimdagi barcha o'zgarishlar va kirishlar",
    "uz-Cyrl": "Тизимдаги барча ўзгаришлар ва киришлар",
    ru: "Все изменения и входы в систему",
    en: "All system changes and logins",
  },
  "audit.search.placeholder": {
    "uz-Latn": "Foydalanuvchi, tafsilot bo'yicha qidirish...",
    "uz-Cyrl": "Фойдаланувчи, тафсилот бўйича қидириш...",
    ru: "Поиск по пользователю, описанию...",
    en: "Search by user, description...",
  },
  "audit.filter.action": {
    "uz-Latn": "Barcha amallar",
    "uz-Cyrl": "Барча амаллар",
    ru: "Все действия",
    en: "All actions",
  },
  "audit.filter.table": {
    "uz-Latn": "Barcha jadvallar",
    "uz-Cyrl": "Барча жадваллар",
    ru: "Все таблицы",
    en: "All tables",
  },
  "audit.filter.user": {
    "uz-Latn": "Foydalanuvchi",
    "uz-Cyrl": "Фойдаланувчи",
    ru: "Пользователь",
    en: "User",
  },
  "audit.filter.dateFrom": {
    "uz-Latn": "Sana (dan)",
    "uz-Cyrl": "Сана (дан)",
    ru: "Дата (с)",
    en: "Date from",
  },
  "audit.filter.dateTo": {
    "uz-Latn": "Sana (gacha)",
    "uz-Cyrl": "Сана (гача)",
    ru: "Дата (по)",
    en: "Date to",
  },
  "audit.col.time": {
    "uz-Latn": "Vaqt",
    "uz-Cyrl": "Вақт",
    ru: "Время",
    en: "Time",
  },
  "audit.col.user": {
    "uz-Latn": "Foydalanuvchi",
    "uz-Cyrl": "Фойдаланувчи",
    ru: "Пользователь",
    en: "User",
  },
  "audit.col.action": {
    "uz-Latn": "Amal",
    "uz-Cyrl": "Амал",
    ru: "Действие",
    en: "Action",
  },
  "audit.col.description": {
    "uz-Latn": "Tafsilot",
    "uz-Cyrl": "Тафсилот",
    ru: "Описание",
    en: "Description",
  },
  "audit.col.branch": {
    "uz-Latn": "Filial",
    "uz-Cyrl": "Филиал",
    ru: "Филиал",
    en: "Branch",
  },
  "audit.col.ip": {
    "uz-Latn": "IP",
    "uz-Cyrl": "IP",
    ru: "IP",
    en: "IP",
  },
  "audit.empty": {
    "uz-Latn": "Audit yozuvlari yo'q",
    "uz-Cyrl": "Аудит ёзувлари йўқ",
    ru: "Записей аудита нет",
    en: "No audit records",
  },
  "audit.details.old": {
    "uz-Latn": "Eski qiymat",
    "uz-Cyrl": "Эски қиймат",
    ru: "Старое значение",
    en: "Old value",
  },
  "audit.details.new": {
    "uz-Latn": "Yangi qiymat",
    "uz-Cyrl": "Янги қиймат",
    ru: "Новое значение",
    en: "New value",
  },
  "audit.details.metadata": {
    "uz-Latn": "Metama'lumot",
    "uz-Cyrl": "Метамаълумот",
    ru: "Метаданные",
    en: "Metadata",
  },
  "audit.export": {
    "uz-Latn": "Excel'ga eksport",
    "uz-Cyrl": "Excel'га експорт",
    ru: "Экспорт в Excel",
    en: "Export to Excel",
  },

  // ---------- Audit actions / tables ----------
  "audit.action.create": { "uz-Latn": "qo'shdi", "uz-Cyrl": "қўшди", ru: "добавил(а)", en: "added" },
  "audit.action.update": { "uz-Latn": "tahrirladi", "uz-Cyrl": "таҳрирлади", ru: "изменил(а)", en: "updated" },
  "audit.action.delete": { "uz-Latn": "o'chirdi", "uz-Cyrl": "ўчирди", ru: "удалил(а)", en: "deleted" },
  "audit.action.soft_delete": { "uz-Latn": "arxivga ko'chirdi", "uz-Cyrl": "архивга кўчирди", ru: "архивировал(а)", en: "archived" },
  "audit.action.restore": { "uz-Latn": "tikladi", "uz-Cyrl": "тиклади", ru: "восстановил(а)", en: "restored" },
  "audit.action.payment": { "uz-Latn": "to'lov yozdi", "uz-Cyrl": "тўлов ёзди", ru: "записал(а) платёж", en: "recorded payment" },
  "audit.action.login": { "uz-Latn": "tizimga kirdi", "uz-Cyrl": "тизимга кирди", ru: "вошёл(а) в систему", en: "signed in" },
  "audit.action.logout": { "uz-Latn": "tizimdan chiqdi", "uz-Cyrl": "тизимдан чиқди", ru: "вышел(а) из системы", en: "signed out" },
  "audit.action.backup": { "uz-Latn": "backup yaratdi", "uz-Cyrl": "бэкап яратди", ru: "создал(а) бэкап", en: "created backup" },

  "audit.table.User": { "uz-Latn": "foydalanuvchi", "uz-Cyrl": "фойдаланувчи", ru: "пользователь", en: "user" },
  "audit.table.Client": { "uz-Latn": "mijoz", "uz-Cyrl": "мижоз", ru: "клиент", en: "client" },
  "audit.table.Debt": { "uz-Latn": "qarz", "uz-Cyrl": "қарз", ru: "долг", en: "debt" },
  "audit.table.Payment": { "uz-Latn": "to'lov", "uz-Cyrl": "тўлов", ru: "платёж", en: "payment" },
  "audit.table.Branch": { "uz-Latn": "filial", "uz-Cyrl": "филиал", ru: "филиал", en: "branch" },
  "audit.table.AppSetting": { "uz-Latn": "sozlama", "uz-Cyrl": "созлама", ru: "настройка", en: "setting" },
  "audit.table.Database": { "uz-Latn": "baza", "uz-Cyrl": "база", ru: "база", en: "database" },
  "audit.table.Export": { "uz-Latn": "eksport", "uz-Cyrl": "экспорт", ru: "экспорт", en: "export" },

  // ---------- Notifications ----------
  "notif.title": {
    "uz-Latn": "Bildirishnomalar",
    "uz-Cyrl": "Билдиришномалар",
    ru: "Уведомления",
    en: "Notifications",
  },
  "notif.empty": {
    "uz-Latn": "Yangi bildirishnomalar yo'q",
    "uz-Cyrl": "Янги билдиришномалар йўқ",
    ru: "Новых уведомлений нет",
    en: "No new notifications",
  },
  "notif.empty.hint": {
    "uz-Latn": "Hammasi joyida — eslatib turamiz",
    "uz-Cyrl": "Ҳаммаси жойида — эслатиб турамиз",
    ru: "Всё в порядке — мы напомним",
    en: "All clear — we'll remind you",
  },
  "notif.tab.urgent": {
    "uz-Latn": "Muddat",
    "uz-Cyrl": "Муддат",
    ru: "Срок",
    en: "Due",
  },
  "notif.tab.activity": {
    "uz-Latn": "Faollik",
    "uz-Cyrl": "Фаоллик",
    ru: "Активность",
    en: "Activity",
  },
  "notif.tab.stale": {
    "uz-Latn": "Eski",
    "uz-Cyrl": "Эски",
    ru: "Давние",
    en: "Stale",
  },
  "notif.tab.large": {
    "uz-Latn": "Katta",
    "uz-Cyrl": "Катта",
    ru: "Крупные",
    en: "Large",
  },
  "notif.urgency.overdue": {
    "uz-Latn": "Muddati o'tgan",
    "uz-Cyrl": "Муддати ўтган",
    ru: "Просрочен",
    en: "Overdue",
  },
  "notif.urgency.today": {
    "uz-Latn": "Bugun muddati",
    "uz-Cyrl": "Бугун муддати",
    ru: "Срок сегодня",
    en: "Due today",
  },
  "notif.urgency.soon": {
    "uz-Latn": "Yaqin orada",
    "uz-Cyrl": "Яқин орада",
    ru: "Скоро",
    en: "Soon",
  },
  "notif.activity.debt": {
    "uz-Latn": "Yangi qarz",
    "uz-Cyrl": "Янги қарз",
    ru: "Новый долг",
    en: "New debt",
  },
  "notif.activity.payment": {
    "uz-Latn": "To'lov qabul qilindi",
    "uz-Cyrl": "Тўлов қабул қилинди",
    ru: "Платёж принят",
    en: "Payment received",
  },
  "notif.activity.client": {
    "uz-Latn": "Yangi mijoz",
    "uz-Cyrl": "Янги мижоз",
    ru: "Новый клиент",
    en: "New client",
  },
  "notif.stale.label": {
    "uz-Latn": "kundan beri to'lov yo'q",
    "uz-Cyrl": "кундан бери тўлов йўқ",
    ru: "дней без платежей",
    en: "days without payment",
  },
  "notif.large.label": {
    "uz-Latn": "Katta qoldiq",
    "uz-Cyrl": "Катта қолдиқ",
    ru: "Большой остаток",
    en: "Large balance",
  },
  "notif.markRead": {
    "uz-Latn": "O'qildi deb belgilash",
    "uz-Cyrl": "Ўқилди деб белгилаш",
    ru: "Пометить прочитанным",
    en: "Mark as read",
  },
  "notif.markAllRead": {
    "uz-Latn": "Hammasini o'qildi",
    "uz-Cyrl": "Ҳаммасини ўқилди",
    ru: "Прочитать всё",
    en: "Mark all read",
  },
  "notif.snooze": {
    "uz-Latn": "Vaqtincha yashirish",
    "uz-Cyrl": "Вақтинча яшириш",
    ru: "Отложить",
    en: "Snooze",
  },
  "notif.snooze.1h": {
    "uz-Latn": "1 soatga",
    "uz-Cyrl": "1 соатга",
    ru: "На 1 час",
    en: "1 hour",
  },
  "notif.snooze.4h": {
    "uz-Latn": "4 soatga",
    "uz-Cyrl": "4 соатга",
    ru: "На 4 часа",
    en: "4 hours",
  },
  "notif.snooze.24h": {
    "uz-Latn": "24 soatga",
    "uz-Cyrl": "24 соатга",
    ru: "На сутки",
    en: "24 hours",
  },
  "notif.openClient": {
    "uz-Latn": "Mijozga o'tish",
    "uz-Cyrl": "Мижозга ўтиш",
    ru: "Открыть клиента",
    en: "Open client",
  },
  "notif.callClient": {
    "uz-Latn": "Qo'ng'iroq qilish",
    "uz-Cyrl": "Қўнғироқ қилиш",
    ru: "Позвонить",
    en: "Call",
  },
  "notif.copyPhone": {
    "uz-Latn": "Telefonni nusxalash",
    "uz-Cyrl": "Телефонни нусхалаш",
    ru: "Скопировать телефон",
    en: "Copy phone",
  },
  "notif.settings": {
    "uz-Latn": "Bildirishnoma sozlamalari",
    "uz-Cyrl": "Билдиришнома созламалари",
    ru: "Настройки уведомлений",
    en: "Notification settings",
  },
  "notif.settings.sound": {
    "uz-Latn": "Yangi bildirishnoma kelganda ovoz",
    "uz-Cyrl": "Янги билдиришнома келганда овоз",
    ru: "Звук при новом уведомлении",
    en: "Sound on new notification",
  },
  "notif.settings.browser": {
    "uz-Latn": "Brauzer bildirishnomalari",
    "uz-Cyrl": "Браузер билдиришномалари",
    ru: "Уведомления браузера",
    en: "Browser notifications",
  },
  "notif.settings.browser.hint": {
    "uz-Latn": "Tab yopiq bo'lsa ham ko'rsatadi (ruxsat so'raladi)",
    "uz-Cyrl": "Таб ёпиқ бўлса ҳам кўрсатади (рухсат сўралади)",
    ru: "Покажет даже когда вкладка закрыта (запросит разрешение)",
    en: "Shows even when tab is closed (asks permission)",
  },
  "notif.settings.refresh": {
    "uz-Latn": "Yangilash davriyligi",
    "uz-Cyrl": "Янгилаш даврийлиги",
    ru: "Частота обновления",
    en: "Refresh interval",
  },
  "notif.detail.title": {
    "uz-Latn": "Bildirishnoma tafsiloti",
    "uz-Cyrl": "Билдиришнома тафсилоти",
    ru: "Подробности уведомления",
    en: "Notification details",
  },
  "notif.detail.createdAt": {
    "uz-Latn": "Yozilgan vaqt",
    "uz-Cyrl": "Ёзилган вақт",
    ru: "Время записи",
    en: "Recorded at",
  },
  "notif.detail.dueDate": {
    "uz-Latn": "Qaytarish muddati",
    "uz-Cyrl": "Қайтариш муддати",
    ru: "Срок возврата",
    en: "Due date",
  },
  "notif.detail.recordedBy": {
    "uz-Latn": "Yozgan",
    "uz-Cyrl": "Ёзган",
    ru: "Записал",
    en: "Recorded by",
  },
  "notif.detail.amount": {
    "uz-Latn": "Summa",
    "uz-Cyrl": "Сумма",
    ru: "Сумма",
    en: "Amount",
  },
  "notif.detail.remaining": {
    "uz-Latn": "Qoldiq",
    "uz-Cyrl": "Қолдиқ",
    ru: "Остаток",
    en: "Remaining",
  },
  "notif.detail.method": {
    "uz-Latn": "Usul",
    "uz-Cyrl": "Усул",
    ru: "Способ",
    en: "Method",
  },
  "notif.detail.item": {
    "uz-Latn": "Xizmat",
    "uz-Cyrl": "Хизмат",
    ru: "Услуга",
    en: "Item",
  },

  // Relative time
  "time.justNow": {
    "uz-Latn": "hozirgina",
    "uz-Cyrl": "ҳозиргина",
    ru: "только что",
    en: "just now",
  },
  "time.minutesAgo": {
    "uz-Latn": "daqiqa oldin",
    "uz-Cyrl": "дақиқа олдин",
    ru: "мин. назад",
    en: "min ago",
  },
  "time.hoursAgo": {
    "uz-Latn": "soat oldin",
    "uz-Cyrl": "соат олдин",
    ru: "ч. назад",
    en: "h ago",
  },
  "time.daysAgo": {
    "uz-Latn": "kun oldin",
    "uz-Cyrl": "кун олдин",
    ru: "дн. назад",
    en: "d ago",
  },
  "time.inMinutes": {
    "uz-Latn": "daqiqadan keyin",
    "uz-Cyrl": "дақиқадан кейин",
    ru: "через мин.",
    en: "in min",
  },
  "time.inHours": {
    "uz-Latn": "soatdan keyin",
    "uz-Cyrl": "соатдан кейин",
    ru: "через ч.",
    en: "in h",
  },
  "time.inDays": {
    "uz-Latn": "kundan keyin",
    "uz-Cyrl": "кундан кейин",
    ru: "через дн.",
    en: "in d",
  },

  // ---------- Status ----------
  "status.active": { "uz-Latn": "Faol", "uz-Cyrl": "Фаол", ru: "Активный", en: "Active" },
  "status.partial": { "uz-Latn": "Qisman", "uz-Cyrl": "Қисман", ru: "Частичный", en: "Partial" },
  "status.paid": { "uz-Latn": "To'liq to'langan", "uz-Cyrl": "Тўлиқ тўланган", ru: "Оплачен", en: "Paid" },
  "status.overdue": { "uz-Latn": "Muddati o'tgan", "uz-Cyrl": "Муддати ўтган", ru: "Просрочен", en: "Overdue" },
  "status.cancelled": { "uz-Latn": "Bekor qilingan", "uz-Cyrl": "Бекор қилинган", ru: "Отменён", en: "Cancelled" },

  // ---------- Settings ----------
  "settings.title": { "uz-Latn": "Sozlamalar", "uz-Cyrl": "Созламалар", ru: "Настройки", en: "Settings" },
  "settings.systemName": { "uz-Latn": "Tizim nomi", "uz-Cyrl": "Тизим номи", ru: "Название системы", en: "System name" },
  "settings.systemSubtitle": { "uz-Latn": "Sub-sarlavha", "uz-Cyrl": "Суб-сарлавҳа", ru: "Подзаголовок", en: "Subtitle" },
  "settings.logo": { "uz-Latn": "Logo", "uz-Cyrl": "Лого", ru: "Логотип", en: "Logo" },
  "settings.color": { "uz-Latn": "Asosiy rang", "uz-Cyrl": "Асосий ранг", ru: "Основной цвет", en: "Primary color" },
  "settings.language": { "uz-Latn": "Til", "uz-Cyrl": "Тил", ru: "Язык", en: "Language" },
  "settings.backup.title": { "uz-Latn": "Zaxira nusxa", "uz-Cyrl": "Заҳира нусха", ru: "Резервная копия", en: "Backup" },
  "settings.backup.description": {
    "uz-Latn": "Server o'chsa ham qarzdorlar ma'lumotlari saqlangan bo'lsin uchun davriy ravishda JSON snapshot oling.",
    "uz-Cyrl": "Сервер ўчса ҳам қарздорлар маълумотлари сақланган бўлсин учун даврий равишда JSON снапшот олинг.",
    ru: "Регулярно делайте JSON-снимок, чтобы данные о должниках сохранялись даже при сбое сервера.",
    en: "Regularly download a JSON snapshot so debtor data is preserved even if the server is down.",
  },
  "settings.backup.download": {
    "uz-Latn": "Snapshot yuklab olish (.json)",
    "uz-Cyrl": "Снапшот юклаб олиш (.json)",
    ru: "Скачать снимок (.json)",
    en: "Download snapshot (.json)",
  },
  "settings.cache.label": {
    "uz-Latn": "Brauzer keshida saqlangan",
    "uz-Cyrl": "Браузер кешида сақланган",
    ru: "Сохранено в кэше браузера",
    en: "Cached in browser",
  },
  "settings.cache.never": {
    "uz-Latn": "Hech qachon",
    "uz-Cyrl": "Ҳеч қачон",
    ru: "Никогда",
    en: "Never",
  },
  "settings.cache.clear": {
    "uz-Latn": "Keshni tozalash",
    "uz-Cyrl": "Кешни тозалаш",
    ru: "Очистить кэш",
    en: "Clear cache",
  },
  "settings.serverPaymentDate.title": {
    "uz-Latn": "Server to'lovi",
    "uz-Cyrl": "Сервер тўлови",
    ru: "Оплата сервера",
    en: "Server payment",
  },
  "settings.serverPaymentDate.description": {
    "uz-Latn": "Server uchun keyingi to'lov sanasini belgilang. Bu sana barcha adminlar uchun yuqori panelda ko'rinadi.",
    "uz-Cyrl": "Сервер учун кейинги тўлов санасини белgilанг. Бу сана барча админлар учун юқори панелда кўринади.",
    ru: "Укажите дату следующей оплаты сервера. Она будет видна всем администраторам в верхней панели.",
    en: "Set the next server payment date. It will be visible to all admins in the top bar.",
  },
  "settings.serverPaymentDate.label": {
    "uz-Latn": "To'lov sanasi",
    "uz-Cyrl": "Тўлов санаси",
    ru: "Дата оплаты",
    en: "Payment date",
  },
};

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "uz-Latn",
      setLang: (lang) => set({ lang }),
    }),
    { name: "gz-lang" },
  ),
);

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return {
    lang,
    t: (key: string, fallback?: string) => {
      const entry = dict[key];
      if (!entry) return fallback ?? key;
      return entry[lang] ?? entry["uz-Latn"] ?? key;
    },
  };
}
