# ТЕХНИЧЕСКОЕ ЗАДАНИЕ: Game Zone Qarz — система управления долгами

> **Цель документа**: дать любому AI-ассистенту или разработчику полное, исчерпывающее, неоднозначное задание для реализации системы на 100%. По этому промпту должна получиться готовая к продакшену система без необходимости задавать уточняющие вопросы.

---

## 1. КОНТЕКСТ И ЦЕЛЬ ПРОЕКТА

### Бизнес-задача
Сеть игровых клубов (PlayStation, компьютерные клубы, бильярд) с **несколькими филиалами** нуждается в системе учёта долгов клиентов. Клиенты иногда играют в долг — администратор записывает долг, мониторит срок возврата, фиксирует частичные/полные оплаты. Владелец сети видит сводную картину по всем филиалам, администратор — только по своему.

### Главные требования
1. **Multi-branch (мульти-филиальность)** — система ведёт несколько физических локаций.
2. **RBAC (role-based access control)** — два жёстко разграниченных типа пользователей.
3. **Полный аудит** — ни одно изменение не происходит бесследно.
4. **Soft delete** — нельзя физически удалять долги/клиентов/платежи (только пометить удалёнными). Жёсткое удаление доступно только владельцу с двойным подтверждением.
5. **Уведомления** — через Telegram-бота (для администраторов и владельца, НЕ для клиентов) и через браузерные push-уведомления.
6. **Часовой пояс**: `Asia/Tashkent` (UTC+5). Все даты сохранять в UTC, отображать в локальном времени.
7. **Валюта**: узбекский сум, формат `45 000 so'm` (с разделителями тысяч пробелом).

---

## 2. РОЛИ И ПРАВА (КРИТИЧЕСКИ ВАЖНО)

### Роль 1: `owner` (Владелец)
**Один аккаунт, единственный, не привязан к филиалу.**

Может:
- Видеть **все филиалы**, агрегированные данные, отдельные данные каждого филиала.
- Создавать, редактировать, деактивировать филиалы.
- Создавать, редактировать, деактивировать админов; назначать админа на филиал; сбрасывать пароли.
- Видеть **полный audit log** (журнал аудита) с фильтрацией по пользователю, филиалу, действию, дате.
- Видеть полную историю любого клиента: когда, сколько, в каком филиале занял, как и когда оплатил.
- **Помечать удалёнными** долги/клиентов (soft delete) и **восстанавливать** их.
- **Жёстко удалять** (hard delete) долги/клиентов с двойным подтверждением; запись о hard delete всё равно остаётся в audit log.
- Получать ежедневную сводку в Telegram (доходы по всем филиалам).
- Делать резервные копии БД и скачивать их.
- Видеть статистику адмиков: кто сколько долгов записал, сколько платежей принял.

### Роль 2: `admin` (Администратор)
**Привязан к конкретному филиалу через `branchId`. Может быть несколько админов на филиал.**

Может (только в рамках своего филиала):
- Создавать, редактировать клиентов своего филиала.
- Создавать, редактировать долги своего филиала.
- Записывать платежи (полные/частичные) по долгам своего филиала.
- Видеть статистику и отчёты только своего филиала.
- Помечать удалёнными (soft delete) долги/клиентов своего филиала.
- Получать в Telegram уведомления только по своему филиалу.

**НЕ МОЖЕТ:**
- ❌ Видеть данные других филиалов (даже подменив URL — backend возвращает 403).
- ❌ Видеть audit log (вообще, никогда, ни в каком виде).
- ❌ Делать hard delete.
- ❌ Восстанавливать удалённое (это право только владельца).
- ❌ Создавать пользователей, изменять чужие пароли.
- ❌ Менять привязку клиента к филиалу.

### Жёсткое правило
В БД ни одно изменение долга, клиента, платежа не происходит без записи в `AuditLog`. Это инвариант, который проверяется в тестах.

---

## 3. ТЕХНОЛОГИЧЕСКИЙ СТЕК (фиксированный)

### Backend
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express 4.x + TypeScript 5.x (strict mode)
- **ORM**: Prisma 5.x
- **БД**: SQLite для разработки, PostgreSQL для продакшена. Schema должна работать на обеих без изменений (избегать SQLite-specific трюков).
- **Auth**: `jsonwebtoken` (JWT) + `bcrypt` (12 salt rounds)
- **Валидация**: `zod` (на запросах и в сервисах)
- **Telegram**: `grammY`
- **Cron**: `node-cron`
- **Backup**: `better-sqlite3` или `pg_dump` (в зависимости от БД)
- **Rate limiting**: `express-rate-limit`
- **Логирование**: `pino` (structured logs)
- **HTTP-клиент в сервисах**: `undici` или встроенный `fetch`

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Стили**: TailwindCSS 3.x
- **UI**: shadcn/ui (Radix-based components)
- **Иконки**: `lucide-react`
- **Состояние сервера**: `@tanstack/react-query` (TanStack Query v5)
- **Состояние клиента**: Zustand или React Context (где простое)
- **Роутинг**: `react-router-dom` v6
- **Формы**: `react-hook-form` + `zod` (через `@hookform/resolvers/zod`)
- **Графики**: `recharts` (или Chart.js)
- **Уведомления**: `sonner` (toast)
- **Даты**: `date-fns` + `date-fns-tz`
- **HTTP**: встроенный `fetch` + обёртка с авто-добавлением JWT

