import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userAtom, authLoadingAtom } from '../stores/auth';
import { Button } from '../components/ui/button';
import { Loader2, Github } from 'lucide-react';
import { authService } from '../services/auth';

// Google 아이콘 컴포넌트
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      fill='#4285F4'
      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
    />
    <path
      fill='#34A853'
      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
    />
    <path
      fill='#FBBC05'
      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
    />
    <path
      fill='#EA4335'
      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
    />
  </svg>
);

export default function Welcome() {
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 로그인된 사용자는 자동으로 대시보드로 리디렉션
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google 로그인 에러:', error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await authService.signInWithGitHub();
    } catch (error) {
      console.error('GitHub 로그인 에러:', error);
    }
  };

  // 로딩 중이거나 로그인된 사용자는 로딩 화면 표시
  if (authLoading || user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white'>
        <div className='text-center space-y-6'>
          {/* Kuüide 로고 */}
          <div className='space-y-2'>
            <h1 className='text-5xl font-bold text-blue-600'>Kuüide</h1>
            <p className='text-gray-600 text-sm'>
              One solution for foreigners'
            </p>
            <p className='text-gray-600 text-sm'>
              administrative issues and language barriers
            </p>
          </div>

          <div className='flex items-center justify-center space-x-2 mt-8'>
            <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
            <span className='text-gray-600'>{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white px-4'>
      <div className='w-full max-w-sm'>
        {/* Kuüide 브랜딩 섹션 */}
        <div className='text-center space-y-4 mb-12'>
          <h1 className='text-6xl font-bold text-blue-600'>Kuüide</h1>
          <div className='space-y-1'>
            <p className='text-gray-600 text-sm font-medium'>
              One solution for foreigners'
            </p>
            <p className='text-gray-600 text-sm font-medium'>
              administrative issues and language barriers
            </p>
          </div>
        </div>

        {/* 로그인 섹션 */}
        <div className='space-y-3'>
          <Button
            onClick={handleGoogleLogin}
            className='w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm'
            variant='outline'
          >
            <GoogleIcon className='w-5 h-5 mr-3' />
            <span className='font-medium'>
              {t('auth.continueWithGoogle', 'Google로 로그인')}
            </span>
          </Button>

          <Button
            onClick={handleGitHubLogin}
            className='w-full h-12 bg-gray-900 text-white hover:bg-gray-800 rounded-lg shadow-sm'
            variant='default'
          >
            <Github className='w-5 h-5 mr-3' />
            <span className='font-medium'>
              {t('auth.githubLogin', 'GitHub으로 로그인')}
            </span>
          </Button>
        </div>

        {/* 푸터 텍스트 */}
        <div className='text-center mt-8'>
          <p className='text-xs text-gray-500'>
            {t(
              'auth.termsText',
              '로그인하면 서비스 이용약관에 동의하게 됩니다'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
