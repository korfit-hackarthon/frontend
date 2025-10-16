import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Check, CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import api from '@/utils/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

interface FormData {
  nativeLanguage: string;
  name: string;
  residenceStatus: string;
  firstEntryDate: Date | undefined;
  familyComposition: string;
  longTermGoal: string;
}

const languages = [
  { code: 'en', name: '영어 (English)', flag: '🇺🇸' },
  { code: 'zh', name: '중국어 (中文)', flag: '🇨🇳' },
  { code: 'ja', name: '일본어 (日本語)', flag: '🇯🇵' },
  { code: 'vi', name: '베트남어 (Tiếng Việt)', flag: '🇻🇳' },
  { code: 'th', name: '태국어 (ภาษาไทย)', flag: '🇹🇭' },
  { code: 'id', name: '인도네시아어 (Bahasa Indonesia)', flag: '🇮🇩' },
  { code: 'hi', name: '힌디어 (हिन्दी)', flag: '🇮🇳' },
  { code: 'ar', name: '아랍어 (العربية)', flag: '🇸🇦' },
  { code: 'ru', name: '러시아어 (Русский)', flag: '🇷🇺' },
  { code: 'es', name: '스페인어 (Español)', flag: '🇪🇸' },
  { code: 'fr', name: '프랑스어 (Français)', flag: '🇫🇷' },
  { code: 'de', name: '독일어 (Deutsch)', flag: '🇩🇪' },
  { code: 'other', name: '기타', flag: '🌍' },
];

const residenceStatuses = [
  { value: 'D-2', label: 'D-2 (유학)', description: '유학생' },
  { value: 'D-4', label: 'D-4 (일반 연수)', description: '연수생' },
  { value: 'E-2', label: 'E-2 (회화 지도)', description: '외국어 강사' },
  { value: 'F-2', label: 'F-2 (거주)', description: '거주자' },
  { value: 'F-5', label: 'F-5 (영주권)', description: '영주권자' },
  { value: '관광객', label: '관광객', description: '단기 방문' },
  { value: '취업비자', label: '취업비자', description: '일반 취업' },
  { value: '영주권', label: '영주권', description: '영주권자' },
  { value: '시민권', label: '시민권', description: '귀화자' },
  { value: '기타', label: '기타', description: '기타 자격' },
];

const familyCompositions = [
  { value: 'alone', label: '본인 생활', icon: '🧑‍💼' },
  { value: 'withSpouse', label: '배우자와 함께', icon: '👫' },
  { value: 'withChildren', label: '자녀가 있는 가족', icon: '👨‍👩‍👧‍👦' },
  { value: 'other', label: '기타 가족 형태', icon: '👥' },
];

