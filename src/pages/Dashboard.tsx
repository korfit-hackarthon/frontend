import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { userAtom } from '../stores/auth';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Calendar, Clock, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';

// 미션 데이터 타입
interface Mission {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'pending' | 'completed' | 'urgent';
  icon: React.ReactNode;
  category: 'recommended' | 'required';
}

// 기본 정보 타입
interface BasicInfo {
  name: string;
  nativeLanguage: string;
  residenceStatus: string;
  firstEntryDate: string;
  familyComposition?: string;
  longTermGoal?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const user = useAtomValue(userAtom);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 기본 정보 조회
  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/basic-info');
        if (response.data) {
          setBasicInfo(response.data);
        }
      } catch (error) {
        console.error('기본정보 조회 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBasicInfo();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  // 사용자 이름 추출 (기본정보가 있으면 사용, 없으면 유저 메타데이터 사용)
  const userName =
    basicInfo?.name ||
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    '사용자';

  // 체류일수 계산 함수
  const calculateStayDays = (firstEntryDate: string): number => {
    try {
      const today = new Date();
      const entryDate = new Date(firstEntryDate);
      const timeDifference = today.getTime() - entryDate.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      return Math.max(0, daysDifference); // 음수 방지
    } catch (error) {
      console.error('체류일수 계산 에러:', error);
      return 0;
    }
  };

  // 체류일수 (최초입국일 기반 계산)
  const stayDays = basicInfo?.firstEntryDate
    ? calculateStayDays(basicInfo.firstEntryDate)
    : 0;

  // 미션 데이터 (2개만 유지)
  const missions: Mission[] = [
    {
      id: '1',
      title: t('dashboard.missions.visaExtension.title'),
      description: t('dashboard.missions.visaExtension.description'),
      duration: '15분',
      status: 'pending',
      icon: <Calendar className='w-5 h-5' />,
      category: 'recommended',
    },
    {
      id: '2',
      title: t('dashboard.missions.bankAccount.title'),
      description: t('dashboard.missions.bankAccount.description'),
      duration: '10분',
      status: 'pending',
      icon: <CreditCard className='w-5 h-5' />,
      category: 'recommended',
    },
  ];

  const getStatusBadge = (status: Mission['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className='bg-orange-500 hover:bg-orange-600'>
            {t('dashboard.status.pending')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge className='bg-green-500 hover:bg-green-600'>
            {t('dashboard.status.completed')}
          </Badge>
        );
      case 'urgent':
        return (
          <Badge className='bg-red-500 hover:bg-red-600'>
            {t('dashboard.status.urgent')}
          </Badge>
        );
      default:
        return <Badge>{t('dashboard.status.pending')}</Badge>;
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // 기본정보가 없는 경우 (ProtectedRoute에서 대부분 걸러지지만 추가 안전장치)
  if (!basicInfo) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>{t('profile.setupRequired')}</p>
          <Button onClick={() => (window.location.href = '/profile-setup')}>
            {t('profile.setupButton')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 그라디언트 헤더 */}
      <div className='bg-gradient-to-br from-[#25329F] to-[#181A4D] text-white p-6 rounded-b-3xl'>
        {/* 상단 내비게이션 */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-2'>
            <img src='/logo3.png' alt='Kuuid' className='h-6' />
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='text-white hover:bg-white/20'
          >
            <SidebarTrigger className='size-10' />
          </Button>
        </div>

        {/* 체류 일수 */}
        <div className='mb-2'>
          <p className='text-sm opacity-90'>
            {t('dashboard.stayDays', { days: stayDays.toLocaleString() })}
          </p>
        </div>

        {/* 인사말과 캐릭터 */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold mb-1'>
              {t('dashboard.greeting', { name: userName })}
            </h1>
            <p className='text-lg opacity-90'>{t('dashboard.todayMessage')}</p>
          </div>
          <div className='relative'>
            <img
              src='/image1.png'
              alt='Kuuid Character'
              className='w-28 h-28 object-contain'
            />
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className='p-6 space-y-8'>
        {/* 추천 미션 */}
        <section>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            {t('dashboard.recommendedMissions')}
          </h2>
          <div className='space-y-4'>
            {missions.map((mission) => (
              <Card
                key={mission.id}
                className='hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => {
                  // 시뮬레이션으로 연결
                  if (mission.id === '1') {
                    navigate('/simulation/visa-extension');
                  } else if (mission.id === '2') {
                    navigate('/simulation/bank-account');
                  }
                }}
              >
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3 flex-1'>
                      <div className='p-2 bg-gray-100 rounded-lg'>
                        {mission.icon}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='font-semibold text-gray-900'>
                            {mission.title}
                          </h3>
                          {getStatusBadge(mission.status)}
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {mission.description}
                        </p>
                        <div className='flex items-center gap-1 text-xs text-gray-500'>
                          <Clock className='w-3 h-3' />
                          <span>{mission.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