### Инфраструктура
- **Сборка фронта**: Vite production build → статика, отдаётся Express'ом или nginx.
- **Среды**: development / staging / production через `NODE_ENV` и отдельные `.env` файлы.
- **Структура**: монорепо с workspaces (`backend/` + `frontend/`).
- **Vendoring**: запрещены `npm link`, локальные тарболы, патчи в `patches/`.
- **Linting**: ESLint + Prettier на обоих пакетах с одинаковой конфигурацией.
- **Type-checking**: `tsc --noEmit` в pre-commit hook (через `husky` + `lint-staged`).

---

## 4. СТРУКТУРА ПРОЕКТА (обязательная)

```
.
├── package.json               # workspaces root
├── README.md
├── PROMPT_RU.md              # этот документ
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .eslintrc.cjs
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts                    # точка входа: bootstrap Express + cron + bot
│   │   ├── config/
│   │   │   ├── env.ts                  # zod-валидация process.env
│   │   │   └── constants.ts
│   │   ├── db/
│   │   │   └── prisma.ts               # singleton PrismaClient
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # JWT, requireOwner, requireAdmin
│   │   │   ├── branchScope.ts          # авто-фильтр по филиалу для admin
│   │   │   ├── audit.ts                # запись в AuditLog
│   │   │   ├── rateLimit.ts
│   │   │   ├── error.ts                # глобальный error handler
│   │   │   └── requestLogger.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.schema.ts      # zod схемы
│   │   │   │   └── auth.routes.ts
│   │   │   ├── branches/
│   │   │   ├── users/
│   │   │   ├── clients/
│   │   │   ├── debts/
│   │   │   ├── payments/
│   │   │   ├── stats/
│   │   │   ├── auditLogs/
│   │   │   ├── backup/
│   │   │   └── telegram/
│   │   ├── jobs/
│   │   │   ├── reminders.job.ts        # cron: ежедневные напоминания
│   │   │   ├── overdue.job.ts          # cron: просроченные
│   │   │   ├── ownerDailySummary.job.ts
│   │   │   ├── backup.job.ts           # cron: ежедневный backup в 03:00
│   │   │   └── statusUpdate.job.ts     # cron: пересчёт overdue статусов
│   │   ├── bot/
│   │   │   ├── bot.ts
│   │   │   ├── commands/
│   │   │   │   ├── start.ts
│   │   │   │   ├── today.ts
│   │   │   │   ├── overdue.ts
│   │   │   │   ├── total.ts
│   │   │   │   ├── stats.ts
│   │   │   │   ├── help.ts
│   │   │   │   └── unlink.ts
│   │   │   └── messages.ts             # форматирование (i18n)
│   │   ├── utils/
│   │   │   ├── date.ts                 # tz, форматирование
│   │   │   ├── money.ts
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── pagination.ts
│   │   │   └── tokenStore.ts           # для linking telegram (10 мин TTL)
│   │   └── types/
│   │       └── express.d.ts            # расширение Request с user
│   └── tests/
│       ├── unit/
│       └── integration/
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    ├── public/
    │   └── service-worker.js           # browser push notifications
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── router.tsx
        ├── api/
        │   ├── client.ts               # fetch wrapper, JWT, error handling
        │   ├── auth.ts
        │   ├── branches.ts
        │   ├── users.ts
        │   ├── clients.ts
        │   ├── debts.ts
        │   ├── payments.ts
        │   ├── stats.ts
        │   └── audit.ts
        ├── components/
        │   ├── ui/                      # shadcn компоненты
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   ├── Topbar.tsx
        │   │   └── ProtectedRoute.tsx
        │   ├── debt/
        │   │   ├── DebtForm.tsx
        │   │   ├── DebtTable.tsx
        │   │   ├── DebtCard.tsx
        │   │   └── DebtStatusBadge.tsx
        │   ├── client/
        │   │   ├── ClientForm.tsx
        │   │   ├── ClientTable.tsx
        │   │   └── ClientCard.tsx
        │   ├── payment/
        │   │   └── PaymentModal.tsx
        │   └── charts/
        │       ├── TimelineChart.tsx
        │       ├── StatusChart.tsx
        │       └── BranchesChart.tsx
        ├── pages/
        │   ├── Login.tsx
        │   ├── owner/
        │   │   ├── Dashboard.tsx
        │   │   ├── Branches.tsx
        │   │   ├── Users.tsx
        │   │   ├── AuditLog.tsx
        │   │   ├── Reports.tsx
        │   │   └── Settings.tsx
        │   ├── admin/
        │   │   └── Dashboard.tsx
        │   └── shared/
        │       ├── Clients.tsx
        │       ├── ClientDetail.tsx
        │       ├── Debts.tsx
        │       ├── DebtDetail.tsx
        │       └── Payments.tsx
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useTheme.ts
        │   ├── useLang.ts
        │   └── useBrowserNotification.ts
        ├── i18n/
        │   ├── index.ts
        │   ├── uz-latn.ts
        │   ├── uz-cyrl.ts
        │   └── ru.ts
        ├── stores/
        │   └── authStore.ts             # Zustand
        └── lib/
            ├── format.ts
            └── tz.ts
```

---

## 5. СХЕМА БАЗЫ ДАННЫХ (Prisma — окончательная)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // в продакшене: "postgresql"
  url      = env("DATABASE_URL")
}

