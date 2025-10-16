import { useAtomValue } from 'jotai';
import { Link } from 'react-router-dom';
import { userAtom, authLoadingAtom } from '../stores/auth';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Loader2, LogIn, ArrowRight } from 'lucide-react';

export default function Home() {
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p className='text-lg'>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center max-w-4xl mx-auto'>
          {/* 로그인 상태에 따른 UI */}
          {user ? (
            // 로그인된 사용자
            <Card className='max-w-md mx-auto'>
              <CardHeader>
                <CardTitle className='text-green-600'>✅ 로그인됨</CardTitle>
                <CardDescription>
                  안녕하세요, {user.user_metadata?.full_name || user.email}님!
                  <br />
                  <span className='text-xs opacity-75'>
                    {user.app_metadata?.provider === 'github'
                      ? 'GitHub'
                      : user.app_metadata?.provider === 'google'
                      ? 'Google'
                      : '소셜'}{' '}
                    계정으로 로그인됨
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Link to='/dashboard'>
                  <Button className='w-full' size='lg'>
                    대시보드로 이동
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            // 로그인되지 않은 사용자
            <Card className='max-w-md mx-auto'>
              <CardHeader>
                <CardTitle>🔐 로그인이 필요합니다</CardTitle>
                <CardDescription>
                  GitHub 또는 Google 계정으로 간편하게 로그인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to='/login'>
                  <Button className='w-full' size='lg'>
                    <LogIn className='w-5 h-5 mr-2' />
                    로그인하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
