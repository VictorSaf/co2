/**
 * Benefits Page
 * Educational page explaining Nihao advantages with real scenarios
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card } from '../design-system';

export default function Benefits() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('benefits') || 'Why Choose Nihao?'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('benefitsSubtitle') || 'Discover the advantages of trading through Nihao'}
        </p>
      </div>

      {/* Seller Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('sellerBenefits') || 'Benefits for CEA Sellers'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {t(`sellerBenefit${i}Title`) || `Benefit ${i}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t(`sellerBenefit${i}Desc`) || `Description of benefit ${i}`}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Buyer Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('buyerBenefits') || 'Benefits for Swap Buyers'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {t(`buyerBenefit${i}Title`) || `Benefit ${i}`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t(`buyerBenefit${i}Desc`) || `Description of benefit ${i}`}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/value-calculator"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          {t('calculateYourSavings') || 'Calculate Your Savings'}
        </Link>
      </div>
    </div>
  );
}