model Branch {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  address   String?
  phone     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  clients   Client[]
  debts     Debt[]
  auditLogs AuditLog[]
}

model User {
  id               Int       @id @default(autoincrement())
  username         String    @unique
  passwordHash     String
  fullName         String
  role             String    // "owner" | "admin"
  branchId         Int?      // null для owner, обязательно для admin
  branch           Branch?   @relation(fields: [branchId], references: [id])
  telegramId       String?   @unique
  telegramUsername String?
  isActive         Boolean   @default(true)
  lastLoginAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  createdDebts     Debt[]    @relation("DebtCreator")
  recordedPayments Payment[] @relation("PaymentRecorder")
  auditLogs        AuditLog[]

  @@index([branchId])
  @@index([role])
}

model Client {
  id          Int       @id @default(autoincrement())
  branchId    Int
  branch      Branch    @relation(fields: [branchId], references: [id])
  name        String
  phone       String
  notes       String?
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  deletedById Int?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  debts       Debt[]

  @@unique([branchId, phone])
  @@index([branchId])
  @@index([phone])
  @@index([isDeleted])
}

model Debt {
  id              Int        @id @default(autoincrement())
  branchId        Int
  branch          Branch     @relation(fields: [branchId], references: [id])
  clientId        Int
  client          Client     @relation(fields: [clientId], references: [id])
  itemType        String     // "playstation" | "computer" | "billiard" | "other"
  itemDetails     String?
  amount          Decimal    // полная сумма долга
  paidAmount      Decimal    @default(0)
  remainingAmount Decimal    // amount - paidAmount; пересчитывается приложением
  borrowedDate    DateTime
  dueDate         DateTime
  status          String     @default("active") // active|partial|paid|overdue|cancelled
  notes           String?
  isDeleted       Boolean    @default(false)
  deletedAt       DateTime?
  deletedById     Int?
  createdById     Int
  createdBy       User       @relation("DebtCreator", fields: [createdById], references: [id])
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  payments        Payment[]
  reminders       Reminder[]

  @@index([branchId])
  @@index([clientId])
  @@index([status])
  @@index([dueDate])
  @@index([isDeleted])
  @@index([createdById])
}

model Payment {
  id           Int      @id @default(autoincrement())
  debtId       Int
  debt         Debt     @relation(fields: [debtId], references: [id])
  amount       Decimal
  method       String   // "cash" | "card" | "transfer"
  paidDate     DateTime
  notes        String?
  recordedById Int
  recordedBy   User     @relation("PaymentRecorder", fields: [recordedById], references: [id])
  createdAt    DateTime @default(now())

  @@index([debtId])
  @@index([paidDate])
  @@index([method])
  @@index([recordedById])
}

model Reminder {
  id        Int      @id @default(autoincrement())
  debtId    Int
  debt      Debt     @relation(fields: [debtId], references: [id])
  channel   String   // "telegram" | "browser"
  recipient String
  sentAt    DateTime @default(now())
  status    String   // "sent" | "failed"
  message   String

  @@index([debtId])
  @@index([sentAt])
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  action    String   // create|update|delete|soft_delete|restore|payment|login|logout|backup
  tableName String
  recordId  Int
  branchId  Int?
  branch    Branch?  @relation(fields: [branchId], references: [id])
  oldValue  String?
  newValue  String?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([branchId])
  @@index([tableName, recordId])
  @@index([createdAt])
  @@index([action])
}
```

### Миграции
- Использовать `prisma migrate dev --name <name>` для разработки.
- Использовать `prisma migrate deploy` для продакшена.
- Никогда не редактировать применённые миграции — создавать новую.

### Seed
Скрипт `prisma/seed.ts` должен создавать:
- 1 owner (`owner` / `owner123`)
- 2 филиала: «Markaziy filial», «Chilonzor filiali»
- 2 admin: `admin1` (Markaziy), `admin2` (Chilonzor), пароль `admin123`
- 6 клиентов (по 3 на филиал)
- 9 долгов с разными статусами (включая overdue, partial, paid)
- 4 платежа разными методами (cash, card, transfer)
- ~30 audit log записей (для каждого create/update/payment/login)
- Сброс sqlite_sequence в начале seed для предсказуемых ID.

---

## 6. AUTH И MIDDLEWARE

### `authMiddleware`
- Извлекает JWT из заголовка `Authorization: Bearer <token>`.
- Верифицирует подпись и срок действия.
- Загружает пользователя из БД (проверяет `isActive`).
- Кладёт в `req.user`: `{ id, username, role, branchId, fullName }`.
- При ошибке — 401 с понятным кодом (`TOKEN_EXPIRED`, `TOKEN_INVALID`, `USER_DISABLED`).

### `requireOwner`
- Если `req.user.role !== "owner"` → 403 с кодом `FORBIDDEN_OWNER_ONLY`.

### `requireAdmin`
- Пропускает `owner` и `admin`. Только `null` → 401.

### `enforceBranchScope`
- Если `req.user.role === "admin"`: к каждому Prisma-запросу автоматически добавляется `branchId: req.user.branchId`.
- Реализуется как helper-функция, оборачивающая `prisma.client.*`.
- Альтернатива: middleware, которое модифицирует `req.scopedWhere` и передаёт в сервис.

### `auditMiddleware`
Не middleware в чистом виде, а сервис `auditService.log({ userId, action, tableName, recordId, oldValue, newValue, branchId, req })`. Вызывается из бизнес-логики каждого мутирующего endpoint'a.

### `errorMiddleware`
Глобальный обработчик. Преобразует:
- `ZodError` → 400 с массивом полей.
- `Prisma.PrismaClientKnownRequestError` (P2002 unique constraint, P2025 not found) → 409/404.
- Custom `AppError(code, status, message)` → status + payload.
- Прочее → 500, логируется через `pino`, клиенту: `{ error: "Internal server error", requestId }`.

### Rate limiting
- `/api/auth/login`: 5 запросов/минуту по IP, ключ `login:<ip>`.
- Все остальные API: 100 запросов/минуту по `req.user.id` (после auth).
- При превышении: 429 + заголовок `Retry-After`.

---

## 7. API ENDPOINTS (полный список)

Ответ всегда JSON. Формат ошибки: `{ error: { code: string, message: string, details?: any } }`.

### Auth
| Method | Path | Auth | Описание |
|--------|------|------|----------|
| POST | `/api/auth/login` | — | `{ username, password, remember? }` → `{ token, user }`. JWT валиден 1 день, при `remember=true` — 30 дней. |
| POST | `/api/auth/logout` | any | пишет в audit log, на клиенте удаляется токен. |
| GET | `/api/auth/me` | any | возвращает текущего пользователя. |

### Branches (только owner)
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/branches` | owner |
| POST | `/api/branches` | owner |
| GET | `/api/branches/:id` | owner |
| PATCH | `/api/branches/:id` | owner |
| POST | `/api/branches/:id/disable` | owner |
| POST | `/api/branches/:id/enable` | owner |

