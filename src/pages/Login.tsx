import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { authService } from '../services/auth';
import { Github, Loader2 } from 'lucide-react';

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

type LoginProvider = 'github' | 'google' | null;

export default function Login() {
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider>(null);
  const { t } = useTranslation();

  const handleGitHubLogin = async () => {
    try {
      setLoadingProvider('github');
      await authService.signInWithGitHub();
      // OAuth 리디렉션이 일어나므로 여기서는 별도 처리 불필요
    } catch (error) {
      console.error('GitHub 로그인 에러:', error);
      alert(t('auth.loginError'));
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingProvider('google');
      await authService.signInWithGoogle();
      // OAuth 리디렉션이 일어나므로 여기서는 별도 처리 불필요
    } catch (error) {
      console.error('Google 로그인 에러:', error);
      alert(t('auth.loginError'));
      setLoadingProvider(null);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center space-y-2'>
          <CardTitle className='text-2xl font-bold'>
            {t('auth.welcome')}
          </CardTitle>
          <CardDescription>{t('auth.loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* GitHub 로그인 버튼 */}
          <Button
            onClick={handleGitHubLogin}
            disabled={loadingProvider !== null}
            className='w-full h-11 text-base font-medium bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700'
            variant='default'
          >
            {loadingProvider === 'github' ? (
              <>
                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                {t('auth.processing')}
              </>
            ) : (
              <>
                <Github className='w-5 h-5 mr-2' />
                {t('auth.githubLogin')}
              </>
            )}
          </Button>

          {/* 구분선 */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                {t('common.or')}
              </span>
            </div>
          </div>

          {/* Google 로그인 버튼 */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loadingProvider !== null}
            className='w-full h-11 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-100 dark:hover:bg-gray-200'
            variant='outline'
          >
            {loadingProvider === 'google' ? (
              <>
                <Loader2 className='w-5 h-5 mr-2 animate-spin text-gray-600' />
                {t('auth.processing')}
              </>
            ) : (
              <>
                <GoogleIcon className='w-5 h-5 mr-2' />
                {t('auth.googleLogin')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
