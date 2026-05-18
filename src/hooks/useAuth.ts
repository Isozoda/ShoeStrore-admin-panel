import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    if (data.user.role !== 'ADMIN') {
      throw new Error('no_access');
    }
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
