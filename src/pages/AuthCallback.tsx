import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { userAtom, authLoadingAtom } from '../stores/auth';
import { supabase } from '../utils/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [, setUser] = useAtom(userAtom);
  const [, setAuthLoading] = useAtom(authLoadingAtom);
  const { t } = useTranslation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setAuthLoading(true);

        // URL 해시 프래그먼트에서 토큰 정보 추출
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // 토큰으로 세션 설정
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

          if (sessionError) {
            console.error('세션 설정 에러:', sessionError);
            navigate('/login');
            return;
          }

          if (sessionData.session?.user) {
            setUser(sessionData.session.user);
            // URL 해시 제거하고 대시보드로 이동
            window.history.replaceState({}, document.title, '/dashboard');
            navigate('/dashboard');
            return;
          }
        }

        // 기존 세션 확인
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('세션 조회 에러:', error);
          navigate('/login');
          return;
        }

        if (data.session?.user) {
          setUser(data.session.user);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('인증 처리 에러:', error);
        navigate('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, setUser, setAuthLoading]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4' />
        <p className='text-lg'>{t('auth.processing')}</p>
        <p className='text-sm text-gray-500 mt-2'>{t('auth.verifying')}</p>
      </div>
    </div>
  );
}
