import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Trash2, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { audioService, type AudioSession } from '../services/audio';

export default function AudioSessions() {
  const [sessions, setSessions] = useState<AudioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await audioService.getAllSessions();
      if (response.success) {
        setSessions(response.data);
      } else {
        toast.error('세션 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('세션 로딩 에러:', error);
      toast.error('세션 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) {
      toast.error('세션 제목을 입력해주세요.');
      return;
    }

    try {
      setCreatingSession(true);
      const response = await audioService.createSession(newSessionTitle.trim());
      if (response.success) {
        toast.success('새로운 세션이 생성되었습니다.');
        setNewSessionTitle('');
        setIsCreateDialogOpen(false);
        loadSessions(); // 목록 새로고침
      } else {
        toast.error('세션 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('세션 생성 에러:', error);
      toast.error('세션 생성에 실패했습니다.');
    } finally {
      setCreatingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await audioService.deleteSession(sessionId);
      if (response.success) {
        toast.success('세션이 삭제되었습니다.');
        loadSessions(); // 목록 새로고침
      } else {
        toast.error('세션 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('세션 삭제 에러:', error);
      toast.error('세션 삭제에 실패했습니다.');
    }
  };

  const handleEnterChat = (sessionId: string) => {
    navigate(`/audio-chat/${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>세션 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>음성 대화 세션</h1>
          <p className='text-muted-foreground mt-2'>
            AI와의 음성 대화 세션을 관리하세요.
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />새 세션 생성
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 세션 생성</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label htmlFor='title' className='text-sm font-medium'>
                  세션 제목
                </label>
                <Input
                  id='title'
                  placeholder='예: 운동 계획 상담'
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
                />
              </div>
              <div className='flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={creatingSession}
                >
                  {creatingSession ? '생성 중...' : '생성'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length === 0 ? (
        <div className='text-center py-12'>
          <MessageCircle className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>아직 세션이 없습니다</h3>
          <p className='text-muted-foreground mb-4'>
            첫 번째 음성 대화 세션을 시작해보세요!
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />첫 세션 생성하기
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {sessions.map((session) => (
            <Card
              key={session._id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span className='truncate'>{session.title}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>세션 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          정말로 이 세션을 삭제하시겠습니까? 이 작업은 되돌릴 수
                          없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSession(session._id)}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Calendar className='h-4 w-4 mr-2' />
                    {formatDate(session.updatedAt)}
                  </div>
                  <Button
                    className='w-full'
                    onClick={() => handleEnterChat(session._id)}
                  >
                    <MessageCircle className='h-4 w-4 mr-2' />
                    대화 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
