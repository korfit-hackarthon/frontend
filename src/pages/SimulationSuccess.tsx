import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  RotateCcw,
  Home,
  Clock,
  CheckCircle,
  Star,
} from 'lucide-react';
import { SIMULATION_SCENARIOS } from '@/data/simulations';

export default function SimulationSuccess() {
  const { simulationId } = useParams<{ simulationId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showAnimation, setShowAnimation] = useState(false);

  // 애니메이션 효과
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 시뮬레이션 정보 가져오기
  const simulation = simulationId ? SIMULATION_SCENARIOS[simulationId] : null;

  if (!simulation) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>시뮬레이션을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/dashboard')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md mx-auto'>
        {/* 성공 카드 */}
        <Card
          className={`
          bg-white shadow-2xl border-0 rounded-3xl overflow-hidden
          transform transition-all duration-700 ease-out
          ${
            showAnimation
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-95 opacity-0 translate-y-8'
          }
        `}
        >
          <CardContent className='p-0'>
            {/* 상단 그라디언트 헤더 */}
            <div className='bg-gradient-to-br from-[#2D3E85] to-[#1A237E] text-white text-center py-12 px-6 relative overflow-hidden'>
              {/* 배경 장식 */}
              <div className='absolute inset-0 opacity-10'>
                <div className='absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-pulse'></div>
                <div className='absolute top-12 right-8 w-4 h-4 bg-white rounded-full animate-pulse delay-150'></div>
                <div className='absolute bottom-8 left-12 w-6 h-6 bg-white rounded-full animate-pulse delay-300'></div>
                <div className='absolute bottom-4 right-4 w-5 h-5 bg-white rounded-full animate-pulse delay-500'></div>
              </div>

              {/* 메인 제목 */}
              <h1
                className={`
                text-3xl font-bold mb-3 relative z-10
                transform transition-all duration-1000 delay-300
                ${
                  showAnimation
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                }
              `}
              >
                {t('success.title', '미션 성공!')}
              </h1>

              <p
                className={`
                text-lg opacity-90 relative z-10
                transform transition-all duration-1000 delay-500
                ${
                  showAnimation
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                }
              `}
              >
                {t(
                  'success.subtitle',
                  '축하합니다! 상황에서도 잘 해결할 수 있어요'
                )}
              </p>
            </div>

            {/* 폭죽 이미지 영역 */}
            <div
              className={`
              py-12 px-6 text-center bg-white relative
              transform transition-all duration-1000 delay-700
              ${
                showAnimation
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              }
            `}
            >
              {/* 폭죽 이미지 */}
              <div className='relative mx-auto mb-8'>
                <div
                  className={`
                  w-48 h-48 mx-auto relative
                  transform transition-all duration-1000 delay-900
                  ${showAnimation ? 'scale-100 rotate-0' : 'scale-50 rotate-12'}
                `}
                >
                  <img
                    src='/폭죽.png'
                    alt='Success Celebration'
                    className='w-full h-full object-contain drop-shadow-lg'
                  />
                </div>

                {/* 주변 장식 효과 */}
                <div className='absolute inset-0 pointer-events-none'>
                  <div
                    className={`
                    absolute top-4 left-8 text-yellow-400 text-2xl
                    transform transition-all duration-1000 delay-1100
                    ${
                      showAnimation
                        ? 'translate-y-0 opacity-100 rotate-0'
                        : 'translate-y-4 opacity-0 rotate-45'
                    }
                  `}
                  >
                    ✨
                  </div>
                  <div
                    className={`
                    absolute top-8 right-4 text-yellow-400 text-xl
                    transform transition-all duration-1000 delay-1300
                    ${
                      showAnimation
                        ? 'translate-y-0 opacity-100 rotate-0'
                        : 'translate-y-4 opacity-0 -rotate-45'
                    }
                  `}
                  >
                    ⭐
                  </div>
                  <div
                    className={`
                    absolute bottom-12 left-4 text-yellow-400 text-lg
                    transform transition-all duration-1000 delay-1500
                    ${
                      showAnimation
                        ? 'translate-y-0 opacity-100 rotate-0'
                        : 'translate-y-4 opacity-0 rotate-90'
                    }
                  `}
                  >
                    🎉
                  </div>
                  <div
                    className={`
                    absolute bottom-8 right-12 text-yellow-400 text-xl
                    transform transition-all duration-1000 delay-1700
                    ${
                      showAnimation
                        ? 'translate-y-0 opacity-100 rotate-0'
                        : 'translate-y-4 opacity-0 -rotate-90'
                    }
                  `}
                  >
                    ✨
                  </div>
                </div>
              </div>

              {/* 시뮬레이션 정보 */}
              <div
                className={`
                bg-gray-50 rounded-2xl p-4 mb-6
                transform transition-all duration-1000 delay-1000
                ${
                  showAnimation
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-4 opacity-0'
                }
              `}
              >
                <div className='flex items-center justify-center gap-2 mb-2'>
                  <Badge
                    variant='secondary'
                    className='bg-green-100 text-green-800'
                  >
                    <CheckCircle className='w-3 h-3 mr-1' />
                    {t('success.completed', '완료')}
                  </Badge>
                  <Badge variant='outline'>{simulation.category}</Badge>
                </div>
                <h3 className='font-bold text-lg text-gray-900 mb-1'>
                  {simulation.title}
                </h3>
                <div className='flex items-center justify-center gap-4 text-sm text-gray-600'>
                  <div className='flex items-center gap-1'>
                    <Clock className='w-4 h-4' />
                    <span>{simulation.duration || '15분'}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    <span>{simulation.difficulty || '중급'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div
              className={`
              p-6 space-y-3 bg-gray-50
              transform transition-all duration-1000 delay-1200
              ${
                showAnimation
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              }
            `}
            >
              {/* 학습 팁 확인하기 버튼 */}
              <Button
                className='w-full bg-[#2D3E85] hover:bg-[#1A237E] text-white py-3 rounded-xl font-medium text-base shadow-lg'
                onClick={() => {
                  // TODO: 학습 팁 페이지 또는 다이얼로그로 이동
                  console.log('학습 팁 확인하기');
                }}
              >
                {t('success.viewTips', '학습 팁도 확인하기')}
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>

              {/* 하단 액션 버튼들 */}
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  variant='outline'
                  className='py-3 rounded-xl font-medium border-2'
                  onClick={() => navigate(`/simulation/${simulationId}`)}
                >
                  <RotateCcw className='w-4 h-4 mr-2' />
                  {t('success.retry', '다시 도전')}
                </Button>

                <Button
                  variant='outline'
                  className='py-3 rounded-xl font-medium border-2'
                  onClick={() => navigate('/dashboard')}
                >
                  <Home className='w-4 h-4 mr-2' />
                  {t('success.home', '홈으로')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 추가 시뮬레이션 추천 */}
        <div
          className={`
          mt-6 text-center
          transform transition-all duration-1000 delay-1400
          ${
            showAnimation
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          }
        `}
        >
          <Button
            variant='ghost'
            className='text-gray-600 hover:text-gray-900'
            onClick={() => navigate('/simulations')}
          >
            {t('success.moreSimulations', '다른 시뮬레이션도 도전해보세요')}
            <ArrowRight className='w-4 h-4 ml-1' />
          </Button>
        </div>
      </div>
    </div>
  );
}
