import {
  BarChart3,
  CheckCircle,
  ChevronsUpDown,
  Crown,
  Languages,
  LogOut,
  Settings,
  User,
  Search,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { userAtom } from '@/stores/auth';
import { authService } from '@/services/auth';
import {
  getEnabledLanguages,
  getLanguagesByRegion,
  findLanguageByCode,
  searchLanguages,
} from '@/data/languages';

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(['East Asia', 'Western'])
  );

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setLanguageSearchQuery(''); // 검색 초기화
  };

  const getCurrentLanguage = () => {
    return findLanguageByCode(i18n.language) || getEnabledLanguages()[0];
  };

  // 검색 결과 및 지역별 그룹화
  const searchResults = useMemo(() => {
    return searchLanguages(languageSearchQuery);
  }, [languageSearchQuery]);

  const languagesByRegion = useMemo(() => {
    return getLanguagesByRegion();
  }, []);

  const toggleRegion = (region: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(region)) {
      newExpanded.delete(region);
    } else {
      newExpanded.add(region);
    }
    setExpandedRegions(newExpanded);
  };

  // 유저가 없는 경우 처리
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' onClick={() => navigate('/login')}>
            <Avatar className='h-8 w-8 rounded-lg'>
              <AvatarFallback className='rounded-lg'>
                <User className='h-4 w-4' />
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>
                {t('auth.loginRequired')}
              </span>
              <span className='truncate text-xs'>
                {t('auth.loginDescription')}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // 유저 정보 추출
  const userName =
    user.user_metadata?.full_name || user.email || t('auth.newUser');
  const userEmail = user.email || '';
  const userAvatar = user.user_metadata?.avatar_url || '';
  const userInitials =
    userName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U';

  // 로그인 제공자 확인 (GitHub 또는 Google)
  const provider = user.app_metadata?.provider || 'unknown';
  const providerName =
    provider === 'github'
      ? 'GITHUB'
      : provider === 'google'
      ? 'GOOGLE'
      : 'SOCIAL';
  const providerColor =
    provider === 'github'
      ? 'from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700'
      : provider === 'google'
      ? 'from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700'
      : 'from-purple-400 to-purple-500 dark:from-purple-600 dark:to-purple-700';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className='rounded-lg'>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{userName}</span>
                <span className='truncate text-xs'>{userEmail}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className='rounded-lg'>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <div className='flex items-center gap-1'>
                    <span className='truncate font-medium'>{userName}</span>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                  </div>
                  <span className='truncate text-xs text-muted-foreground'>
                    {t('auth.authenticatedUser')} • {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* User Info Card */}
            <div className='p-2'>
              <Card
                className={`relative overflow-hidden bg-gradient-to-br ${providerColor} p-4 text-white`}
              >
                <div className='absolute top-2 right-4 text-xs font-bold opacity-75'>
                  {providerName}
                </div>
                <div className='mt-6 space-y-2'>
                  <div className='font-medium text-sm'>{userName}</div>
                  <div className='text-xs opacity-90'>{userEmail}</div>
                  <div className='text-xs opacity-75'>
                    {user.last_sign_in_at
                      ? `${t('auth.lastLogin')}: ${new Date(
                          user.last_sign_in_at
                        ).toLocaleDateString(
                          i18n.language === 'ko' ? 'ko-KR' : 'en-US'
                        )}`
                      : t('auth.newUser')}
                  </div>
                </div>
              </Card>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <BarChart3 />
                {t('navigation.dashboard')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile-setup')}>
                <Settings />
                {t('navigation.profile')}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Enhanced Language Selection */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages />
                <span>{t('navigation.language')}</span>
                <span className='ml-auto text-xs opacity-60'>
                  {getCurrentLanguage().flag} {getCurrentLanguage().nativeName}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                className='w-[calc(100vw-3rem)] max-w-80 sm:w-80 sm:max-w-none p-0'
                sideOffset={4}
                alignOffset={-20}
              >
                {/* 현재 언어 표시 */}
                <div className='p-2 sm:p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <span className='text-base sm:text-lg'>
                      {getCurrentLanguage().flag}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='font-medium text-xs sm:text-sm truncate'>
                        {getCurrentLanguage().nativeName}
                      </div>
                      <div className='text-[10px] sm:text-xs text-muted-foreground truncate'>
                        {t('settings.currentLanguage', '현재 언어')} •{' '}
                        {getCurrentLanguage().name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 검색 */}
                <div className='p-2 sm:p-3 border-b'>
                  <div className='relative'>
                    <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground' />
                    <Input
                      placeholder={t(
                        'settings.searchLanguages',
                        '언어 검색...'
                      )}
                      value={languageSearchQuery}
                      onChange={(e) => setLanguageSearchQuery(e.target.value)}
                      className='pl-7 h-8 text-xs'
                    />
                  </div>
                </div>

                {/* 언어 목록 */}
                <ScrollArea className='h-48 sm:h-64'>
                  <div className='p-1 sm:p-2'>
                    {languageSearchQuery ? (
                      // 검색 결과
                      <div className='space-y-1'>
                        <div className='text-xs text-muted-foreground px-1 sm:px-2 py-1'>
                          {t('settings.searchResults', '검색 결과')} (
                          {searchResults.length})
                        </div>
                        {searchResults.length === 0 ? (
                          <div className='text-center py-4 text-xs text-muted-foreground'>
                            {t(
                              'settings.noLanguagesFound',
                              '언어를 찾을 수 없습니다'
                            )}
                          </div>
                        ) : (
                          searchResults.map((language) => (
                            <button
                              key={language.code}
                              onClick={() =>
                                handleLanguageChange(language.code)
                              }
                              className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs hover:bg-accent transition-colors ${
                                i18n.language === language.code
                                  ? 'bg-accent'
                                  : ''
                              }`}
                            >
                              <span>{language.flag}</span>
                              <div className='flex-1 text-left'>
                                <div className='font-medium'>
                                  {language.nativeName}
                                </div>
                                <div className='text-muted-foreground text-[10px]'>
                                  {language.name}
                                </div>
                              </div>
                              {language.direction === 'rtl' && (
                                <Badge
                                  variant='outline'
                                  className='text-[9px] px-1 py-0'
                                >
                                  RTL
                                </Badge>
                              )}
                              {i18n.language === language.code && (
                                <CheckCircle className='h-3 w-3 text-primary' />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      // 지역별 그룹화
                      <div className='space-y-2'>
                        {Object.entries(languagesByRegion).map(
                          ([region, languages]) => (
                            <div key={region} className='space-y-1'>
                              <button
                                onClick={() => toggleRegion(region)}
                                className='w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-accent/50 transition-colors'
                              >
                                <div className='flex items-center gap-2'>
                                  <Globe className='h-3 w-3' />
                                  <span className='text-xs font-medium'>
                                    {t(
                                      `settings.regions.${region
                                        .toLowerCase()
                                        .replace(' ', '')}`,
                                      region
                                    )}
                                  </span>
                                  <Badge
                                    variant='secondary'
                                    className='text-[9px] px-1 py-0'
                                  >
                                    {languages.length}
                                  </Badge>
                                </div>
                                {expandedRegions.has(region) ? (
                                  <ChevronUp className='h-3 w-3' />
                                ) : (
                                  <ChevronDown className='h-3 w-3' />
                                )}
                              </button>

                              {expandedRegions.has(region) && (
                                <div className='ml-4 space-y-1'>
                                  {languages.map((language) => (
                                    <button
                                      key={language.code}
                                      onClick={() =>
                                        handleLanguageChange(language.code)
                                      }
                                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs hover:bg-accent transition-colors ${
                                        i18n.language === language.code
                                          ? 'bg-accent'
                                          : ''
                                      }`}
                                    >
                                      <span>{language.flag}</span>
                                      <div className='flex-1 text-left'>
                                        <div className='font-medium'>
                                          {language.nativeName}
                                        </div>
                                        <div className='text-muted-foreground text-[10px]'>
                                          {language.name}
                                        </div>
                                      </div>
                                      {language.direction === 'rtl' && (
                                        <Badge
                                          variant='outline'
                                          className='text-[9px] px-1 py-0'
                                        >
                                          RTL
                                        </Badge>
                                      )}
                                      {i18n.language === language.code && (
                                        <CheckCircle className='h-3 w-3 text-primary' />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* 설정 페이지로 이동 */}
                <div className='p-3 border-t bg-muted/30'>
                  <button
                    onClick={() => navigate('/settings')}
                    className='w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
                  >
                    <Settings className='h-3 w-3' />
                    {t('settings.languageSettings', '시스템 언어 설정')}
                  </button>
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Crown />
                <span>{t('upgrade.toPro')}</span>
                <Button size='sm' className='ml-auto'>
                  {t('upgrade.upgradeButton')}
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-red-600 focus:text-red-600'
              onClick={handleLogout}
            >
              <LogOut />
              {t('auth.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
