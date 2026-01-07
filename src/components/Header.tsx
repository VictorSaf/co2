import React, { Fragment, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon, LanguageIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

// Languages supported by the application
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const controlsContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  // Set initial language from localStorage or navigator
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // #region agent log
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const measureLayout = () => {
      const navEl = navContainerRef.current;
      const controlsEl = controlsContainerRef.current;
      const mainEl = mainContainerRef.current;
      if (!navEl || !controlsEl || !mainEl) return;
      
      const navRect = navEl.getBoundingClientRect();
      const controlsRect = controlsEl.getBoundingClientRect();
      const mainRect = mainEl.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      // Measure individual nav items
      const navItems = navEl.querySelectorAll('a');
      const navItemWidths: number[] = [];
      const navItemTexts: string[] = [];
      const navItemPositions: {left: number, right: number, width: number}[] = [];
      let itemsOverlap = false;
      let totalItemsWidth = 0;
      
      navItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        navItemWidths.push(rect.width);
        navItemTexts.push(item.textContent || '');
        navItemPositions.push({left: rect.left, right: rect.right, width: rect.width});
        totalItemsWidth += rect.width;
        
        // Check if this item overlaps with previous item
        if (index > 0) {
          const prevRect = navItems[index - 1].getBoundingClientRect();
          if (rect.left < prevRect.right) {
            itemsOverlap = true;
          }
        }
      });
      
      const spacing = navItemPositions.length > 1 
        ? navItemPositions[1].left - navItemPositions[0].right 
        : 0;
      const totalRequiredWidth = totalItemsWidth + (spacing * (navItems.length - 1));
      
      // Calculate available space for navigation dynamically
      const logoWidth = navEl.previousElementSibling?.getBoundingClientRect().width || 0;
      const availableWidth = mainRect.width - controlsRect.width - logoWidth - 64; // 64px for gaps/margins
      
      // Calculate dynamic max-width: mainWidth - controlsWidth - logoWidth - gaps (24px + 16px margins)
      const calculatedMaxWidth = mainRect.width - controlsRect.width - logoWidth - 40;
      const newMaxWidth = `calc(100% - ${controlsRect.width + 40}px)`;
      
      // Calculate max-width to prevent overlap, accounting for logo and spacing
      // Available space = mainWidth - logoWidth - controlsWidth - gaps/margins (48px buffer)
      const maxAllowedWidth = mainRect.width - logoWidth - controlsRect.width - 48; // 48px buffer for gaps/margins
      
      // If we don't have enough space, we need to either:
      // 1. Hide some nav items (complex)
      // 2. Reduce spacing/padding (already done)
      // 3. Use a more aggressive max-width that prevents overlap
      // For now, ensure max-width prevents overlap even if it means compression
      const safeMaxWidth = Math.min(maxAllowedWidth, Math.max(totalRequiredWidth, maxAllowedWidth));
      
      // Apply both min-width (to prevent compression) and max-width (to prevent overlap)
      // But if maxAllowedWidth < totalRequiredWidth, we have a problem - items will compress
      if (maxAllowedWidth >= totalRequiredWidth) {
        navEl.style.minWidth = `${totalRequiredWidth}px`;
        navEl.style.maxWidth = `${safeMaxWidth}px`;
        navEl.style.overflowX = ''; // Reset overflow when there's enough space
        // Reset any dynamic spacing/padding/font-size adjustments
        navItems.forEach((item, index) => {
          if (index > 0) {
            (item as HTMLElement).style.marginLeft = '';
          }
          (item as HTMLElement).style.paddingLeft = '';
          (item as HTMLElement).style.paddingRight = '';
          (item as HTMLElement).style.fontSize = ''; // Reset font-size
        });
      } else {
        // Not enough space - use maxAllowedWidth as both min and max to prevent overlap
        navEl.style.minWidth = `${maxAllowedWidth}px`;
        navEl.style.maxWidth = `${maxAllowedWidth}px`;
        // Dynamically reduce spacing and padding to fit items
        // Calculate compression ratio based on available space vs required space
        const compressionRatio = maxAllowedWidth / totalRequiredWidth;
        const baseSpacing = 4; // Current spacing is ~4px (space-x-1 = 0.25rem = 4px)
        const compressedSpacing = Math.max(1, baseSpacing * compressionRatio);
        const basePadding = 6; // Current padding is ~6px (px-1.5 = 0.375rem = 6px)
        const compressedPadding = Math.max(2, basePadding * compressionRatio);
        
        // Apply compression
        navItems.forEach((item, index) => {
          if (index > 0) {
            (item as HTMLElement).style.marginLeft = `${compressedSpacing}px`;
          }
          (item as HTMLElement).style.paddingLeft = `${compressedPadding}px`;
          (item as HTMLElement).style.paddingRight = `${compressedPadding}px`;
        });
        
        // Re-measure after compression to verify it fits, and apply font-size reduction if needed
        requestAnimationFrame(() => {
          const navItemsAfter = navEl.querySelectorAll('a');
          let compressedTotalWidth = 0;
          const compressedItemWidths: number[] = [];
          navItemsAfter.forEach((item) => {
            const width = item.getBoundingClientRect().width;
            compressedTotalWidth += width;
            compressedItemWidths.push(width);
          });
          const compressedSpacingTotal = compressedSpacing * (navItemsAfter.length - 1);
          const compressedTotalRequired = compressedTotalWidth + compressedSpacingTotal;
          
          // If still doesn't fit, reduce font size proportionally with iterative refinement
          if (compressedTotalRequired > maxAllowedWidth) {
            // Use a more aggressive font-size reduction with a larger buffer
            const fontSizeRatio = Math.max(0.65, (maxAllowedWidth - 4) / compressedTotalRequired); // 4px buffer for rounding errors
            navItemsAfter.forEach((item) => {
              const computedStyle = window.getComputedStyle(item);
              const currentFontSize = parseFloat(computedStyle.fontSize);
              const newFontSize = currentFontSize * fontSizeRatio;
              (item as HTMLElement).style.fontSize = `${newFontSize}px`;
            });
            
            // Re-measure after font-size reduction and iterate if still doesn't fit
            requestAnimationFrame(() => {
              let finalTotalWidth = 0;
              const finalItemWidths: number[] = [];
              navItemsAfter.forEach((item) => {
                const width = item.getBoundingClientRect().width;
                finalTotalWidth += width;
                finalItemWidths.push(width);
              });
              let finalSpacing = compressedSpacing;
              let finalTotalRequired = finalTotalWidth + (finalSpacing * (navItemsAfter.length - 1));
              
              // If still doesn't fit after font-size reduction, reduce spacing further
              if (finalTotalRequired > maxAllowedWidth) {
                finalSpacing = Math.max(0, compressedSpacing - 2);
                navItemsAfter.forEach((item, index) => {
                  if (index > 0) {
                    (item as HTMLElement).style.marginLeft = `${finalSpacing}px`;
                  }
                });
                finalTotalRequired = finalTotalWidth + (finalSpacing * (navItemsAfter.length - 1));
              }
              
              // If still doesn't fit, apply one more font-size reduction
              if (finalTotalRequired > maxAllowedWidth) {
                const additionalFontSizeRatio = Math.max(0.6, (maxAllowedWidth - 2) / finalTotalRequired);
                navItemsAfter.forEach((item) => {
                  const computedStyle = window.getComputedStyle(item);
                  const currentFontSize = parseFloat(computedStyle.fontSize);
                  const newFontSize = currentFontSize * additionalFontSizeRatio;
                  (item as HTMLElement).style.fontSize = `${newFontSize}px`;
                });
                
                // Final re-measurement
                requestAnimationFrame(() => {
                  let ultimateTotalWidth = 0;
                  navItemsAfter.forEach((item) => {
                    ultimateTotalWidth += item.getBoundingClientRect().width;
                  });
                  finalTotalRequired = ultimateTotalWidth + (finalSpacing * (navItemsAfter.length - 1));
                  
                  // Ensure container has overflow-x: hidden to prevent visual overflow
                  navEl.style.overflowX = 'hidden';
                });
              } else {
                // Ensure container has overflow-x: hidden to prevent visual overflow
                navEl.style.overflowX = 'hidden';
              }
            });
          } else {
            // Ensure container has overflow-x: hidden to prevent visual overflow
            navEl.style.overflowX = 'hidden';
          }
        });
      }
    };
    
    const timeoutId = setTimeout(measureLayout, 100);
    window.addEventListener('resize', measureLayout);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureLayout);
    };
  }, [isAuthenticated, i18n.language]);
  // #endregion

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Main container with explicit gap to prevent navigation/controls overlap */}
            <div ref={mainContainerRef} className="flex h-16 justify-between gap-x-4 lg:gap-x-6">
              <div className="flex min-w-0 flex-1">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center">
                    <Logo className="h-16 w-auto" />
                  </Link>
                </div>
                {isAuthenticated && (
                  <div ref={navContainerRef} className="hidden lg:ml-4 xl:ml-6 lg:flex lg:space-x-1 xl:space-x-1.5 min-w-0">
                    {/* Navigation container: Dynamic max-width applied via ref to prevent overlap, min-w-0 allows shrinking. */}
                    <Link
                      to="/dashboard"
                      className={classNames(
                        location.pathname === '/dashboard'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('dashboard')}
                    </Link>
                    <Link
                      to="/market"
                      className={classNames(
                        location.pathname === '/market'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('market')}
                    </Link>
                    <Link
                      to="/market-analysis"
                      className={classNames(
                        location.pathname === '/market-analysis'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('marketAnalysis')}
                    </Link>
                    <Link
                      to="/portfolio"
                      className={classNames(
                        location.pathname === '/portfolio'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('portfolio')}
                    </Link>
                    <Link
                      to="/emissions"
                      className={classNames(
                        location.pathname === '/emissions'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('emissions')}
                    </Link>
                    <Link
                      to="/about"
                      className={classNames(
                        location.pathname === '/about'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('about')}
                    </Link>
                    <Link
                      to="/documentation"
                      className={classNames(
                        location.pathname === '/documentation'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('documentation')}
                    </Link>
                    <Link
                      to="/onboarding"
                      className={classNames(
                        location.pathname === '/onboarding'
                          ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                        'inline-flex items-center border-b-2 px-1.5 xl:px-2 pt-1 text-xs xl:text-sm font-medium whitespace-nowrap'
                      )}
                    >
                      {t('onboarding')}
                    </Link>
                  </div>
                )}
              </div>
              {/* Controls container: flex-shrink-0 prevents compression, ensuring proper spacing from navigation */}
              <div ref={controlsContainerRef} className="hidden lg:ml-4 xl:ml-6 lg:flex lg:items-center flex-shrink-0">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center rounded-full bg-white dark:bg-gray-800 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label={t('toggleDarkMode')}
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                
                {/* Language Selector */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex items-center rounded-full bg-white dark:bg-gray-800 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                      <span className="sr-only">{t('language')}</span>
                      <LanguageIcon className="h-6 w-6" aria-hidden="true" />
                      <span className="ml-1 text-sm">{languages.find(l => i18n.language.startsWith(l.code))?.flag}</span>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
                      {languages.map((language) => (
                        <Menu.Item key={language.code}>
                          {({ active }) => (
                            <button
                              onClick={() => handleLanguageChange(language.code)}
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              <span className="mr-2">{language.flag}</span>
                              {language.name}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>

                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('balance')}: <span className="text-green-600 dark:text-green-400">{user?.balance?.toLocaleString() || '0'} EUR</span>
                    </div>
                    
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
                          <Menu.Item>
                            {() => (
                              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {t('signedInAs')} <span className="font-medium">{user?.username}</span>
                              </div>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={classNames(
                                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                  'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                                )}
                              >
                                {t('yourProfile')}
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/settings"
                                className={classNames(
                                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                  'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                                )}
                              >
                                {t('settings')}
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={classNames(
                                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                                )}
                              >
                                {t('signOut')}
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <Link
                    to="/"
                    className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    {t('signIn')}
                  </Link>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Dark Mode Toggle for Mobile */}
                <button
                  onClick={toggleTheme}
                  className="mr-2 flex items-center rounded-full bg-white dark:bg-gray-800 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label={t('toggleDarkMode')}
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            {isAuthenticated && (
              <>
                <div className="space-y-1 pb-3 pt-2">
                  <Disclosure.Button
                    as={Link}
                    to="/dashboard"
                    className={classNames(
                      location.pathname === '/dashboard'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('dashboard')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/market"
                    className={classNames(
                      location.pathname === '/market'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('market')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/market-analysis"
                    className={classNames(
                      location.pathname === '/market-analysis'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('marketAnalysis')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/portfolio"
                    className={classNames(
                      location.pathname === '/portfolio'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('portfolio')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/emissions"
                    className={classNames(
                      location.pathname === '/emissions'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('emissions')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/about"
                    className={classNames(
                      location.pathname === '/about'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('about')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/documentation"
                    className={classNames(
                      location.pathname === '/documentation'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('documentation')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/onboarding"
                    className={classNames(
                      location.pathname === '/onboarding'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {t('onboarding')}
                  </Disclosure.Button>
                </div>
                
                {/* Language options for mobile */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
                  <div className="px-4 flex items-center justify-between">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{t('language')}</div>
                    <div className="flex space-x-4">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          className={`flex items-center ${i18n.language.startsWith(language.code) ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
                        >
                          <span className="text-lg mr-1">{language.flag}</span>
                          <span className="text-sm">{language.code.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.username || 'User'}</div>
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">{t('balance')}: {user?.balance?.toLocaleString() || '0'} EUR</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      to="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {t('yourProfile')}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/settings"
                      className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {t('settings')}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {t('signOut')}
                    </Disclosure.Button>
                  </div>
                </div>
              </>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}