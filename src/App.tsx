
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { lazy, Suspense } from "react";

// Lazy load pages for code splitting
const LoginPage = lazy(() => import("@/pages/LoginPage").then(module => ({ default: module.LoginPage })));
const OverviewPage = lazy(() => import("@/pages/OverviewPage").then(module => ({ default: module.OverviewPage })));
const HostingPlansPage = lazy(() => import("@/pages/HostingPlansPage").then(module => ({ default: module.HostingPlansPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(module => ({ default: module.ProfilePage })));

// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error && 
            typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
              <div className="animate-pulse text-white">Loading...</div>
            </div>
          }>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <OverviewPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/hosting-plans" element={
                <ProtectedRoute>
                  <Layout>
                    <HostingPlansPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                  <div className="text-white text-center">
                    <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
                    <a href="/" className="text-blue-400 hover:text-blue-300">Return to Overview</a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
