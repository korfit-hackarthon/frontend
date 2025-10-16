import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Pause,
  ArrowLeft,
  Volume2,
  Type,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import {
  audioService,
  type AudioMessage,
  type SessionWithMessages,
} from '../services/audio';
import {
  requestMicrophonePermission,
  createOptimizedMediaRecorder,
  checkMediaDeviceSupport,
  isPWAInstalled,
  showPWAInstallPrompt,
  initializeAudioContext,
} from '../utils/audioPermissions';

export default function AudioChat() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionWithMessages | null>(null);
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingMessageId, setCurrentProcessingMessageId] = useState<
    string | null
  >(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [voiceName, setVoiceName] = useState('Kore');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'audio' | 'text'>('audio');
  const [textMessage, setTextMessage] = useState('');
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<
    boolean | null
  >(null);
  const [deviceSupport, setDeviceSupport] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);

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
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  useEffect(() => {
    // 메시지 처리 상태를 주기적으로 확인
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

  const loadSession = async () => {
    try {
      if (!sessionId) return;

      const response = await audioService.getSessionById(sessionId);
      if (response.success) {
        setSession(response.data);
        setMessages(response.data.messages);
      } else {
        toast.error('세션을 불러오는데 실패했습니다.');
        navigate('/audio-sessions');
      }
    } catch (error) {
      console.error('세션 로딩 에러:', error);
      toast.error('세션을 불러오는데 실패했습니다.');
      navigate('/audio-sessions');
    }
  };

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
            toast.success('응답이 완료되었습니다.');
          } else {
            toast.error('메시지 처리 중 오류가 발생했습니다.');
          }
        }
      }
    } catch (error) {
      console.error('메시지 상태 확인 에러:', error);
    }
  };

  const startRecording = async () => {
    try {
      // 오디오 권한 확인 (필요시 요청)
      if (audioPermissionGranted === null) {
        const permissionResult = await requestMicrophonePermission();
        setAudioPermissionGranted(permissionResult.granted);

        if (!permissionResult.granted) {
          toast.error(permissionResult.message || '마이크 권한이 필요합니다.');
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

          // 짧은 지연 후 자동으로 메시지 전송
          setTimeout(async () => {
            if (sessionId && audioBlob) {
              try {
                setIsProcessing(true);

                const response = await audioService.processAudioMessage(
                  sessionId,
                  audioBlob,
                  systemPrompt || undefined,
                  voiceName
                );

                if (response.success) {
                  setCurrentProcessingMessageId(response.data.messageId);

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
                  toast.info('메시지 처리를 시작합니다...');
                } else {
                  toast.error('메시지 전송에 실패했습니다.');
                  setIsProcessing(false);
                }
              } catch (error) {
                console.error('메시지 전송 에러:', error);
                toast.error('메시지 전송에 실패했습니다.');
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
      toast.success('녹음을 시작합니다...');
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

  const sendTextMessage = async () => {
    if (!textMessage.trim() || !sessionId) {
      toast.error('메시지를 입력해주세요.');
      return;
    }

    try {
      setIsProcessing(true);

      const response = await audioService.processTextMessage(
        sessionId,
        textMessage,
        systemPrompt || undefined,
        voiceName
      );

      if (response.success) {
        setCurrentProcessingMessageId(response.data.messageId);
        setTextMessage('');

        // 새 메시지를 로컬 상태에 추가
        const newMessage: AudioMessage = {
          _id: response.data.messageId,
          sessionId,
          userAudioUrl: 'text_input',
          userTextFromSTT: textMessage,
          aiResponseText: '',
          aiAudioUrl: '',
          processingStatus: 'llm_processing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        toast.info('메시지 처리를 시작합니다...');
      } else {
        toast.error('메시지 전송에 실패했습니다.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('메시지 전송 에러:', error);
      toast.error('메시지 전송에 실패했습니다.');
      setIsProcessing(false);
    }
  };

  const playAudio = async (audioUrl: string, messageId: string) => {
    try {
      if (playingAudioId === messageId) {
        // 현재 재생 중인 오디오 중지
        const currentAudio = audioElementsRef.current.get(messageId);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        setPlayingAudioId(null);
        return;
      }

      // 다른 오디오들 중지
      audioElementsRef.current.forEach((audio, id) => {
        if (id !== messageId) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // 백엔드 서버 URL로 절대 경로 생성
      const fullAudioUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `${
            import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
          }${audioUrl}`;

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
      toast.error('오디오 재생에 실패했습니다.');
      setPlayingAudioId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { text: '대기 중', variant: 'secondary' as const },
      stt_processing: { text: '음성 인식 중', variant: 'default' as const },
      llm_processing: { text: 'AI 처리 중', variant: 'default' as const },
      tts_processing: { text: '음성 생성 중', variant: 'default' as const },
      completed: { text: '완료', variant: 'default' as const },
      error: { text: '오류', variant: 'destructive' as const },
    };

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  // JSON을 찾아서 파싱하는 함수
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

  // 단계별 상태를 표시하는 컴포넌트
  const renderStepsTable = (data: any) => {
    if (!data.steps_status || !Array.isArray(data.steps_status)) {
      return null;
    }

    const getStepStatusBadge = (status: string) => {
      const statusMap = {
        pending: { text: '대기 중', variant: 'secondary' as const },
        in_progress: { text: '진행 중', variant: 'default' as const },
        completed: { text: '완료', variant: 'outline' as const },
        error: { text: '오류', variant: 'destructive' as const },
      };

      const statusInfo =
        statusMap[status as keyof typeof statusMap] || statusMap.pending;
      return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
    };

    return (
      <div className='mt-3 p-3 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2 mb-3'>
          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
          <span className='text-sm font-medium'>
            현재 단계: {data.current_step}단계
          </span>
        </div>
        <div className='space-y-2'>
          {data.steps_status.map((step: any, index: number) => (
            <div
              key={index}
              className='flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border'
            >
              <div className='w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0'>
                {step.step}
              </div>
              <div className='flex-1 min-w-0'>
                <span className='text-sm text-gray-800 leading-relaxed break-all'>
                  {step.name}
                </span>
              </div>
              <div className='flex-shrink-0'>
                {getStepStatusBadge(step.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // JSON을 테이블로 렌더링하는 컴포넌트
  const renderJsonAsTable = (jsonData: any) => {
    // 단계별 상태 데이터인 경우
    if (jsonData.steps_status) {
      return renderStepsTable(jsonData);
    }

    // 일반적인 JSON 객체를 키-값 테이블로 표시
    return (
      <div className='mt-3 p-3 bg-muted/50 rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>항목</TableHead>
              <TableHead>값</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(jsonData).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className='font-medium'>{key}</TableCell>
                <TableCell>
                  {typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // 텍스트에서 JSON 부분을 제거하고 나머지 텍스트를 반환
  const cleanTextFromJson = (text: string, jsonMatches: any[]) => {
    if (jsonMatches.length === 0) return text;

    let cleanedText = text;
    // 뒤에서부터 제거 (인덱스가 변하지 않도록)
    for (let i = jsonMatches.length - 1; i >= 0; i--) {
      const match = jsonMatches[i];
      cleanedText =
        cleanedText.slice(0, match.startIndex) +
        cleanedText.slice(match.endIndex);
    }

    return cleanedText.trim();
  };

  if (!session) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='mb-6'>
        <div className='flex items-center gap-4 mb-4'>
          <Button variant='ghost' onClick={() => navigate('/audio-sessions')}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{session.session.title}</h1>
            <p className='text-muted-foreground'>AI와의 음성 대화</p>
          </div>
        </div>

        {/* 설정 패널 */}
        <Card className='mb-6'>
          <CardContent className='p-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  시스템 프롬프트 (선택사항)
                </label>
                <Textarea
                  placeholder='AI에게 특별한 역할이나 지시사항을 입력하세요...'
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  음성 타입
                </label>
                <Select value={voiceName} onValueChange={setVoiceName}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Kore'>한국어 (Kore)</SelectItem>
                    <SelectItem value='Aoede'>영어 (Aoede)</SelectItem>
                    <SelectItem value='Charon'>남성 목소리 (Charon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메시지 목록 */}
      <div className='space-y-4 mb-6'>
        {messages.map((message) => (
          <div key={message._id} className='space-y-4'>
            {/* 사용자 메시지 */}
            {message.userTextFromSTT && (
              <div className='flex justify-end'>
                <Card className='max-w-sm'>
                  <CardContent className='p-3'>
                    <div className='text-sm mb-2'>
                      {message.userTextFromSTT}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI 응답 */}
            {(message.aiResponseText ||
              message.processingStatus !== 'pending') && (
              <div className='flex justify-start'>
                <Card className='max-w-sm'>
                  <CardContent className='p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                      <span className='text-xs font-medium'>AI 어시스턴트</span>
                      {getStatusBadge(message.processingStatus)}
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
                            <>
                              {cleanedText && (
                                <div className='whitespace-pre-wrap'>
                                  {cleanedText}
                                </div>
                              )}
                              {jsonMatches.map((match, index) => (
                                <div key={index}>
                                  {renderJsonAsTable(match.parsedData)}
                                </div>
                              ))}
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
                          <Pause className='h-4 w-4 mr-2' />
                        ) : (
                          <Volume2 className='h-4 w-4 mr-2' />
                        )}
                        {playingAudioId === message._id
                          ? '일시정지'
                          : '음성 재생'}
                      </Button>
                    )}

                    <div className='text-xs text-muted-foreground mt-2'>
                      {new Date(message.updatedAt).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 입력 컨트롤 */}
      <Card className='sticky bottom-6'>
        <CardContent className='p-4'>
          <Tabs
            value={inputMode}
            onValueChange={(value) => setInputMode(value as 'audio' | 'text')}
          >
            <TabsList className='grid w-full grid-cols-2 mb-4'>
              <TabsTrigger value='audio' className='flex items-center gap-2'>
                <Mic className='h-4 w-4' />
                음성 입력
              </TabsTrigger>
              <TabsTrigger value='text' className='flex items-center gap-2'>
                <Type className='h-4 w-4' />
                텍스트 입력
              </TabsTrigger>
            </TabsList>

            <TabsContent value='audio' className='mt-0'>
              <div className='flex items-center gap-4'>
                <Button
                  size='lg'
                  variant={isRecording ? 'destructive' : 'default'}
                  onClick={handleMicButtonClick}
                  disabled={isProcessing && !isRecording}
                  className='flex-shrink-0'
                >
                  {isRecording ? (
                    <MicOff className='h-5 w-5 mr-2' />
                  ) : (
                    <Mic className='h-5 w-5 mr-2' />
                  )}
                  {isRecording ? '녹음 중지' : '녹음 시작'}
                </Button>

                <div className='flex-1 text-center'>
                  {isRecording && (
                    <div
                      className='flex items-center justify-center gap-2'
                      onClick={handleMicButtonClick}
                    >
                      <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                      <span className='text-sm text-muted-foreground'>
                        녹음 중...
                      </span>
                    </div>
                  )}
                  {isProcessing && (
                    <span className='text-sm text-muted-foreground'>
                      AI가 응답을 생성하고 있습니다...
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='text' className='mt-0'>
              <div className='flex items-center gap-4'>
                <div className='flex-1'>
                  <Input
                    placeholder='메시지를 입력하세요...'
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendTextMessage();
                      }
                    }}
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  onClick={sendTextMessage}
                  disabled={isProcessing || !textMessage.trim()}
                  className='flex-shrink-0'
                >
                  <Send className='h-4 w-4 mr-2' />
                  {isProcessing ? '처리 중...' : '전송'}
                </Button>
              </div>
              {isProcessing && (
                <div className='text-center mt-2'>
                  <span className='text-sm text-muted-foreground'>
                    AI가 응답을 생성하고 있습니다...
                  </span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