### Users (только owner)
| Method | Path | Описание |
|--------|------|----------|
| GET | `/api/users?role=&branchId=&isActive=` | список |
| POST | `/api/users` | `{ username, password, fullName, role, branchId? }` |
| GET | `/api/users/:id` | детали |
| PATCH | `/api/users/:id` | редактирование (без пароля) |
| POST | `/api/users/:id/password` | сброс пароля |
| POST | `/api/users/:id/disable` | деактивация |
| POST | `/api/users/:id/enable` | активация |

### Clients (branch-scoped)
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/clients?search=&onlyDebtors=&onlyPaid=&branchId=&page=&limit=` | admin/owner |
| POST | `/api/clients` | admin/owner |
| GET | `/api/clients/:id` | admin/owner |
| GET | `/api/clients/:id/history` | admin/owner — полная история |
| PATCH | `/api/clients/:id` | admin/owner |
| POST | `/api/clients/:id/soft-delete` | admin/owner |
| POST | `/api/clients/:id/restore` | owner only |
| DELETE | `/api/clients/:id` | owner only — hard delete с двойным подтверждением (`?confirm=YES_DELETE`) |

### Debts
| Method | Path |
|--------|------|
| GET | `/api/debts?status=&from=&to=&clientId=&branchId=&itemType=&search=&page=&limit=&includeDeleted=` |
| POST | `/api/debts` |
| GET | `/api/debts/:id` |
| PATCH | `/api/debts/:id` |
| POST | `/api/debts/:id/soft-delete` |
| POST | `/api/debts/:id/restore` (owner only) |
| DELETE | `/api/debts/:id?confirm=YES_DELETE` (owner only) |

### Payments
| Method | Path |
|--------|------|
| POST | `/api/debts/:id/payments` |
| GET | `/api/debts/:id/payments` |
| DELETE | `/api/payments/:id` (owner only — отмена ошибочного платежа, обновляет статус долга) |

### Stats
| Method | Path |
|--------|------|
| GET | `/api/stats/dashboard` |
| GET | `/api/stats/branch/:id` |
| GET | `/api/stats/payments?from=&to=&method=&branchId=` |
| GET | `/api/stats/comparison` (owner only) |
| GET | `/api/stats/timeseries?days=30&branchId=` — для графика |

### Audit Log (только owner)
| Method | Path |
|--------|------|
| GET | `/api/audit-logs?userId=&branchId=&action=&tableName=&from=&to=&page=&limit=` |
| GET | `/api/audit-logs/export.xlsx` |

### Telegram
| Method | Path |
|--------|------|
| POST | `/api/telegram/link` — генерирует код, возвращает `{ code, expiresAt }` |
| POST | `/api/telegram/unlink` |

### Backup (только owner)
| Method | Path |
|--------|------|
| POST | `/api/backup/create` |
| GET | `/api/backup/list` |
| GET | `/api/backup/download/:filename` |
| DELETE | `/api/backup/:filename` |

### Notifications (для polling из браузера)
| Method | Path |
|--------|------|
| GET | `/api/notifications/since?ts=<isoDate>` — события с указанного момента |

---

## 8. ЛОГИКА СТАТУСОВ ДОЛГА

Статус хранится в `Debt.status` и пересчитывается:
1. При создании долга: `active`.
2. При записи платежа:
   - `paidAmount + payment >= amount` → `paid`, `remainingAmount = 0`.
   - `paidAmount + payment > 0 && < amount` → `partial`.
3. При cron-задаче `statusUpdate.job` (каждый час):
   - Долги со статусом `active` или `partial`, у которых `dueDate < now` → `overdue`.
4. При откате платежа (DELETE /api/payments/:id): пересчёт по той же логике.
5. При soft-delete: `cancelled`.
6. При restore: пересчёт согласно платежам и dueDate.

---

## 9. ВАЛИДАЦИЯ (Zod схемы)

### Common
- `phone`: regex `^\+998\d{9}$` (узбекский формат). Нормализовать пробелы и дефисы перед проверкой.
- `password`: min 8 символов, включая хотя бы одну букву и одну цифру.
- `username`: `^[a-z0-9_]{3,20}$`, lowercase.
- `amount`: > 0, max 999_999_999, до 2 знаков после запятой.
- `dueDate >= borrowedDate`.

### Pagination
- `page`: >= 1, default 1.
- `limit`: 1..100, default 20.

---

## 10. FRONTEND — ОБЩИЕ ТРЕБОВАНИЯ

### Языки (i18n)
Три языка с переключателем в topbar (сохраняется в `localStorage`):
- **uz-Latn** (узбекский латиница, по умолчанию): `Game Zone Qarz`, `Jami qarz`...
- **uz-Cyrl** (узбекский кириллица): `Гейм Зона Қарз`, `Жами қарз`...
- **ru** (русский): `Game Zone Долги`, `Общий долг`...

Файлы: `src/i18n/uz-latn.ts`, `uz-cyrl.ts`, `ru.ts` — каждый экспортирует объект с одинаковыми ключами. Абсолютно все строки UI берутся через `t("key")`. Никаких хардкоднутых строк.

### Темы
- Светлая (по умолчанию) и тёмная.
- Toggle в topbar, сохраняется в `localStorage`.
- CSS variables через `[data-theme="dark"]` на `<html>`.
- Tailwind: `dark:` варианты через `darkMode: "class"`.

### Адаптивность
- Все страницы должны корректно отображаться от 320px шириной.
- На мобильных: sidebar превращается в выезжающее меню (sheet).
- Таблицы скроллятся горизонтально.

### Формат данных
- Деньги: `45 000 so'm` / `45 000 сум` / `45 000 сўм` (зависит от языка).
- Даты: `dd.MM.yyyy HH:mm` в Asia/Tashkent.
- Телефон: кликабельный `tel:` link.

