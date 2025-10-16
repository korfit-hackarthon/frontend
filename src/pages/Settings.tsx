import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Languages,
  Shield,
  Calendar,
  Users,
  Target,
  FileText,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import LanguageSettings from '@/components/LanguageSettings';

type BasicInfo = {
  name: string;
  nativeLanguage: string;
  residenceStatus: string;
  firstEntryDate: string; // ISO string
  familyComposition?: string;
  longTermGoal?: string;
  notes?: string;
};

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);

  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/basic-info');
        if (res.data) {
          setBasicInfo(res.data as BasicInfo);
        }
      } catch (error) {
        console.error('설정 불러오기 에러:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBasicInfo();
  }, []);
  const languageLabel = useMemo(() => {
    if (!basicInfo?.nativeLanguage) return '-';
    if (basicInfo.nativeLanguage === 'ko') return t('languages.korean');
    if (basicInfo.nativeLanguage === 'en') return t('languages.english');
    return basicInfo.nativeLanguage;
  }, [basicInfo, i18n.language]);

  const familyMap = {
    alone: t('profile.familyOptions.alone'),
    withSpouse: t('profile.familyOptions.withSpouse'),
    withChildren: t('profile.familyOptions.withChildren'),
    other: t('profile.familyOptions.other'),
  } as const;

  const goalMap = {
    academic: t('profile.goalOptions.academic'),
    employment: t('profile.goalOptions.employment'),
    business: t('profile.goalOptions.business'),
    cultural: t('profile.goalOptions.cultural'),
    language: t('profile.goalOptions.language'),
  } as const;

  const familyLabel = useMemo(() => {
    const key = basicInfo?.familyComposition as
      | keyof typeof familyMap
      | undefined;
    if (!key) return '-';
    return familyMap[key] ?? '-';
  }, [basicInfo, i18n.language]);

  const goalLabel = useMemo(() => {
    const key = basicInfo?.longTermGoal as keyof typeof goalMap | undefined;
    if (!key) return '-';
    return goalMap[key] ?? '-';
  }, [basicInfo, i18n.language]);

  return (
    <div className='container mx-auto max-w-3xl'>
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
          {/* <p className='text-sm opacity-90'>
            {t('dashboard.stayDays', { days: stayDays.toLocaleString() })}
          </p> */}
        </div>

        {/* 인사말과 캐릭터 */}
        <div className='flex justify-between items-center'>
          <div>
            {/* <h1 className='text-2xl font-bold mb-1'>
              {t('dashboard.greeting', { name: userName })}
            </h1> */}
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
      <Card className='m-6'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                {t('navigation.settings')}
                {basicInfo && (
                  <Badge variant='secondary'>{t('profile.profileInfo')}</Badge>
                )}
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                {t('profile.profileInfoDescription')}
              </p>
            </div>
            {basicInfo && (
              <Button
                onClick={() => navigate('/profile-setup')}
                variant='outline'
                size='sm'
              >
                {t('profile.editProfile')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='py-10 text-center text-muted-foreground'>
              {t('common.loading')}
            </div>
          ) : !basicInfo ? (
            <div className='py-10 text-center'>
              <p className='text-muted-foreground mb-4'>
                {t('profile.setupRequired')}
              </p>
              <Button onClick={() => navigate('/profile-setup')}>
                {t('profile.setupButton')}
              </Button>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3 rounded-lg border p-4 bg-white'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <User className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-xs text-muted-foreground'>
                      {t('profile.name')}
                    </div>
                    <div className='font-medium'>{basicInfo.name}</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg border p-4 bg-white'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <Languages className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-xs text-muted-foreground'>
                      {t('profile.nativeLanguage')}
                    </div>
                    <div className='font-medium'>{languageLabel}</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg border p-4 bg-white'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <Shield className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-xs text-muted-foreground'>
                      {t('profile.residenceStatus')}
                    </div>
                    <div className='font-medium'>
                      {basicInfo.residenceStatus || '-'}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg border p-4 bg-white'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <Calendar className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-xs text-muted-foreground'>
                      {t('profile.firstEntryDate')}
                    </div>
                    <div className='font-medium'>
                      {basicInfo.firstEntryDate
                        ? new Date(
                            basicInfo.firstEntryDate
                          ).toLocaleDateString()
                        : '-'}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg border p-4 bg-white'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <Users className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-xs text-muted-foreground'>
                      {t('profile.familyComposition')}
                    </div>
                    <div className='font-medium'>{familyLabel}</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg border p-4 bg-white'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <Target className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1'>
                    <div className='text-xs text-muted-foreground'>
                      {t('profile.longTermGoal')}
                    </div>
                    <div className='font-medium'>{goalLabel}</div>
                  </div>
                </div>
              </div>

              <div className='rounded-lg border p-4 bg-white'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='p-2 bg-primary/10 rounded-md'>
                    <FileText className='h-4 w-4 text-primary' />
                  </div>
                  <div className='text-sm font-medium'>
                    {t('profile.profileInfo')}
                  </div>
                </div>
                <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                  {basicInfo.notes || '-'}
                </div>
              </div>

              {/* 언어 설정 섹션 */}
              <LanguageSettings />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
