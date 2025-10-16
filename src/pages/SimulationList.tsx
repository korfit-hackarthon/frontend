import { useNavigate } from 'react-router-dom';
import { Play, User, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';

import { SIMULATION_SCENARIO_LIST } from '@/data/simulations';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

export default function SimulationList() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급':
        return 'bg-green-100 text-green-800';
      case '중급':
        return 'bg-yellow-100 text-yellow-800';
      case '고급':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '등록':
        return 'bg-blue-100 text-blue-800';
      case '금융':
        return 'bg-purple-100 text-purple-800';
      case '의료':
        return 'bg-green-100 text-green-800';
      case '일반':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='container mx-auto'>
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
        {/* <div className='mb-2'>
          <p className='text-sm opacity-90'>
            {t('dashboard.stayDays', { days: stayDays.toLocaleString() })}
          </p>
        </div> */}

        {/* 인사말과 캐릭터 */}
        <div className='flex justify-between items-center'>
          <div>
            {/* <h1 className='text-2xl font-bold mb-1'>
              {t('dashboard.greeting', { name: userName })}
            </h1> */}
            {/* <p className='text-lg opacity-90'>{t('simulations.header')}</p> */}
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

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
        {SIMULATION_SCENARIO_LIST.map((simulation) => {
          return (
            <Card
              key={simulation.id}
              className='hover:shadow-lg transition-shadow group'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-primary/10 rounded-lg' />
                    <div>
                      <CardTitle className='text-lg'>
                        {t(`simulation.scenarios.${simulation.id}.title`, {
                          defaultValue: simulation.title,
                        })}
                      </CardTitle>
                      <div className='flex gap-2 mt-1'>
                        <Badge
                          variant='secondary'
                          className={getCategoryColor(simulation.category)}
                        >
                          {t(`simulation.categories.${simulation.category}`, {
                            defaultValue: simulation.category,
                          })}
                        </Badge>
                        {simulation.difficulty && (
                          <Badge
                            variant='outline'
                            className={getDifficultyColor(
                              simulation.difficulty
                            )}
                          >
                            {simulation.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  {simulation.description}
                </p>

                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <Clock className='h-4 w-4' />
                    {simulation.duration}
                  </div>
                  <div className='flex items-center gap-1'>
                    <User className='h-4 w-4' />
                    1:1 대화
                  </div>
                </div>

                {/* 진행 단계 미리보기 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>진행 단계:</h4>
                  <div className='space-y-1'>
                    {simulation.steps.map((s, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 text-xs text-muted-foreground'
                      >
                        <div className='w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium'>
                          {index + 1}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/simulation/${simulation.id}`)}
                  className='w-full group-hover:bg-primary/90 transition-colors'
                >
                  <Play className='h-4 w-4 mr-2' />
                  {t('simulations.start')}
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 추가 시뮬레이션 준비 중 */}
      <Card className='border-dashed'>
        <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
          <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4'>
            <Play className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium mb-2'>
            {t('simulations.moreSimulations')}
          </h3>
          <p className='text-muted-foreground text-sm'>
            {t('simulations.moreSimulationsDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
