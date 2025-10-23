/**
 * 모바일 PWA에서 오디오/마이크 권한 및 호환성 처리 유틸리티
 */

export interface AudioPermissionResult {
  granted: boolean;
  error?: string;
  message?: string;
}

export interface MediaDeviceSupport {
  supported: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  error?: string;
}

/**
 * 디바이스 및 브라우저 지원 여부 확인
 */
export const checkMediaDeviceSupport = (): MediaDeviceSupport => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

  const hasGetUserMedia = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );

  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

  const result: MediaDeviceSupport = {
    supported: hasGetUserMedia && hasMediaRecorder,
    hasGetUserMedia,
    hasMediaRecorder,
    isIOS,
    isAndroid,
    isMobile,
  };

  if (!hasGetUserMedia) {
    result.error = 'getUserMedia is not supported in this browser';
  } else if (!hasMediaRecorder) {
    result.error = 'MediaRecorder is not supported in this browser';
  }

  return result;
};

/**
 * 마이크 권한 요청 및 확인
 */
export const requestMicrophonePermission =
  async (): Promise<AudioPermissionResult> => {
    try {
      const support = checkMediaDeviceSupport();

      if (!support.supported) {
        return {
          granted: false,
          error: support.error || 'Media devices not supported',
          message: '이 브라우저에서는 음성 녹음을 지원하지 않습니다.',
        };
      }

      // iOS Safari에서는 사용자 상호작용 후에만 권한 요청 가능
      if (support.isIOS) {
        // iOS에서는 HTTPS 필수
        if (
          location.protocol !== 'https:' &&
          location.hostname !== 'localhost'
        ) {
          return {
            granted: false,
            error: 'HTTPS required on iOS',
            message: 'iOS에서는 HTTPS 연결이 필요합니다.',
          };
        }
      }

      // 권한 상태 확인 (지원하는 브라우저에서만)
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({
            name: 'microphone' as PermissionName,
          });

          if (permission.state === 'denied') {
            return {
              granted: false,
              error: 'Permission denied',
              message:
                '마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.',
            };
          }
        } catch (error) {
          // permissions API를 지원하지 않는 브라우저에서는 무시
          console.warn('Permissions API not supported:', error);
        }
      }

      // 실제 마이크 액세스 시도
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      });

      // 스트림을 즉시 정리
      stream.getTracks().forEach((track) => track.stop());

      return {
        granted: true,
        message: '마이크 권한이 허용되었습니다.',
      };
    } catch (error: any) {
      console.error('Microphone permission error:', error);

      let message = '마이크 권한을 요청하는 중 오류가 발생했습니다.';

      if (error.name === 'NotAllowedError') {
        message =
          '마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
      } else if (error.name === 'NotFoundError') {
        message =
          '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
      } else if (error.name === 'NotSupportedError') {
        message = '이 브라우저에서는 음성 녹음을 지원하지 않습니다.';
      } else if (error.name === 'SecurityError') {
        message = 'HTTPS 연결이 필요합니다.';
      }

      return {
        granted: false,
        error: error.name || 'Unknown error',
        message,
      };
    }
  };

/**
 * 오디오 녹음을 위한 최적화된 MediaRecorder 생성
 */
export const createOptimizedMediaRecorder = async (
  onDataAvailable: (event: BlobEvent) => void,
  onStop: () => void
): Promise<MediaRecorder | null> => {
  try {
    const support = checkMediaDeviceSupport();

    if (!support.supported) {
      throw new Error(support.error || 'Media devices not supported');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1,
      },
    });

    // MediaRecorder 옵션 설정 (모바일 최적화)
    let mimeType = 'audio/webm;codecs=opus';

    // iOS Safari 호환성
    if (support.isIOS) {
      mimeType = 'audio/mp4';
    } else if (support.isAndroid) {
      mimeType = 'audio/webm;codecs=opus';
    }

    // MIME 타입 지원 확인
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // 기본값 사용
      }
    }

    const options: MediaRecorderOptions = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }

    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = () => {
      // 스트림 정리
      stream.getTracks().forEach((track) => track.stop());
      onStop();
    };

    return mediaRecorder;
  } catch (error) {
    console.error('Failed to create MediaRecorder:', error);
    return null;
  }
};

/**
 * PWA가 설치되었는지 확인
 */
export const isPWAInstalled = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * 사용자에게 PWA 설치 안내
 */
export const showPWAInstallPrompt = (): string => {
  const support = checkMediaDeviceSupport();

  if (support.isIOS) {
    return 'Safari에서 공유 버튼을 눌러 "홈 화면에 추가"를 선택하면 더 나은 음성 녹음 환경을 이용할 수 있습니다.';
  } else if (support.isAndroid) {
    return '브라우저 메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 선택하면 더 나은 음성 녹음 환경을 이용할 수 있습니다.';
  }

  return '이 웹사이트를 앱으로 설치하면 더 나은 음성 녹음 환경을 이용할 수 있습니다.';
};

/**
 * 오디오 컨텍스트 초기화 (모바일에서 자동재생 정책 대응)
 */
export const initializeAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();

    // 모바일에서는 사용자 상호작용 후 resume 필요
    if (audioContext.state === 'suspended') {
      const resumeAudio = () => {
        audioContext.resume();
        document.removeEventListener('touchstart', resumeAudio);
        document.removeEventListener('click', resumeAudio);
      };

      document.addEventListener('touchstart', resumeAudio);
      document.addEventListener('click', resumeAudio);
    }

    return audioContext;
  } catch (error) {
    console.error('Failed to initialize AudioContext:', error);
    return null;
  }
};




