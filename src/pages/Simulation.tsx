import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  ArrowLeft,
  Volume2,
  User,
  Clock,
  CheckCircle2,
  Monitor,
  Presentation,
  Settings,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { toast } from 'sonner';
import { audioService, type AudioMessage } from '../services/audio';
import { getScenarioById, buildSystemPrompt } from '../data/simulations';
import {
  requestMicrophonePermission,
  createOptimizedMediaRecorder,
  checkMediaDeviceSupport,
  isPWAInstalled,
  showPWAInstallPrompt,
  initializeAudioContext,
} from '../utils/audioPermissions';

// 시나리오 데이터는 data/simulations.ts에서 관리

export default function Simulation() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingMessageId, setCurrentProcessingMessageId] = useState<
    string | null
  >(null);
  const [textMessage, setTextMessage] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [currentSteps, setCurrentSteps] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [uiMode, setUiMode] = useState<'simulation' | 'chat'>('simulation');
  const [inputMode, setInputMode] = useState<'audio' | 'text'>('audio');
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<
    boolean | null
  >(null);
  const [deviceSupport, setDeviceSupport] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { t } = useTranslation();
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const lastScenarioIdRef = useRef<string | null>(null);

  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const localizedScenario = scenario
    ? {
        ...scenario,
        title: t(`simulation.scenarios.${scenario.id}.title`, {
          defaultValue: scenario.title,
        }),
        officerName: t(`simulation.scenarios.${scenario.id}.officerName`, {
          defaultValue: scenario.officerName,
        }),
        initialMessage: t(
          `simulation.scenarios.${scenario.id}.initialMessage`,
          { defaultValue: scenario.initialMessage }
        ),
        steps: scenario.steps.map((s, idx) => ({
          ...s,
          name: t(`simulation.scenarios.${scenario.id}.steps.${idx}`, {
            defaultValue: s.name,
          }),
        })),
      }
    : undefined;
  const categoryLabel = scenario
    ? t(`simulation.categories.${scenario.category}`, {
        defaultValue: scenario.category,
      })
    : '';

  // 오디오 권한 및 디바이스 지원 확인
  useEffect(() => {
    const initializeAudio = async () => {
      const support = checkMediaDeviceSupport();
      setDeviceSupport(support);

      if (support.supported) {
        // 오디오 컨텍스트 초기화
        const audioContext = initializeAudioContext();
        audioContextRef.current = audioContext;

        // PWA 설치 안내 (필요시)
        if (support.isMobile && !isPWAInstalled()) {
          console.log('PWA 설치 권장:', showPWAInstallPrompt());
        }
      }
    };

    initializeAudio();
  }, []);

  useEffect(() => {
    // scenarioId가 변경되었을 때만 실행
    if (scenarioId && scenarioId !== lastScenarioIdRef.current) {
      const currentScenario = getScenarioById(scenarioId);
      if (!currentScenario) return;

      console.log('새 세션 초기화 시작:', scenarioId);

      // 이전 상태 초기화
      setSessionId(null);
      setMessages([]);
      setCurrentSteps(null);
      setIsProcessing(false);
      setCurrentProcessingMessageId(null);

      // ref 업데이트
      lastScenarioIdRef.current = scenarioId;

      // 새 세션 시작
      initializeSessionForScenario(currentScenario);
    }
  }, [scenarioId]);

  const initializeSessionForScenario = async (
    currentScenario: NonNullable<ReturnType<typeof getScenarioById>>
  ) => {
    if (isInitializing) {
      console.log('이미 초기화 중입니다. 중단.');
      return;
    }

    try {
      const localizedTitle = t(
        `simulation.scenarios.${currentScenario.id}.title`,
        { defaultValue: currentScenario.title }
      );
      const localizedInitial = t(
        `simulation.scenarios.${currentScenario.id}.initialMessage`,
        { defaultValue: currentScenario.initialMessage }
      );
      console.log('세션 생성 시작:', localizedTitle);
      setIsInitializing(true);

      const response = await audioService.createSession(localizedTitle);
      if (response.success) {
        console.log('세션 생성 성공:', response.data._id);
        setSessionId(response.data._id);

        // 초기 메시지 추가
        const initialMessage: AudioMessage = {
          _id: 'initial',
          sessionId: response.data._id,
          userAudioUrl: '',
          userTextFromSTT: '',
          aiResponseText: localizedInitial,
          aiAudioUrl: '',
          processingStatus: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages([initialMessage]);
      } else {
        console.log('세션 생성 실패');
        toast.error('시뮬레이션 세션 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('세션 초기화 에러:', error);
      toast.error(t('common.error'));
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let statusCheckInterval: NodeJS.Timeout;
    if (currentProcessingMessageId) {
      statusCheckInterval = setInterval(checkMessageStatus, 1000);
    }
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [currentProcessingMessageId]);

  const checkMessageStatus = async () => {
    if (!currentProcessingMessageId) return;

    try {
      const response = await audioService.getMessageStatus(
        currentProcessingMessageId
      );
      if (response.success) {
        const updatedMessage = response.data;

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );

        // JSON에서 단계 정보 추출
        if (updatedMessage.aiResponseText) {
          const jsonMatches = parseJsonFromText(updatedMessage.aiResponseText);
          if (
            jsonMatches.length > 0 &&
            jsonMatches[0].parsedData.steps_status
          ) {
            setCurrentSteps(jsonMatches[0].parsedData);
          }
        }

        // tts_processing 단계에 도달하면 다음 입력을 허용
        if (updatedMessage.processingStatus === 'tts_processing') {
          setIsProcessing(false);
          //   toast.info('음성 생성 중입니다. 다음 메시지를 보낼 수 있습니다.');
        }

        // 완료되거나 에러가 발생하면 메시지 ID 초기화
        if (
          updatedMessage.processingStatus === 'completed' ||
          updatedMessage.processingStatus === 'error'
        ) {
          setCurrentProcessingMessageId(null);

          if (updatedMessage.processingStatus === 'completed') {
            toast.success(t('common.success'));
          } else {
            toast.error(t('common.error'));
          }
        }
      }
    } catch (error) {
      console.error('메시지 상태 확인 에러:', error);
    }
  };

  const parseJsonFromText = (text: string) => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
    const matches = [];
    let match;

    while ((match = jsonRegex.exec(text)) !== null) {
      try {
        const parsedJson = JSON.parse(match[1]);
        matches.push({
          originalText: match[0],
          parsedData: parsedJson,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      } catch (error) {
        console.error('JSON 파싱 에러:', error);
      }
    }

    return matches;
  };

  const cleanTextFromJson = (text: string, jsonMatches: any[]) => {
    if (jsonMatches.length === 0) return text;

    let cleanedText = text;
    for (let i = jsonMatches.length - 1; i >= 0; i--) {
      const match = jsonMatches[i];
      cleanedText =
        cleanedText.slice(0, match.startIndex) +
        cleanedText.slice(match.endIndex);
    }

    return cleanedText.trim();
  };

  const startRecording = async () => {
    try {
      // 오디오 권한 확인 (필요시 요청)
      if (audioPermissionGranted === null) {
        const permissionResult = await requestMicrophonePermission();
        setAudioPermissionGranted(permissionResult.granted);

        if (!permissionResult.granted) {
          toast.error(permissionResult.message || t('common.error'));
          return;
        }

        toast.success(
          permissionResult.message || '마이크 권한이 허용되었습니다.'
        );
      }

      // 디바이스 지원 확인
      if (!deviceSupport?.supported) {
        toast.error('이 기기에서는 음성 녹음을 지원하지 않습니다.');
        return;
      }

      // 오디오 컨텍스트 활성화 (모바일 자동재생 정책)
      if (
        audioContextRef.current &&
        audioContextRef.current.state === 'suspended'
      ) {
        await audioContextRef.current.resume();
      }

      // 최적화된 MediaRecorder 생성
      const mediaRecorder = await createOptimizedMediaRecorder(
        (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        },
        async () => {
          // 녹음 중지 시 처리
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/wav',
          });
          setAudioBlob(audioBlob);

          // 짧은 지연 후 메시지 전송 (UI 상태 업데이트를 위해)
          setTimeout(async () => {
            // 녹음 완료 시 자동으로 메시지 전송
            if (sessionId && scenario) {
              try {
                setIsProcessing(true);
                const systemPrompt = buildSystemPrompt(scenario);
                const response = await audioService.processAudioMessage(
                  sessionId,
                  audioBlob,
                  systemPrompt
                );

                if (response.success) {
                  setCurrentProcessingMessageId(response.data.messageId);
                  setAudioBlob(null);

                  const newMessage: AudioMessage = {
                    _id: response.data.messageId,
                    sessionId,
                    userAudioUrl: '',
                    userTextFromSTT: '',
                    aiResponseText: '',
                    aiAudioUrl: '',
                    processingStatus: 'pending',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  setMessages((prev) => [...prev, newMessage]);
                  // checkMessageStatus가 useEffect에서 자동으로 시작됩니다
                } else {
                  toast.error(t('common.error'));
                  setIsProcessing(false);
                }
              } catch (error) {
                console.error('메시지 전송 에러:', error);
                toast.error(t('common.error'));
                setIsProcessing(false);
              }
            }
          }, 100); // 100ms 지연
        }
      );

      if (!mediaRecorder) {
        toast.error('녹음 기능을 초기화할 수 없습니다.');
        return;
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.start();
      setIsRecording(true);
      toast.success(t('simulation.labels.recording'));
    } catch (error) {
      console.error('녹음 시작 에러:', error);
      toast.error('마이크 접근에 실패했습니다.');
    }
  };

  const stopRecording = () => {
    console.log('stopRecording 호출됨', {
      isRecording,
      mediaRecorder: !!mediaRecorderRef.current,
      readyState: mediaRecorderRef.current?.state,
    });

    if (
      mediaRecorderRef.current &&
      isRecording &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      console.log('녹음 중단 중...');
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('녹음 중단 완료');
      } catch (error) {
        console.error('녹음 중단 중 에러:', error);
        // 에러가 발생해도 상태는 리셋
        setIsRecording(false);
      }
    } else {
      console.log('녹음 중단 조건 불충족:', {
        isRecording,
        mediaRecorder: !!mediaRecorderRef.current,
        readyState: mediaRecorderRef.current?.state,
      });
      // 상태 불일치 시 강제로 리셋
      if (isRecording) {
        console.log('상태 불일치 감지, 강제 리셋');
        setIsRecording(false);
      }
    }
  };

  const handleMicButtonClick = () => {
    console.log('마이크 버튼 클릭됨', { isRecording, isProcessing });
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Textarea 동적 크기 조절
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [textMessage]);

  const sendMessage = async (isAudio: boolean = false) => {
    if (!sessionId || !scenario) return;

    if (isAudio && !audioBlob) {
      toast.error(t('common.error'));
      return;
    }

    if (!isAudio && !textMessage.trim()) {
      toast.error(t('common.error'));
      return;
    }

    try {
      setIsProcessing(true);

      const systemPrompt = buildSystemPrompt(scenario);
      const response = isAudio
        ? await audioService.processAudioMessage(
            sessionId,
            audioBlob!,
            systemPrompt,
            'Kore'
          )
        : await audioService.processTextMessage(
            sessionId,
            textMessage,
            systemPrompt,
            'Kore'
          );

      if (response.success) {
        setCurrentProcessingMessageId(response.data.messageId);
        if (isAudio) {
          setAudioBlob(null);
        } else {
          setTextMessage('');
        }

        const newMessage: AudioMessage = {
          _id: response.data.messageId,
          sessionId,
          userAudioUrl: isAudio ? '' : 'text_input',
          userTextFromSTT: isAudio ? '' : textMessage,
          aiResponseText: '',
          aiAudioUrl: '',
          processingStatus: isAudio ? 'pending' : 'llm_processing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
      } else {
        toast.error(t('common.error'));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('메시지 전송 에러:', error);
      toast.error(t('common.error'));
      setIsProcessing(false);
    }
  };

  const playAudio = async (audioUrl: string, messageId: string) => {
    try {
      if (playingAudioId === messageId) {
        const currentAudio = audioElementsRef.current.get(messageId);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        setPlayingAudioId(null);
        return;
      }

      audioElementsRef.current.forEach((audio, id) => {
        if (id !== messageId) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      const isProduction = import.meta.env.MODE === 'production';
      const fullAudioUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `${
            isProduction
              ? 'https://clips.a.pinggy.link'
              : import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
          }${audioUrl}`;

      console.log('fullAudioUrl', fullAudioUrl);

      let audio = audioElementsRef.current.get(messageId);
      if (!audio) {
        audio = new Audio(fullAudioUrl);
        audioElementsRef.current.set(messageId, audio);

        audio.onended = () => {
          setPlayingAudioId(null);
        };
      }

      setPlayingAudioId(messageId);
      await audio.play();
    } catch (error) {
      console.error('오디오 재생 에러:', error);
      toast.error(t('common.error'));
      setPlayingAudioId(null);
    }
  };

  if (!scenario) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>
            시나리오를 찾을 수 없습니다
          </h1>
          <Button onClick={() => navigate('/audio-sessions')}>돌아가기</Button>
        </div>
      </div>
    );
  }

  // 시뮬레이션 모드 UI
  const renderSimulationMode = () => (
    <div className='min-h-screen bg-gray-100 relative overflow-hidden'>
      {/* 배경 이미지 (자유 대화가 아닐 때만) */}
      {scenario?.backgroundImage && (
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${scenario.backgroundImage})` }}
        >
          <div className='absolute inset-0 bg-black/20'></div>
        </div>
      )}

      {/* 컨텐츠 */}
      <div className='relative z-10 flex flex-col h-screen'>
        {/* 헤더 */}
        <div className='bg-white/95 backdrop-blur-sm border-b p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => navigate('/simulations')}
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <h1 className='text-lg font-semibold'>
                {t('simulation.labels.pageTitle')}
              </h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Settings className='h-4 w-4 mr-2' />
                  {t('simulation.labels.uiMode')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setUiMode('simulation')}>
                  <Presentation className='h-4 w-4 mr-2' />
                  {t('simulation.labels.simulationMode')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiMode('chat')}>
                  <Monitor className='h-4 w-4 mr-2' />
                  {t('simulation.labels.chatMode')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='mt-3 flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              <span className='font-medium'>{localizedScenario?.title}</span>
            </div>
            <Badge variant='secondary'>{categoryLabel}</Badge>
          </div>
        </div>

        {/* 진행 상황 */}
        {currentSteps && (
          <div className='bg-white/95 backdrop-blur-sm border-b p-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Clock className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium'>
                {t('simulation.labels.currentProgress', {
                  step: currentSteps.current_step,
                })}
              </span>
            </div>
            <TooltipProvider>
              <div className='flex gap-2'>
                {currentSteps.steps_status?.map((step: any, index: number) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-help transition-all hover:scale-110 ${
                          step.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : step.status === 'in_progress'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className='h-4 w-4' />
                        ) : (
                          step.step
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side='bottom' className='max-w-xs'>
                      <div className='space-y-1'>
                        <div className='font-medium'>{step.step}단계</div>
                        <div className='text-sm'>{step.name}</div>
                        <div className='text-xs opacity-80'>
                          상태:{' '}
                          {step.status === 'completed'
                            ? '완료'
                            : step.status === 'in_progress'
                            ? '진행중'
                            : '대기'}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        )}

        {/* 메시지 영역 */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.map((message) => (
            <div key={message._id} className='space-y-3'>
              {/* 사용자 메시지 */}
              {message.userTextFromSTT && (
                <div className='flex justify-end'>
                  <div className='bg-blue-500 text-white rounded-lg p-3 max-w-xs'>
                    <div className='text-sm'>{message.userTextFromSTT}</div>
                  </div>
                </div>
              )}

              {/* AI 응답 (직원) */}
              {(message.aiResponseText ||
                message.processingStatus !== 'pending') && (
                <div className='flex justify-start'>
                  <div className='bg-white/95 backdrop-blur-sm rounded-lg p-4 max-w-sm shadow-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                        <User className='h-4 w-4 text-white' />
                      </div>
                      <span className='text-sm font-medium'>
                        {localizedScenario?.officerName}
                      </span>
                    </div>

                    {message.aiResponseText && (
                      <div className='text-sm mb-3'>
                        {(() => {
                          const jsonMatches = parseJsonFromText(
                            message.aiResponseText
                          );
                          const cleanedText = cleanTextFromJson(
                            message.aiResponseText,
                            jsonMatches
                          );

                          return (
                            cleanedText && (
                              <div className='whitespace-pre-wrap'>
                                {cleanedText}
                              </div>
                            )
                          );
                        })()}
                      </div>
                    )}

                    {message.aiAudioUrl && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          playAudio(message.aiAudioUrl, message._id)
                        }
                        className='w-full'
                      >
                        {playingAudioId === message._id ? (
                          <>
                            <Volume2 className='h-4 w-4 mr-2' />
                            {t('simulation.labels.playing')}
                          </>
                        ) : (
                          <>
                            <Volume2 className='h-4 w-4 mr-2' />
                            {t('simulation.labels.playAudio')}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div className='bg-white/95 backdrop-blur-sm border-t p-4'>
          <div className='space-y-3'>
            {/* 텍스트 입력 */}
            <div className='flex items-center gap-2'>
              <Input
                placeholder={t('simulation.labels.inputPlaceholder')!}
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(false);
                  }
                }}
                disabled={isProcessing}
                className='flex-1'
              />
              <Button
                onClick={() => sendMessage(false)}
                disabled={isProcessing || !textMessage.trim()}
                size='sm'
              >
                <Send className='h-4 w-4' />
                {t('simulation.labels.send')}
              </Button>
            </div>

            {/* 음성 입력 */}
            <div className='flex items-center justify-center'>
              <div className='relative'>
                <Button
                  size='lg'
                  variant={isRecording ? 'destructive' : 'default'}
                  onClick={handleMicButtonClick}
                  disabled={isProcessing && !isRecording}
                  className='rounded-full w-16 h-16'
                >
                  {isRecording ? (
                    <MicOff className='h-6 w-6' />
                  ) : (
                    <Mic className='h-6 w-6' />
                  )}
                </Button>

                {isRecording && (
                  <div
                    className='absolute -inset-2 rounded-full border-2 border-red-500 animate-pulse'
                    onClick={handleMicButtonClick}
                  ></div>
                )}
              </div>

              {isProcessing && (
                <div className='ml-4 flex items-center gap-2 text-sm text-gray-600'>
                  <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                  {t('simulation.labels.generating')}
                </div>
              )}
            </div>

            <div className='text-center text-sm text-gray-600'>
              {isRecording
                ? t('simulation.labels.recording')
                : isProcessing
                ? t('simulation.labels.generating')
                : t('simulation.labels.pressMic')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 채팅 모드 UI
  const renderChatMode = () => (
    <div className='flex flex-col h-screen'>
      {/* 고정 헤더 */}
      <div className='sticky top-0 z-10 bg-white border-b shadow-sm'>
        <div className='container mx-auto p-4 max-w-4xl'>
          <div className='flex items-center gap-4 mb-4'>
            <Button variant='ghost' onClick={() => navigate('/simulations')}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div className='flex-1'>
              <h1 className='text-xl font-bold'>{localizedScenario?.title}</h1>
              <p className='text-sm text-muted-foreground'>
                {t('simulation.labels.conversation')}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Settings className='h-4 w-4 mr-2' />
                  UI 모드
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setUiMode('simulation')}>
                  <Presentation className='h-4 w-4 mr-2' />
                  시뮬레이션 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUiMode('chat')}>
                  <Monitor className='h-4 w-4 mr-2' />
                  채팅 모드
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 진행 상황 - 컴팩트 버전 (항상 상단 고정) */}
          {currentSteps && (
            <div className='bg-muted/30 rounded-lg p-3 mb-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Clock className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium'>
                  진행: {currentSteps.current_step}/
                  {currentSteps.steps_status?.length}단계
                </span>
              </div>
              <div className='flex gap-2 overflow-x-auto pb-1'>
                {currentSteps.steps_status?.map((step: any, index: number) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border flex-shrink-0'
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : step.status === 'in_progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle2 className='h-3 w-3' />
                      ) : (
                        step.step
                      )}
                    </div>
                    <span className='text-xs text-gray-700 max-w-[120px] truncate'>
                      {step.name}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        step.status === 'completed'
                          ? 'bg-green-500'
                          : step.status === 'in_progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className='flex-1 overflow-y-auto'>
        <div className='container mx-auto p-4 max-w-4xl'>
          {/* 메시지 목록 */}
          <div className='space-y-4 pb-6'>
            {messages.map((message) => (
              <div key={message._id} className='space-y-4'>
                {/* 사용자 메시지 */}
                {message.userTextFromSTT && (
                  <div className='flex justify-end'>
                    <div className='bg-primary text-primary-foreground rounded-lg p-3 max-w-sm'>
                      <div className='text-sm mb-2'>
                        {message.userTextFromSTT}
                      </div>
                      <div className='text-xs opacity-70'>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI 응답 */}
                {(message.aiResponseText ||
                  message.processingStatus !== 'pending') && (
                  <div className='flex justify-start'>
                    <div className='bg-muted rounded-lg p-4 max-w-sm'>
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <span className='text-xs font-medium'>
                          {scenario?.officerName}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {t(
                            `simulation.processing.${message.processingStatus}`
                          )}
                        </Badge>
                      </div>

                      {message.aiResponseText && (
                        <div className='text-sm mb-3'>
                          {(() => {
                            const jsonMatches = parseJsonFromText(
                              message.aiResponseText
                            );
                            const cleanedText = cleanTextFromJson(
                              message.aiResponseText,
                              jsonMatches
                            );

                            const renderStatusBadge = (status: string) => {
                              const base =
                                'w-8 h-5 flex items-center justify-center rounded text-[10px] font-bold';
                              if (status === 'completed')
                                return (
                                  <span
                                    className={`bg-green-500 text-white ${base}`}
                                  >
                                    ✓
                                  </span>
                                );
                              if (status === 'in_progress')
                                return (
                                  <span
                                    className={`bg-blue-500 text-white ${base}`}
                                  >
                                    ●
                                  </span>
                                );
                              return (
                                <span
                                  className={`bg-gray-400 text-white ${base}`}
                                >
                                  ○
                                </span>
                              );
                            };

                            return (
                              <>
                                {cleanedText && (
                                  <div className='whitespace-pre-wrap mb-3'>
                                    {cleanedText}
                                  </div>
                                )}

                                {jsonMatches.length > 0 &&
                                  jsonMatches[0].parsedData?.steps_status && (
                                    <div className='mt-2 border rounded-md overflow-hidden'>
                                      <div className='bg-muted px-3 py-2 text-xs font-medium'>
                                        현재 진행상황
                                      </div>
                                      <div className='divide-y'>
                                        {jsonMatches[0].parsedData.steps_status.map(
                                          (s: any, i: number) => (
                                            <div
                                              key={i}
                                              className='flex items-start gap-3 px-3 py-2 text-xs'
                                            >
                                              <div className='w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5'>
                                                {s.step}
                                              </div>
                                              <div className='flex-1 min-w-0 text-gray-700 leading-relaxed break-all'>
                                                {s.name}
                                              </div>
                                              <div className='flex-shrink-0 self-start mt-0.5'>
                                                {renderStatusBadge(s.status)}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {message.aiAudioUrl && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            playAudio(message.aiAudioUrl, message._id)
                          }
                          className='w-full'
                        >
                          {playingAudioId === message._id ? (
                            <>
                              <Volume2 className='h-4 w-4 mr-2' />
                              재생 중...
                            </>
                          ) : (
                            <>
                              <Volume2 className='h-4 w-4 mr-2' />
                              음성 재생
                            </>
                          )}
                        </Button>
                      )}

                      <div className='text-xs text-muted-foreground mt-2'>
                        {new Date(message.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 고정 입력 영역 */}
      <div className='border-t bg-white p-4'>
        <div className='container mx-auto max-w-4xl'>
          <Tabs
            value={inputMode}
            onValueChange={(value) => setInputMode(value as 'audio' | 'text')}
          >
            <TabsList className='grid w-full grid-cols-2 mb-4'>
              <TabsTrigger value='audio' className='flex items-center gap-2'>
                <Mic className='h-4 w-4' />
                {t('simulation.labels.audioInput')}
              </TabsTrigger>
              <TabsTrigger value='text' className='flex items-center gap-2'>
                <Send className='h-4 w-4' />
                {t('simulation.labels.textInput')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='audio' className='mt-0'>
              <div className='flex items-center justify-center'>
                <div className='relative'>
                  <Button
                    size='lg'
                    variant={isRecording ? 'destructive' : 'default'}
                    onClick={handleMicButtonClick}
                    disabled={isProcessing && !isRecording}
                    className='rounded-full w-16 h-16'
                  >
                    {isRecording ? (
                      <MicOff className='h-5 w-5' />
                    ) : (
                      <Mic className='h-5 w-5' />
                    )}
                  </Button>
                  {isRecording && (
                    <div className='absolute -inset-2 rounded-full border-2 border-red-500 animate-pulse'></div>
                  )}
                </div>

                {isProcessing && (
                  <div className='ml-4 flex items-center gap-2 text-sm text-muted-foreground'>
                    <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                    {t('simulation.labels.generating')}
                  </div>
                )}
              </div>
              <div className='text-center mt-2'>
                {isRecording ? (
                  <span className='text-sm text-muted-foreground'>
                    {t('simulation.labels.recording')}
                  </span>
                ) : isProcessing ? (
                  <span className='text-sm text-muted-foreground'>
                    {t('simulation.labels.generating')}
                  </span>
                ) : (
                  <span className='text-sm text-muted-foreground'>
                    {t('simulation.labels.pressMic')}
                  </span>
                )}
              </div>
            </TabsContent>

            <TabsContent value='text' className='mt-0'>
              <div className='flex items-end gap-4'>
                <div className='flex-1'>
                  <Textarea
                    ref={textareaRef}
                    placeholder={t('simulation.labels.inputPlaceholder')!}
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(false);
                      }
                    }}
                    disabled={isProcessing}
                    className='min-h-[40px] max-h-[120px] resize-none overflow-y-auto'
                    rows={1}
                  />
                </div>
                <Button
                  onClick={() => sendMessage(false)}
                  disabled={isProcessing || !textMessage.trim()}
                  className='flex-shrink-0'
                >
                  <Send className='h-4 w-4 mr-2' />
                  {isProcessing
                    ? t('simulation.labels.generating')
                    : t('simulation.labels.send')}
                </Button>
              </div>
              {isProcessing && (
                <div className='text-center mt-2'>
                  <span className='text-sm text-muted-foreground'>
                    {t('simulation.labels.generating')}
                  </span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );

  return uiMode === 'simulation' ? renderSimulationMode() : renderChatMode();
}
