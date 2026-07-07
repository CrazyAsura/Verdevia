import { useState } from 'react';
import { useDispatch } from 'react-redux';
import UsersService from '../services/users.service';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

/**
 * useAuth — centralized authentication hook for mobile.
 *
 * Handles login/logout with the real backend, persisting credentials
 * in the Redux store (which is persisted via redux-persist + AsyncStorage).
 */
export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await UsersService.login(email, password);
      dispatch(setCredentials({ user, token }));
      return true;
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        'Falha ao autenticar. Verifique suas credenciais.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return { login, logout, loading, error };
}
