import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CertificateProvider } from './context/CertificateContext';
import { StatsProvider } from './context/StatsContext';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import MarketOffersSync from './components/MarketOffersSync';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Market = lazy(() => import('./pages/Market'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Emissions = lazy(() => import('./pages/Emissions'));
const About = lazy(() => import('./pages/About'));
const MarketAnalysis = lazy(() => import('./pages/MarketAnalysis'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/market" element={
                <ProtectedRoute>
                  <Market />
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              } />
              <Route path="/emissions" element={
                <ProtectedRoute>
                  <Emissions />
                </ProtectedRoute>
              } />
              <Route path="/about" element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              } />
              <Route path="/market-analysis" element={
                <ProtectedRoute>
                  <MarketAnalysis />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="bg-white py-4 text-center text-sm text-gray-500">
          {t('copyright')} &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CertificateProvider>
        <StatsProvider>
          <MarketOffersSync />
          <AppRoutes />
        </StatsProvider>
      </CertificateProvider>
    </AuthProvider>
  );
}