### UX-инварианты
- При действиях, изменяющих данные: оптимистичные апдейты + rollback при ошибке.
- Все мутации показывают toast (`sonner`): success / error.
- Загрузки — skeleton'ы, не spinner'ы.
- Пустые состояния — иллюстрация + текст + CTA.
- Уход со страницы с несохранёнными данными — confirm.

---

## 11. СТРАНИЦЫ ФРОНТЕНДА (детально)

### `/login`
- Полноэкранная.
- Поля: `username`, `password`, чекбокс `remember`.
- Подсказки об ошибке намеренно неинформативные: «Неверное имя пользователя или пароль».
- При успехе: редирект на `/owner/dashboard` или `/admin/dashboard` в зависимости от роли.

### Layout (после логина)
- Sidebar (collapsible на mobile):
  - Owner: Dashboard, Filiallar, Adminlar, Mijozlar, Qarzlar, To'lovlar, Hisobotlar, Audit Log, Sozlamalar.
  - Admin: Dashboard, Mijozlar, Qarzlar, To'lovlar, Sozlamalar.
- Topbar: имя пользователя (с инициалами в аватаре), название филиала (для admin), переключатель темы, переключатель языка, выход.

### Dashboard (Admin)
- 4 крупные карточки: faol qarzlar, bugun muddati, muddati o'tgan, bu oy to'langan.
- 2 средние карточки: bu oy naqd, bu oy karta.
- Линейный график: добавленные долги vs принятые платежи за 30 дней.
- Доноут: распределение методов оплаты.
- Список: долги с дедлайном сегодня/завтра.
- Все клик-абельно: тап по карточке → отфильтрованный список.

### Dashboard (Owner)
Всё что у admin, плюс:
- Бар-чарт сравнения филиалов.
- TOP-10 крупнейших должников (с филиалом).
- TOP-5 самых активных админов.
- Лента последних audit-событий.
- Селектор «все филиалы / конкретный филиал».

### `/clients` (Mijozlar)
- Таблица с поиском (debounced, 300ms) и фильтрами (только должники, только погасившие, филиал — для owner).
- Колонки: имя, телефон, филиал (owner), активные долги, остаток, последний платёж.
- Кнопка «Yangi mijoz» — открывает модал.
- Клик по строке — переход на `/clients/:id`.
- Bulk select для owner: deactivate selected (с подтверждением).

### `/clients/:id` (карточка клиента)
**Шапка:**
- Большой блок: имя, телефон (tel: link), филиал, ID, дата регистрации, заметка (inline-editable для admin/owner).

**Карточки статистики:**
- Jami olingan, Jami to'langan, Hozirgi qoldiq, O'rtacha qaytarish (kun), naqd vs karta ulushi, oxirgi qarz/to'lov.

**Tabs:**
1. **Qarzlar tarixi** — таблица всех долгов клиента, статус-бэйдж, клик → `/debts/:id`.
2. **To'lovlar tarixi** — таблица всех платежей.
3. **Loglar** — только для owner; плотная лента изменений.

**Кнопки управления:**
- Yangi qarz qo'shish (открывает форму с предзаполненным клиентом).
- Mijozni faolsizlantirish (admin/owner, soft delete).
- Mijozni to'liq o'chirish (только owner, требует ввода имени клиента для подтверждения).

