import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CertificateDetailPage from "./pages/CertificateDetailPage";
import CertificatesPage from "./pages/CertificatesPage";
import DashboardPage from "./pages/DashboardPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import ExternalDigiCertDetailPage from "./pages/ExternalDigiCertDetailPage";
import ExternalDigiCertInventoryPage from "./pages/ExternalDigiCertInventoryPage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/LoginPage";
import NewCertificatePage from "./pages/NewCertificatePage";
import ReportsPage from "./pages/ReportsPage";

function ProtectedPage({ children }: { children: React.ReactElement }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedPage>
            <DashboardPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedPage>
            <CertificatesPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/certificates/new"
        element={<ProtectedPage><NewCertificatePage /></ProtectedPage>}
      />
      <Route
        path="/certificates/:certificateId"
        element={
          <ProtectedPage>
            <CertificateDetailPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/external-digicert"
        element={
          <ProtectedPage>
            <ExternalDigiCertInventoryPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/external-digicert/:orderId"
        element={
          <ProtectedPage>
            <ExternalDigiCertDetailPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/exceptions"
        element={
          <ProtectedPage>
            <ExceptionsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedPage>
            <ReportsPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedPage>
            <JobsPage />
          </ProtectedPage>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
