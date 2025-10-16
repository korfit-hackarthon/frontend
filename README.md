# Kuuid - Korean Life Simulation PWA

Kuuid는 한국 생활에 필요한 다양한 상황을 시뮬레이션할 수 있는 PWA 앱입니다. 음성 인식과 AI 대화를 통해 실제와 같은 연습 환경을 제공합니다.

## 🎤 모바일 PWA에서 오디오/마이크 사용하기

### 📱 **지원되는 플랫폼**
- **iOS Safari**: iOS 14.3+ (HTTPS 필수)
- **Android Chrome**: Android 7.0+ 
- **Android Samsung Internet**: 최신 버전
- **기타 모바일 브라우저**: 부분 지원

### 🔧 **필수 요구사항**

#### **1. HTTPS 연결**
```bash
# 개발 환경에서 HTTPS 사용
npm run dev -- --https

# 또는 터널링 서비스 사용 (ngrok, localtunnel 등)
npx localtunnel --port 3000
```

#### **2. 권한 설정**
모바일 브라우저에서 마이크 권한을 허용해야 합니다:
- **iOS Safari**: 설정 > Safari > 웹사이트 설정 > 마이크
- **Android Chrome**: 브라우저 주소창 좌측 자물쇠 아이콘 > 권한

#### **3. PWA 설치 (권장)**
더 안정적인 오디오 녹음을 위해 PWA로 설치:
- **iOS**: Safari에서 공유 버튼 → "홈 화면에 추가"
- **Android**: Chrome 메뉴 → "홈 화면에 추가" 또는 "앱 설치"

### 🚀 **최적화된 오디오 기능**

#### **자동 권한 관리**
```typescript
// 권한 자동 요청 및 상태 관리
const permissionResult = await requestMicrophonePermission();
if (permissionResult.granted) {
  // 녹음 시작
}
```

#### **디바이스별 최적화**
- **iOS**: MP4 오디오 포맷 사용
- **Android**: WebM/Opus 코덱 사용
- **에코 제거, 노이즈 억제** 자동 적용

#### **모바일 자동재생 정책 대응**
```typescript
// 사용자 상호작용 후 AudioContext 활성화
const audioContext = initializeAudioContext();
```

### 🛠️ **문제 해결**

#### **마이크가 작동하지 않을 때**
1. **브라우저 권한 확인**: 마이크 접근이 허용되었는지 확인
2. **HTTPS 연결**: HTTP에서는 마이크 사용 불가
3. **브라우저 재시작**: 권한 변경 후 브라우저 재시작
4. **PWA 설치**: 네이티브 앱처럼 더 안정적으로 작동

#### **iOS Safari 특별 고려사항**
- 사용자가 직접 버튼을 눌러야 녹음 시작 가능
- 백그라운드에서는 녹음 중단될 수 있음
- 저전력 모드에서는 성능 제한

#### **Android 브라우저별 차이**
- **Chrome**: 가장 안정적, WebRTC 완전 지원
- **Samsung Internet**: 대부분 지원, 일부 제약
- **Firefox**: 기본 지원, 고급 기능 제한

### 📋 **오디오 테스트 위젯**

개발 중 오디오 기능을 테스트할 수 있는 위젯이 포함되어 있습니다:

```tsx
import AudioTestWidget from '@/components/AudioTestWidget';

function TestPage() {
  return <AudioTestWidget />;
}
```

이 위젯으로 확인할 수 있는 정보:
- 디바이스 지원 여부 (getUserMedia, MediaRecorder)
- 마이크 권한 상태
- PWA 설치 여부
- 플랫폼별 최적화 정보

### 🔍 **디버깅 팁**

#### **브라우저 개발자 도구**
```javascript
// 콘솔에서 권한 상태 확인
navigator.permissions.query({name: 'microphone'})
  .then(result => console.log('마이크 권한:', result.state));

// MediaRecorder 지원 확인
console.log('MediaRecorder 지원:', typeof MediaRecorder !== 'undefined');

// 지원되는 MIME 타입 확인
console.log('WebM 지원:', MediaRecorder.isTypeSupported('audio/webm'));
console.log('MP4 지원:', MediaRecorder.isTypeSupported('audio/mp4'));
```

#### **네트워크 설정**
- mDNS 해결 문제: `*.local` 도메인 사용 시 일부 모바일에서 접근 불가
- 방화벽 설정: 개발 서버 포트가 방화벽에 차단되지 않았는지 확인

---

## 🏗️ 개발 환경 설정

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
