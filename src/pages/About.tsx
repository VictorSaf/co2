import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  // Reference to the timeline section for animation
  const timelineRef = useRef<HTMLDivElement>(null);

  // Animation effect for timeline
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-4');
          }
        });
      },
      { threshold: 0.1 }
    );

    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      observer.observe(item);
    });

    return () => {
      timelineItems.forEach((item) => {
        observer.unobserve(item);
      });
    };
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t('aboutTitle')}
            </h1>
            <p className="mt-6 text-xl leading-8">
              {t('aboutSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Company Overview */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('aboutUs')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
              <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3">{t('ourMission')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('missionDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
              <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3">{t('ourExpertise')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('expertiseDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
              <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3">{t('ourDifference')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('differenceDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* History & Timeline */}
        <div className="mb-20" ref={timelineRef}>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10">{t('ourJourney')}</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-200 dark:bg-primary-800"></div>
            
            {/* Timeline items */}
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 mb-16 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8 text-right">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2006</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2006')}
                  </p>
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                </div>
              </div>
            </div>
            
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 mb-16 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8">
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2010</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2010')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 mb-16 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8 text-right">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2012</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2012')}
                  </p>
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                </div>
              </div>
            </div>
            
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 mb-16 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8">
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2015</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2015')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 mb-16 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8 text-right">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2018</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2018')}
                  </p>
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                </div>
              </div>
            </div>
            
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 mb-16 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8">
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2022</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2022')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="timeline-item opacity-0 translate-y-4 transition-all duration-700 relative">
              <div className="flex items-center justify-between">
                <div className="w-5/12 pr-8 text-right">
                  <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">2025</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {t('timeline2025')}
                  </p>
                </div>
                <div className="z-10 flex-shrink-0 bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 rounded-full w-5 h-5"></div>
                <div className="w-5/12 pl-8">
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Approach */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('nihaoApproach')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('whyOTC')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {t('otcApproachDesc')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-xl font-medium text-primary-700 dark:text-primary-400 mb-2">{t('personalizedService')}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('personalizedServiceDesc')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-primary-700 dark:text-primary-400 mb-2">{t('priceAdvantage')}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('priceAdvantageDesc')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-primary-700 dark:text-primary-400 mb-2">{t('flexibleTerms')}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('flexibleTermsDesc')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-primary-700 dark:text-primary-400 mb-2">{t('marketIntelligence')}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('marketIntelligenceDesc')}
                  </p>
                </div>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-3">{t('cerToEua')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('cerToEuaDesc')}
                </p>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                  <li>{t('cerToEuaPoint1')}</li>
                  <li>{t('cerToEuaPoint2')}</li>
                  <li>{t('cerToEuaPoint3')}</li>
                  <li>{t('cerToEuaPoint4')}</li>
                  <li>{t('cerToEuaPoint5')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Transformation */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('digitalTransformation')}</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-8">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {t('digitalTransformationDesc')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <h4 className="text-lg font-medium text-primary-700 dark:text-primary-400 mb-2">{t('whyNow')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('whyNowDesc')}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <h4 className="text-lg font-medium text-primary-700 dark:text-primary-400 mb-2">{t('humanDigital')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('humanDigitalDesc')}
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <h4 className="text-lg font-medium text-primary-700 dark:text-primary-400 mb-2">{t('clientBenefits')}</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('clientBenefitsDesc')}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('futureCarbon')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('futureDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Team */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('leadershipTeam')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-400 text-3xl font-bold">CM</span>
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">Christian Meier</h3>
                <p className="text-center text-primary-600 dark:text-primary-400 mb-4">{t('ceo')}</p>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {t('ceoDesc')}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-400 text-3xl font-bold">LZ</span>
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">Li Zhang</h3>
                <p className="text-center text-primary-600 dark:text-primary-400 mb-4">{t('asiaHead')}</p>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {t('asiaHeadDesc')}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-400 text-3xl font-bold">EM</span>
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">Elena Müller</h3>
                <p className="text-center text-primary-600 dark:text-primary-400 mb-4">{t('cto')}</p>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {t('ctoDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-20" aria-label={t('contactInformation')}>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('contactInformation')}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-8">
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('companyName')}</h3>
              <p>{t('companyNameValue')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('address')}</h3>
              <address className="not-italic">
                <p>{t('addressLine1')}</p>
                <p>{t('addressLine2')}</p>
                <p>{t('addressLine3')}</p>
              </address>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('phone')}</h3>
              <p>{t('phoneValue')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t('contactCTA')}</h2>
            <p className="mt-4 text-lg leading-6">
              {t('contactCTASubtitle')}
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="mailto:contact@nihao.com"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50"
                >
                  {t('contactUs')}
                </a>
              </div>
              <div className="ml-3 inline-flex">
                <a
                  href="/market"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
                >
                  {t('explorePlatform')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}