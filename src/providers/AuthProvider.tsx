import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { userAtom, authLoadingAtom } from '../stores/auth';
import { authService } from '../services/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);

  useEffect(() => {
    // 초기 인증 상태 확인
    const initializeAuth = async () => {
      try {
        setAuthLoading(true);
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('인증 초기화 에러:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = authService.onAuthStateChange((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription?.unsubscribe();
    };
  }, [setUser, setAuthLoading]);

  return <>{children}</>;
}