### `/debts` (Qarzlar)
- Таблица с фильтрами: status (multi-select badge), date range, branch (owner), client autocomplete, item type, includeDeleted (owner).
- Сортировка по любой колонке.
- Цветные бэйджи статусов с эмодзи: 🔵 active, 🟡 due-soon, 🔴 overdue, 🟢 paid, 🟠 partial, ⚪ cancelled.
- Quick action: «Yangi to'lov» прямо из строки.

### `/debts/:id` (карточка долга)
- Все детали + клиент-карточка-минимум.
- История платежей (таблица, можно отменить — только owner).
- Кнопка «Yangi to'lov».
- Tab «Audit history» — только owner.
- Кнопки: Tahrirlash, Bekor qilish (soft), Qayta tiklash (owner), To'liq o'chirish (owner с двойным подтверждением).

### Payment modal
- Поля: amount (нельзя ввести > remainingAmount), method (radio: naqd/karta/o'tkazma), paidDate (default: now), notes.
- Превью: «После платежа: 35 000 so'm qoldiq → status: partial».
- При сохранении: optimistic update + invalidate queries `['debt', id]`, `['debts']`, `['stats']`.

### `/owner/audit-logs`
- Таблица с фильтрами: пользователь, филиал, action, tableName, date range.
- Каждая строка раскрывается: показывает diff `oldValue` vs `newValue` через простой JSON-viewer.
- Экспорт: CSV и XLSX.

### `/owner/reports`
- Selector: range, branch.
- 6 типов отчётов:
  1. Daily payments (table + chart)
  2. Payment methods breakdown
  3. Yangi qarzlar
  4. Yopilgan qarzlar
  5. Admins efficiency
  6. Branch comparison
- Кнопки экспорта: PDF, XLSX.

### Settings
**Все:**
- Profile (name, change password).
- Telegram link.
- Notification preferences (toggles).
- Theme (light/dark).
- Language.

**Только owner:**
- Filiallar CRUD.
- Adminlar CRUD + reset password.
- Backup management.
- System (timezone, currency).

---

## 12. TELEGRAM-БОТ

### Linking flow
1. Пользователь в Settings нажимает «Связать Telegram».
2. Backend генерирует 6-значный код, сохраняет в TTL-store на 10 минут (привязан к `userId`).
3. Пользователь идёт в бота, отправляет `/start <code>`.
4. Бот находит код, привязывает `chat.id` к `User.telegramId`. Подтверждает.

### Команды
| Команда | Описание |
|---------|----------|
| `/start <code>` | привязка |
| `/today` | долги, у которых сегодня dueDate |
| `/overdue` | просроченные долги |
| `/total` | сумма активных долгов |
| `/stats` | сводка за сегодня |
| `/help` | список команд |
| `/unlink` | отвязка |

Все ответы локализованы по предпочитаемому языку пользователя.

### Авто-уведомления (cron)
- `09:00` каждый день: каждому admin/owner — список долгов с dueDate=сегодня (только если есть).
- `09:00` каждый день: список просроченных (но не каждый день — раз в 3 дня для одного и того же долга, чтобы не спамить — хранить timestamp последнего напоминания в `Reminder`).
- При создании долга: моментально (если у создателя/owner включено в настройках).
- При полном погашении: моментально (если включено).
- `22:00` каждый день owner: дневная сводка по всем филиалам.

### Формат сообщения (пример)
```
🔔 Bugun muddati tugaydigan qarzlar — Markaziy filial
Jami: 3 ta, 145 000 so'm

1. Aliyev Vali — +998 90 123 45 67
   PlayStation, 50 000 so'm (qoldiq)
   Olingan: 28.04.2026
   Yozgan: admin1
```

---

## 13. БРАУЗЕРНЫЕ УВЕДОМЛЕНИЯ

- При входе пользователя — запрос разрешения через `Notification.requestPermission()`.
- Реализация через Service Worker (`/service-worker.js`) для возможности уведомлять при закрытой вкладке.
- Polling: фронт каждые 60 секунд дёргает `/api/notifications/since?ts=...` и сравнивает.
- Альтернатива: SSE (Server-Sent Events) на `/api/notifications/stream` — предпочтительнее.
- События:
  - Yangi qarz qo'shilganda (admin и owner соответствующего филиала).
  - Bugun muddati tugaydigan — раз в день при первом открытии.
  - Muddati o'tgan paydo bo'lganda.
  - Boshqa admin to'lov yozganda (только для owner).

---

## 14. РЕЗЕРВНОЕ КОПИРОВАНИЕ

- `cron`: каждый день в 03:00 (Asia/Tashkent).
- Имя файла: `backup_YYYY-MM-DD_HHmm.db` (для SQLite) или `.sql` (для PostgreSQL).
- Папка: `BACKUP_DIR` из env (default `./backups`).
- Хранить 30 дней, удалять старые.
- Owner может вручную создать backup и скачать его.
- Каждое создание/удаление backup'а пишется в `AuditLog`.
- При hand-on backup: возможность отправить файл через Telegram-бот владельцу.

---

## 15. БЕЗОПАСНОСТЬ

- Пароли: `bcrypt`, salt rounds = 12.
- JWT secret: минимум 64 случайных символа, в `.env`. Никогда не коммитить.
- HTTPS обязателен в продакшене (cookies HttpOnly если они используются, Secure, SameSite=strict).
- CORS: whitelist через env `CORS_ORIGIN`. Не использовать `*`.
- Helmet middleware с разумными CSP.
- SQL-инъекции: невозможны, т.к. используется Prisma. Запрещено `$queryRawUnsafe` без явного reason+ревью.
- XSS: React escape + запрещено `dangerouslySetInnerHTML` (ESLint правило).
- CSRF: т.к. JWT через заголовок (не cookie) — CSRF неактуален. Если переход на cookie — добавить CSRF-токен.
- Логи никогда не должны содержать `passwordHash`, `JWT_SECRET`, `Authorization` заголовок.
- Все ID в URL валидируются как Number.

---

## 16. ТЕСТИРОВАНИЕ

### Backend
- `vitest` + `supertest` для интеграционных тестов.
- БД для тестов: SQLite в памяти (`file::memory:?cache=shared`).
- Перед каждым тестом — миграции + минимальный seed.
- Покрытие минимум 80% для модулей: auth, branchScope, debts, payments.
- Обязательные тестовые сценарии:
  - admin не может прочитать данные другого филиала (URL hack).
  - admin не может прочитать audit log (403).
  - admin не может выполнить hard delete (403).
  - партиальный платёж корректно меняет статус.
  - двойной платёж не превышает amount.
  - отмена платежа корректно пересчитывает статус.
  - JWT с истёкшим токеном → 401.
  - rate limit: 6-я попытка login → 429.

### Frontend
- `vitest` + `@testing-library/react` + `msw` для мокирования API.
- E2E через Playwright: 5 ключевых сценариев (логин owner, логин admin, создание долга, запись платежа, попытка обхода RBAC через URL).

---

## 17. РАЗВЁРТЫВАНИЕ

### Local development
```
npm install
cp backend/.env.example backend/.env  # отредактировать
npm run db:migrate
npm run db:seed
# В двух терминалах:
npm run dev:backend  # порт 4000
npm run dev:frontend # порт 5173
```

### Production
- Frontend: `npm run build:frontend` → `frontend/dist/` отдаётся nginx.
- Backend: `npm run build:backend` → `backend/dist/`, запуск через `pm2` или systemd.
- Reverse proxy nginx с SSL (Let's Encrypt).
- PostgreSQL 15+ как БД, отдельный сервер.
- Docker Compose файл должен быть в репо (`docker-compose.yml`) для production-like dev.
- CI/CD через GitHub Actions: lint → typecheck → test → build → deploy.

### Переменные окружения (`.env.example`)
```
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
PORT=4000
NODE_ENV=production
TZ=Asia/Tashkent

JWT_SECRET=
JWT_EXPIRES_IN=1d
JWT_EXPIRES_IN_REMEMBER=30d

BCRYPT_SALT_ROUNDS=12

CORS_ORIGIN=https://your-domain.com

TELEGRAM_BOT_TOKEN=
TELEGRAM_OWNER_ID=

BACKUP_DIR=/var/backups/game-zone
BACKUP_RETENTION_DAYS=30

RATE_LIMIT_LOGIN_PER_MINUTE=5
RATE_LIMIT_API_PER_MINUTE=100

LOG_LEVEL=info
```

---

## 18. ПОЭТАПНЫЙ ПЛАН РАБОТ

Реализовать строго по этапам, **после каждого** этапа: запустить тесты, пройти приёмочные критерии, потом переходить к следующему. Не переходить вперёд до полного выполнения текущего.

1. **Foundation** — монорепо, Prisma schema, миграции, seed (1 owner + 2 филиала + 2 admin + клиенты + долги + платежи + audit log).
2. **Auth** — login/logout/me, JWT, role middleware, branch-scope helper, audit-сервис, password validation, rate-limit на login.
3. **Branches & Users API** — owner-only CRUD.
4. **Clients API** — branch-scope, soft delete, история, валидация уникального телефона на филиал.
5. **Debts API** — CRUD, статусы, soft-delete, restore (owner), валидация дат.
6. **Payments API** — частичные/полные платежи, авто-обновление статуса долга, отмена платежа (owner).
7. **Stats API** — dashboard, branch, payments, comparison, timeseries.
8. **Audit Logs API** — query с фильтрами, экспорт XLSX.
9. **Backup API** — auto cron + manual + retention.
10. **Cron jobs** — status update (overdue), reminders, owner daily summary, backup.
11. **Telegram bot** — линковка, все команды, авто-уведомления.
12. **Notifications endpoint** — для браузерных уведомлений (SSE предпочтительно).
13. **Frontend foundation** — Vite + Tailwind + shadcn + i18n + темы + роутинг + auth-store + api-client.
14. **Frontend Login + Layout + ProtectedRoute** + redirect по роли.
15. **Frontend Clients** — таблица, форма, страница клиента с tabs.
16. **Frontend Debts** — таблица, форма, страница долга, цветные статусы.
17. **Frontend Payments** — модал, валидация, optimistic updates.
18. **Frontend Dashboards** — admin + owner с графиками.
19. **Frontend Reports** — все 6 типов + экспорт.
20. **Frontend Audit Log** — owner only, JSON-diff viewer.
21. **Frontend Settings** — профиль, Telegram link, темы, языки + owner-only Branches/Users/Backup CRUD.
22. **Browser notifications** — service worker + permission flow + polling/SSE.
23. **Tests** — backend integration (>=80%), frontend critical paths, Playwright E2E.
24. **Deployment** — Dockerfile, docker-compose, nginx config, CI/CD.

---

## 19. ПРИЁМОЧНЫЕ КРИТЕРИИ (DoD — Definition of Done)

Все должны быть `true` перед сдачей:

✅ **RBAC**:
- Admin одной филиала, перейдя на URL `/clients/<id из другого филиала>`, получает 403, а не 200.
- В headers responseAdmin не приходит ни одного поля, относящегося к чужому филиалу.
- Admin, дёрнув `/api/audit-logs` напрямую, получает 403.
- Admin не может вызвать `DELETE /api/debts/:id` (hard delete) — 403.

✅ **Аудит**:
- Любая мутация (create/update/soft-delete/restore/payment/login/logout/backup) создаёт запись в `AuditLog`.
- В `oldValue` и `newValue` хранится сериализованный JSON изменений.
- Audit log нельзя ни модифицировать, ни удалить через API.

✅ **Soft delete**:
- В обычных списках soft-deleted записи не появляются.
- В owner-режиме можно показать с фильтром `includeDeleted`.
- Restore работает.

✅ **Часовой пояс**:
- Все даты в API — ISO с UTC, на фронте конвертируются в Asia/Tashkent.
- Cron-задачи запускаются по Asia/Tashkent (через `node-cron` с указанием tz).

✅ **Денежные расчёты**:
- Никаких float — Decimal на всех уровнях. На фронте — строка или Decimal.js.
- Платёж > remainingAmount запрещён — 400.
- Сумма всех платежей == paidAmount долга всегда.

✅ **Telegram**:
- Каждое отправленное уведомление пишется в `Reminder` со статусом `sent`/`failed`.
- Спам-защита: одно и то же напоминание о просрочке отправляется не чаще 1 раз в 3 дня.
- Admin одного филиала не получает уведомлений о другом филиале.

✅ **Owner override**:
- Owner может видеть всё, фильтровать по любому филиалу.
- Owner может делать восстановление, hard delete, отмену платежа.
- Owner видит audit log.

✅ **UX**:
- Темы работают и сохраняются.
- 3 языка работают и сохраняются.
- На 320px-устройстве все страницы используемы.
- Нет хардкоднутых текстов вне `i18n`.

✅ **Безопасность**:
- Логи не содержат секретов.
- В git история нет реальных JWT_SECRET, токенов, паролей.
- Headers Helmet выставлены.
- HTTPS в production обязателен (редирект с HTTP).

✅ **Тесты**:
- Все backend integration тесты проходят.
- Coverage по auth/branchScope/debts/payments >= 80%.
- 5 Playwright E2E сценариев зелёные.

✅ **Build**:
- `npm run build` чистый (warnings допустимы только из node_modules).
- `tsc --noEmit` чистый (0 ошибок).
- ESLint без ошибок (warnings допустимы).
- Не остаются `console.log` в production-коде.
- Не остаются `TODO`/`FIXME` без issue в трекере.

---

## 20. ОГРАНИЧЕНИЯ И ЗАПРЕТЫ

- ❌ Не использовать `any` в TypeScript (только в очень редких, прокомментированных местах).
- ❌ Не использовать `JSON.parse(localStorage.getItem(...))` без try/catch.
- ❌ Не использовать `Math.random()` для security-чувствительных вещей (использовать `crypto.randomBytes`).
- ❌ Не использовать `eval`, `Function()`, `new Function`.
- ❌ Не делать миграций, удаляющих колонки с данными, без явного backup-шага.
- ❌ Не коммитить `.env`, `*.db`, `node_modules`, `dist`, `coverage`.
- ❌ Не использовать `dangerouslySetInnerHTML`.
- ❌ Не использовать `--force` флаги (npm, prisma, git push) без необходимости.
- ❌ Не делать API endpoint без zod-валидации входных данных.
- ❌ Не делать write-операции без обновления audit log (CI должен проверять это grep'ом по сервисам).

---

## 21. ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После полной реализации:
- Запуск через `docker-compose up` поднимает PostgreSQL + backend + frontend (nginx).
- На `https://localhost` доступна страница логина.
- Войти `owner/owner123` → видна dashboard со всеми филиалами, графиками, статистикой.
- Войти `admin1/admin123` → видна dashboard только Markaziy filial. Меню без Audit Log, Filiallar, Adminlar.
- Telegram-бот отвечает на `/help`.
- Cron в 09:00 рассылает напоминания.
- В 03:00 создаётся backup.
- README содержит инструкцию по разворачиванию для нового сотрудника.

---

## 22. КАК РАБОТАТЬ С ЭТИМ ПРОМПТОМ

1. Создай ветку `feature/full-system`.
2. Идти строго по этапам из раздела 18.
3. После каждого этапа:
   - Прогнать `npm run lint && npm run typecheck && npm run test`.
   - Закоммитить с осмысленным сообщением (`feat: stage 5 — debts API`).
   - Открыть PR с чек-листом приёмки.
4. После всех 24 этапов — запустить полный E2E прогон, проверить все DoD-критерии.
5. Не переходить к этапу N+1 пока этап N не сдан полностью.
6. Если по ходу работы возникли архитектурные сомнения — НЕ делать допущения; задокументировать в `docs/decisions/<adr-name>.md` и обсудить.

---

**КОНЕЦ ТЗ.**
*Версия 1.0 · Asia/Tashkent · 2026-05-07*
