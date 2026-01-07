import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { documents, DocumentCategory } from '../data/documentation';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Badge, Card } from '../design-system';

/**
 * Documentation page component that displays all company policies, procedures, and compliance documents.
 * Provides search and category filtering functionality, with the ability to view or download PDF documents.
 * 
 * Features:
 * - Real-time search filtering by document title or description
 * - Category filtering (Policy, Procedure, Form, Compliance)
 * - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
 * - Full dark mode support
 * - View PDFs in new tab or download directly
 * 
 * @returns {JSX.Element} The Documentation page component
 */
export default function Documentation() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');

  const categories: (DocumentCategory | 'All')[] = ['All', 'Policy', 'Procedure', 'Form', 'Compliance'];

  /**
   * Filters documents based on search query and selected category.
   * Memoized to prevent unnecessary recalculations on re-renders.
   * 
   * Filtering logic:
   * - Search: Case-insensitive match against translated title or description
   * - Category: Exact match against document category, or 'All' to show all
   * - Combined: Both filters must match (AND logic)
   */
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter
      const title = t(doc.titleKey).toLowerCase();
      const description = t(doc.descriptionKey).toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || title.includes(searchLower) || description.includes(searchLower);

      // Category filter
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, t]);

  /**
   * Opens a PDF document in a new browser tab.
   * @param path - The relative path to the PDF file (e.g., '/documentation/filename.pdf')
   */
  const handleViewDocument = (path: string) => {
    window.open(path, '_blank');
  };

  /**
   * Triggers a browser download for a PDF document.
   * Creates a temporary anchor element, sets the download attribute, and programmatically clicks it.
   * @param path - The relative path to the PDF file (e.g., '/documentation/filename.pdf')
   * @param filename - The filename to use for the downloaded file
   */
  const handleDownloadDocument = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t('documentationTitle')}
            </h1>
            <p className="mt-6 text-xl leading-8">
              {t('documentationSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filter Section */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t('searchDocuments')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={t('clearSearch')}
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {category === 'All' ? t('allCategories') : t(`category${category}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                variant="elevated"
                hover
              >
                {/* Document Number Badge */}
                {doc.number && (
                  <Badge variant="primary" size="sm" className="mb-3">
                    #{doc.number.toString().padStart(2, '0')}
                  </Badge>
                )}

                {/* Category Badge */}
                <div className="mb-3">
                  <Badge variant="secondary" size="sm">
                    {t(`category${doc.category}`)}
                  </Badge>
                </div>

                {/* Document Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t(doc.titleKey)}
                </h3>

                {/* Document Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {t(doc.descriptionKey)}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewDocument(doc.path)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {t('viewDocument')}
                  </button>
                    <button
                    onClick={() => handleDownloadDocument(doc.path, doc.filename)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    {t('downloadDocument')}
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('noDocumentsFound')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

