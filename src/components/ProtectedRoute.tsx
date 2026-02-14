import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAIL = 'manthanraithatha01@gmail.com';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Resolve effective role, always treating admin email as admin
  const effectiveRole = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : (role ?? 'user');

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    if (effectiveRole === 'admin') return <Navigate to="/admin" replace />;
    if (effectiveRole === 'worker') return <Navigate to="/worker" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
