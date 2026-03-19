import { Link, Navigate, Route, Routes } from "react-router-dom";
import { CardListPage } from "../features/cards/CardListPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { FocusListsPage } from "../features/dashboard/FocusListsPage";
import { ReviewScreen } from "../features/review/ReviewScreen";

export function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-4 py-3">
        <nav className="flex flex-wrap gap-4 text-sm font-medium" aria-label="main navigation">
          <Link to="/">Dashboard</Link>
          <Link to="/review">Review</Link>
          <Link to="/cards">Cards</Link>
          <Link to="/focus">Focus Lists</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/cards" element={<CardListPage />} />
          <Route path="/focus" element={<FocusListsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