const longTermGoals = [
  { value: 'academic', label: '학업 완성', icon: '🎓' },
  { value: 'employment', label: '취업/이민', icon: '💼' },
  { value: 'business', label: '취업/영업', icon: '📈' },
  { value: 'cultural', label: '문화 체험', icon: '🏛️' },
  { value: 'language', label: '언어 습득', icon: '🗣️' },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nativeLanguage: '',
    name: '',
    residenceStatus: '',
    firstEntryDate: undefined,
    familyComposition: '',
    longTermGoal: '',
  });

  const steps = [
    {
      id: 1,
      title: t('profile.selectNativeLanguage'),
      description: t('profile.nativeLanguageDescription'),
    },
    {
      id: 2,
      title: t('profile.enterName'),
      description: t('profile.nameDescription'),
    },
    {
      id: 3,
      title: t('profile.selectResidenceStatus'),
      description: t('profile.residenceStatusDescription'),
    },
    {
      id: 4,
      title: t('profile.enterFirstEntryDate'),
      description: t('profile.firstEntryDateDescription'),
    },
    {
      id: 5,
      title: t('profile.selectFamilyComposition'),
      description: t('profile.familyCompositionDescription'),
    },
    {
      id: 6,
      title: t('profile.selectLongTermGoal'),
      description: t('profile.longTermGoalDescription'),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // 첫 번째 단계에서는 이전 페이지로 이동
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      await api
        .post('/api/basic-info', {
          name: formData.name,
          nativeLanguage: formData.nativeLanguage,
          residenceStatus: formData.residenceStatus,
          firstEntryDate: formData.firstEntryDate?.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
          familyComposition: formData.familyComposition,
          longTermGoal: formData.longTermGoal,
        })
        .then((_) => {
          // 성공 시 대시보드로 이동 (replace: true로 히스토리 교체)
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        })
        .catch((err) => {
          toast.error('프로필 설정 에러:', err);
        });
    } catch (error) {
      toast.error(t('profile.setupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.nativeLanguage !== '';
      case 2:
        return formData.name.trim() !== '';
      case 3:
        return formData.residenceStatus !== '';
      case 4:
        return formData.firstEntryDate !== undefined;
      case 5:
        return formData.familyComposition !== '';
      case 6:
        return formData.longTermGoal !== '';
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            <div className='grid gap-3'>
              {languages.map((language) => (
                <button
                  key={language.code}
                  type='button'
                  onClick={() =>
                    setFormData({ ...formData, nativeLanguage: language.name })
                  }
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
                    formData.nativeLanguage === language.name
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <span className='text-xl'>{language.flag}</span>
                  <span className='font-medium'>{language.name}</span>
                  {formData.nativeLanguage === language.name && (
                    <Check className='w-5 h-5 text-primary ml-auto' />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='name'>{t('profile.name')}</Label>
              <Input
                id='name'
                type='text'
                placeholder={t('profile.namePlaceholder')}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='text-lg h-12'
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-4'>
            <div className='grid gap-3'>
              {residenceStatuses.map((status) => (
                <button
                  key={status.value}
                  type='button'
                  onClick={() =>
                    setFormData({ ...formData, residenceStatus: status.value })
                  }
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
                    formData.residenceStatus === status.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <div>
                    <div className='font-medium'>{status.label}</div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      {status.description}
                    </div>
                  </div>
                  {formData.residenceStatus === status.value && (
                    <Check className='w-5 h-5 text-primary' />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label>{t('profile.firstEntryDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full h-12 text-lg justify-start text-left font-normal',
                      !formData.firstEntryDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {formData.firstEntryDate ? (
                      format(formData.firstEntryDate, 'PPP', {
                        locale: i18n.language === 'ko' ? ko : enUS,
                      })
                    ) : (
                      <span>{t('profile.selectDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={formData.firstEntryDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, firstEntryDate: date })
                    }
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 5:
        return (
          <div className='space-y-4'>
            <div className='grid gap-3'>
              {familyCompositions.map((family) => (
                <button
                  key={family.value}
                  type='button'
                  onClick={() =>
                    setFormData({
                      ...formData,
                      familyComposition: family.value,
                    })
                  }
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
                    formData.familyComposition === family.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <span className='text-xl'>{family.icon}</span>
                  <span className='font-medium'>
                    {t(`profile.familyOptions.${family.value}`)}
                  </span>
                  {formData.familyComposition === family.value && (
                    <Check className='w-5 h-5 text-primary ml-auto' />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className='space-y-4'>
            <div className='grid gap-3'>
              {longTermGoals.map((goal) => (
                <button
                  key={goal.value}
                  type='button'
                  onClick={() =>
                    setFormData({ ...formData, longTermGoal: goal.value })
                  }
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
                    formData.longTermGoal === goal.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <span className='text-xl'>{goal.icon}</span>
                  <span className='font-medium'>
                    {t(`profile.goalOptions.${goal.value}`)}
                  </span>
                  {formData.longTermGoal === goal.value && (
                    <Check className='w-5 h-5 text-primary ml-auto' />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 p-4'>
      <div className='w-full max-w-md mx-auto'>
        {/* 헤더 */}
        <div className='flex items-center justify-between mb-6'>
          <button
            onClick={handleBack}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-6 h-6' />
          </button>
          <h1 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
            {t('profile.setup')}
          </h1>
          <div className='w-10' /> {/* 균형을 위한 공간 */}
        </div>

        {/* 6개 프로그레스 바 */}
        <div className='flex gap-2 mb-6'>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex-1 h-1 rounded-full transition-colors',
                index < currentStep
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>

        {/* 단계 표시 */}
        <div className='text-center mb-8'>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            {currentStep}/{steps.length}
          </div>
        </div>

        {/* 메인 카드 */}
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-lg'>
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>{renderStepContent()}</CardContent>
        </Card>

        {/* 네비게이션 버튼 */}
        <div className='mt-6'>
          {currentStep === steps.length ? (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentStepValid() || isLoading}
              className='w-full h-12 text-base font-medium'
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                  {t('profile.setting')}
                </>
              ) : (
                <>
                  <Check className='w-4 h-4 mr-2' />
                  {t('common.complete')}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
              className='w-full h-12 text-base font-medium'
            >
              {t('common.next')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
