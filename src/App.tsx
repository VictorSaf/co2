import { Suspense, lazy, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CertificateProvider } from './context/CertificateContext';
import { StatsProvider } from './context/StatsContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import MarketOffersSync from './components/MarketOffersSync';

// Helper function to wrap lazy imports with error handling
const lazyWithRetry = (importFn: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error: any) {
      // If chunk loading fails, reload the page after a delay
      if (
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'ChunkLoadError' ||
        error?.code === 'ERR_FILE_NOT_FOUND'
      ) {
        console.warn('Chunk loading error, reloading page:', error.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        // Return a promise that never resolves to prevent further errors
        return new Promise(() => {});
      }
      throw error;
    }
  });
};

// Lazy load pages for code splitting with error handling
const Login = lazyWithRetry(() => import('./pages/Login'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Market = lazyWithRetry(() => import('./pages/Market'));
const Portfolio = lazyWithRetry(() => import('./pages/Portfolio'));
const Emissions = lazyWithRetry(() => import('./pages/Emissions'));
const About = lazyWithRetry(() => import('./pages/About'));
const MarketAnalysis = lazyWithRetry(() => import('./pages/MarketAnalysis'));
const Documentation = lazyWithRetry(() => import('./pages/Documentation'));
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const ValueCalculator = lazyWithRetry(() => import('./pages/ValueCalculator'));
const Benefits = lazyWithRetry(() => import('./pages/Benefits'));
const MarketOpportunities = lazyWithRetry(() => import('./pages/MarketOpportunities'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Error boundary component for lazy-loaded routes
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; isChunkError: boolean }
> {
  private reloadTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if it's a chunk loading error
    const isChunkError = 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.name === 'ChunkLoadError' ||
      error.message.includes('ChunkLoadError');
    
    return { 
      hasError: true, 
      error,
      isChunkError 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log chunk loading errors but don't show error UI for them
    // These are often transient HMR issues
    if (this.state.isChunkError) {
      console.warn('Chunk loading error (likely HMR issue):', error.message);
      // Clear any existing timeout
      if (this.reloadTimeout) {
        clearTimeout(this.reloadTimeout);
      }
      // Retry by reloading the page - reset state first to prevent error UI flash
      this.setState({ hasError: false, error: null, isChunkError: false });
      this.reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  componentWillUnmount() {
    // Clean up timeout if component unmounts
    if (this.reloadTimeout) {
      clearTimeout(this.reloadTimeout);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  render() {
    // Don't show error UI for chunk errors - they're handled by reload
    if (this.state.hasError && !this.state.isChunkError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Failed to load page
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please refresh the page to try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Try Again
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left max-w-2xl">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, kycStatus } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to onboarding if KYC is not approved
  if (kycStatus && kycStatus !== 'approved') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

// Onboarding route - accessible even if KYC not approved
function OnboardingRoute({ children }: { children: React.ReactNode }) {
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
          <ErrorBoundary>
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
              <Route path="/documentation" element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              } />
              <Route path="/market-analysis" element={
                <ProtectedRoute>
                  <MarketAnalysis />
                </ProtectedRoute>
              } />
              <Route path="/onboarding" element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <OnboardingRoute>
                  <Profile />
                </OnboardingRoute>
              } />
              <Route path="/value-calculator" element={
                <ProtectedRoute>
                  <ValueCalculator />
                </ProtectedRoute>
              } />
              <Route path="/benefits" element={
                <OnboardingRoute>
                  <Benefits />
                </OnboardingRoute>
              } />
              <Route path="/market-opportunities" element={
                <ProtectedRoute>
                  <MarketOpportunities />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <footer className="bg-white dark:bg-gray-800 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t('copyright')} &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CertificateProvider>
          <StatsProvider>
            <MarketOffersSync />
            <AppRoutes />
          </StatsProvider>
        </CertificateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}