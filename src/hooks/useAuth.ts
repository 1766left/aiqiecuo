import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  balance: number | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    balance: null,
  });

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/balance');
      if (response.ok) {
        const data = await response.json();
        setState({
          isAuthenticated: true,
          isLoading: false,
          balance: data.balance,
        });
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          balance: null,
        });
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        balance: null,
      });
    }
  };

  const logout = async () => {
    try {
      // 删除所有可能的路径下的 cookie
      const paths = ['/', '/api'];
      const domains = [window.location.hostname, `.${window.location.hostname}`];
      
      paths.forEach(path => {
        domains.forEach(domain => {
          document.cookie = `token=; path=${path}; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Strict`;
          document.cookie = `token=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Strict`;
        });
      });

      // 额外尝试删除没有指定 path 和 domain 的 cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Strict';

      // 调用后端的登出 API
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setState({
        isAuthenticated: false,
        isLoading: false,
        balance: null,
      });

      // 强制刷新页面以清除所有状态
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // 即使出错也强制刷新页面
      window.location.href = '/';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...state,
    checkAuth,
    logout,
  };
}
