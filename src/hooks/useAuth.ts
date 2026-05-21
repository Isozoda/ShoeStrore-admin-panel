import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    console.log('[DEBUG] Login Response Data:', data);
    console.log('[DEBUG] Token exists:', !!data?.accessToken);
    console.log('[DEBUG] Saved User Role:', data?.user?.role);
    console.log('[DEBUG] VITE_API_URL used:', import.meta.env.VITE_API_URL);

    if (data.user.role !== 'ADMIN') {
      console.log('[DEBUG] Access Denied! Role is not ADMIN.');
      throw new Error('no_access');
    }
    
    console.log('[DEBUG] Access Granted! Setting auth and redirecting to dashboard.');
    setAuth(data.user, data.accessToken);
    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    }
    clearAuth();
    navigate('/login');
    toast.success('Муваффақона баромадед');
  };

  return { user, isAuthenticated, login, logout };
}
