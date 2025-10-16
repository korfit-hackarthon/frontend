import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {  Smartphone, Headphones, Info } from 'lucide-react';
import {
  checkMediaDeviceSupport,
  requestMicrophonePermission,
  isPWAInstalled,
  showPWAInstallPrompt,
} from '../utils/audioPermissions';

export default function AudioTestWidget() {
  const [support, setSupport] = useState<any>(null);
  const [permission, setPermission] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runAudioCheck = async () => {
    setIsChecking(true);

    // 디바이스 지원 확인
    const deviceSupport = checkMediaDeviceSupport();
    setSupport(deviceSupport);

    // 권한 확인
    const permissionResult = await requestMicrophonePermission();
    setPermission(permissionResult);

    setIsChecking(false);
  };

  const getStatusBadge = (status: boolean | null, label: string) => {
    if (status === null) return <Badge variant='secondary'>미확인</Badge>;
    return status ? (
      <Badge className='bg-green-500 text-white'>{label} ✓</Badge>
    ) : (
      <Badge variant='destructive'>{label} ✗</Badge>
    );
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Headphones className='w-5 h-5' />
          오디오 기능 테스트
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          onClick={runAudioCheck}
          disabled={isChecking}
          className='w-full'
        >
          {isChecking ? '확인 중...' : '오디오 기능 확인'}
        </Button>

        {support && (
          <div className='space-y-3'>
            <div className='text-sm font-medium'>디바이스 정보</div>
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='flex items-center gap-1'>
                <Smartphone className='w-3 h-3' />
                {support.isMobile ? '모바일' : '데스크톱'}
              </div>
              <div className='flex items-center gap-1'>
                {support.isIOS && '🍎 iOS'}
                {support.isAndroid && '🤖 Android'}
                {!support.isMobile && '💻 PC'}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-medium'>지원 기능</div>
              <div className='space-y-1'>
                {getStatusBadge(support.hasGetUserMedia, 'getUserMedia')}
                {getStatusBadge(support.hasMediaRecorder, 'MediaRecorder')}
                {getStatusBadge(support.supported, '전체 지원')}
              </div>
            </div>

            {support.error && (
              <div className='p-2 bg-red-50 rounded text-xs text-red-600'>
                오류: {support.error}
              </div>
            )}
          </div>
        )}

        {permission && (
          <div className='space-y-3'>
            <div className='text-sm font-medium'>권한 상태</div>
            <div className='space-y-1'>
              {getStatusBadge(permission.granted, '마이크 권한')}
            </div>

            {permission.message && (
              <div
                className={`p-2 rounded text-xs ${
                  permission.granted
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {permission.message}
              </div>
            )}

            {permission.error && (
              <div className='p-2 bg-red-50 rounded text-xs text-red-600'>
                오류 코드: {permission.error}
              </div>
            )}
          </div>
        )}

        {support?.isMobile && (
          <div className='space-y-3'>
            <div className='text-sm font-medium'>PWA 상태</div>
            <div className='space-y-1'>
              {getStatusBadge(isPWAInstalled(), 'PWA 설치됨')}
            </div>

            {!isPWAInstalled() && (
              <div className='p-2 bg-blue-50 rounded text-xs text-blue-600'>
                <div className='flex items-start gap-2'>
                  <Info className='w-3 h-3 mt-0.5 flex-shrink-0' />
                  <div>{showPWAInstallPrompt()}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className='text-xs text-gray-500 space-y-1'>
          <div>• HTTPS 연결이 필요합니다</div>
          <div>• 일부 브라우저에서는 사용자 상호작용 후에만 작동합니다</div>
          <div>• PWA로 설치하면 더 안정적으로 작동합니다</div>
        </div>
      </CardContent>
    </Card>
  );
}



