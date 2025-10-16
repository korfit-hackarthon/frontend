import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { userAtom, authLoadingAtom } from '../stores/auth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/utils/axios';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const location = useLocation();
  const { t } = useTranslation();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // 프로필 체크
  useEffect(() => {
    const checkProfile = async () => {
      // 사용자가 로그인되어 있고, profile-setup 페이지가 아닌 경우에만 프로필 체크
      if (user && location.pathname !== '/profile-setup') {
        try {
          setProfileLoading(true);
          setHasProfile(null); // 상태 초기화
          const response = await api.get('/api/basic-info');

          if (response.data === null) {
            setHasProfile(false);
          } else {
            setHasProfile(true);
          }
        } catch (error) {
          console.error('프로필 체크 에러:', error);
          setHasProfile(false);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
        setHasProfile(null); // profile-setup 페이지에서는 상태 초기화
      }
    };

    if (!authLoading) {
      checkProfile();
    }
  }, [user, location.pathname, authLoading]);

  // 인증 로딩 중일 때
  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p className='text-lg'>{t('auth.verifying')}</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // 프로필 로딩 중일 때 (profile-setup 페이지가 아닌 경우에만)
  if (location.pathname !== '/profile-setup' && profileLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p className='text-lg'>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // 프로필이 설정되지 않았고 현재 페이지가 profile-setup이 아니면 profile-setup으로 리디렉션
  if (hasProfile === false && location.pathname !== '/profile-setup') {
    return <Navigate to='/profile-setup' replace />;
  }

  // 모든 조건을 만족하면 요청한 컴포넌트 렌더링
  return <>{children}</>;
}
