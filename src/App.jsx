import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const Portfolio = lazy(() => import('./pages/Portfolio'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('@/components/admin/AdminLogin'));

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Portfolio />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<ProtectedRoute unauthenticatedElement={<AdminLogin />} />}>
      <Route path="/admin" element={<Admin />} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
