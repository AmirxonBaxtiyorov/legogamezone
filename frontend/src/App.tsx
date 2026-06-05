import { Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { DebtsPage } from "./pages/DebtsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { UsersPage } from "./pages/UsersPage";
import { AuditPage } from "./pages/AuditPage";
import { SettingsPage } from "./pages/SettingsPage";
import { BranchesPage } from "./pages/BranchesPage";
import { AdminsPage } from "./pages/AdminsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OwnerOnly } from "./components/OwnerOnly";
import { AppLayout } from "./components/layout/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route
          path="/reports"
          element={<OwnerOnly><ReportsPage /></OwnerOnly>}
        />
        <Route
          path="/transactions"
          element={<OwnerOnly><TransactionsPage /></OwnerOnly>}
        />
        <Route
          path="/users"
          element={<OwnerOnly><UsersPage /></OwnerOnly>}
        />
        <Route
          path="/audit"
          element={<OwnerOnly><AuditPage /></OwnerOnly>}
        />
        <Route
          path="/settings"
          element={<OwnerOnly><SettingsPage /></OwnerOnly>}
        />
        <Route
          path="/branches"
          element={<OwnerOnly><BranchesPage /></OwnerOnly>}
        />
        <Route
          path="/admins"
          element={<OwnerOnly><AdminsPage /></OwnerOnly>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
