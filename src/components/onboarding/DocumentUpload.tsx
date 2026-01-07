/**
 * Document Upload Component
 * Handles file upload with drag & drop, preview, and validation
 * Supports multiple file selection and image previews
 * 
 * Features:
 * - Displays filename during upload progress ("Uploading [filename]... X%")
 * - Shows file size in upload progress for better user feedback
 * - Handles multiple simultaneous uploads with queue display
 * - Enhanced success messages with dismissible confirmation (auto-dismisses after 5 seconds)
 * - Tracks uploading files using Map<string, { name: string; size: number }> for filename and size display
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  DocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import type { DocumentType, KYCDocument } from '../../types/kyc';
import { uploadDocument, deleteDocument, getDocumentPreviewUrl } from '../../services/kycService';
import { FILE_UPLOAD_CONFIG } from '../../design-system/tokens';

interface DocumentUploadProps {
  documentType: DocumentType;
  label: string;
  description?: string;
  required?: boolean;
  onUploadSuccess?: (document: KYCDocument) => void;
  onDelete?: (documentId: string) => void;
  existingDocuments?: KYCDocument[];
}

const ALLOWED_TYPES = [...FILE_UPLOAD_CONFIG.ALLOWED_TYPES] as string[];
const MAX_FILE_SIZE = FILE_UPLOAD_CONFIG.MAX_FILE_SIZE;

export default function DocumentUpload({
  documentType,
  label,
  description,
  required = false,
  onUploadSuccess,
  onDelete,
  existingDocuments = [],
}: DocumentUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Track uploading files with filename and size for display during upload progress
  // Key: fileId (unique identifier), Value: { name: filename, size: file size in bytes }
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { name: string; size: number }>>(new Map());
  const [currentUploadingFileId, setCurrentUploadingFileId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Map<string, string>>(new Map());

  // Filter to get all documents of this type (supports multiple documents per category)
  // Sort by upload date (newest first) for better UX
  const existingDocs = useMemo(() => {
    const filtered = existingDocuments.filter((doc) => {
      const docType = (doc as any).documentType || doc.document_type;
      return docType === documentType;
    });
    return filtered.sort((a, b) => {
      // Parse dates safely, defaulting to 0 (oldest) if invalid or missing
      const dateA = ((a as any).uploadedAt || a.uploaded_at) ? new Date((a as any).uploadedAt || a.uploaded_at).getTime() : 0;
      const dateB = ((b as any).uploadedAt || b.uploaded_at) ? new Date((b as any).uploadedAt || b.uploaded_at).getTime() : 0;
      // Handle invalid dates (NaN)
      const timeA = isNaN(dateA) ? 0 : dateA;
      const timeB = isNaN(dateB) ? 0 : dateB;
      return timeB - timeA; // Newest first
    });
  }, [existingDocuments, documentType]);

  // Check if document is an image type for preview
  const isImageDocument = useCallback((doc: KYCDocument) => {
    const mimeType = ((doc as any).mimeType || doc.mime_type)?.toLowerCase() || '';
    const fileName = ((doc as any).fileName || doc.file_name)?.toLowerCase() || '';
    return mimeType.startsWith('image/') || fileName.match(/\.(png|jpg|jpeg)$/i);
  }, []);

  // Format file size for display
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      // Cleanup blob URLs
      imagePreviewUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviewUrls]);

  // Load image previews for image documents
  useEffect(() => {
    const loadPreviews = async () => {
      const imageDocs = existingDocs.filter(doc => {
        const mimeType = ((doc as any).mimeType || doc.mime_type)?.toLowerCase() || '';
        const fileName = ((doc as any).fileName || doc.file_name)?.toLowerCase() || '';
        return mimeType.startsWith('image/') || fileName.match(/\.(png|jpg|jpeg)$/i);
      });

      for (const doc of imageDocs) {
        // Skip if already loaded
        if (imagePreviewUrls.has(doc.id)) continue;

        try {
          const previewUrl = await getDocumentPreviewUrl(doc.id);
          if (previewUrl) {
            setImagePreviewUrls((prev) => new Map(prev).set(doc.id, previewUrl));
          }
        } catch (error) {
          // Silently fail - fallback icon will be shown
        }
      }
    };

    if (existingDocs.length > 0) {
      loadPreviews();
    }
  }, [existingDocs, imagePreviewUrls]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('kyc.upload.invalidFileType', 'Invalid file type. Please upload PDF or image files.');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('kyc.upload.fileTooLarge', 'File is too large. Maximum size is 16MB.');
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      // Store filename and size in Map for display during upload progress
      setUploadingFiles((prev) => new Map(prev).set(fileId, { name: file.name, size: file.size }));
      setCurrentUploadingFileId(fileId);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Use real upload progress with axios
        const result = await uploadDocument(file, documentType, (progress) => {
          setUploadProgress(Math.round(progress * 100));
        });
        setUploadProgress(100);
        
        // IMPORTANT: Set success message FIRST and ensure it persists
        // Use the filename from the result document (backend returns camelCase)
        const doc = result.document as any;
        const successFileName = doc.fileName || doc.file_name || file.name;
        setUploadSuccess(successFileName);
        
        // Clear any existing timeout
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
          successTimeoutRef.current = null;
        }
        
        // Set timeout to hide message after 15 seconds
        successTimeoutRef.current = setTimeout(() => {
          setUploadSuccess(null);
          successTimeoutRef.current = null;
        }, 15000);
        
        // Call callback AFTER setting success message with a small delay
        // This ensures the success message is rendered before parent re-renders
        setTimeout(() => {
          if (onUploadSuccess) {
            onUploadSuccess(result.document);
          }
        }, 100);
        
        // Force scroll to success message after a short delay to ensure it's rendered
        setTimeout(() => {
          const successElement = document.getElementById(`file-${documentType}-success`);
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Also add a highlight effect
            successElement.style.transition = 'all 0.3s ease';
            successElement.style.transform = 'scale(1.02)';
            setTimeout(() => {
              if (successElement) {
                successElement.style.transform = 'scale(1)';
              }
            }, 300);
          }
        }, 200);
        
        setTimeout(() => {
          setUploadingFiles((prev) => {
            const next = new Map(prev);
            next.delete(fileId);
            setCurrentUploadingFileId((currentId) => (fileId === currentId ? null : currentId));
            if (next.size === 0) {
              setIsUploading(false);
              setUploadProgress(0);
            }
            return next;
          });
        }, 500);
      } catch (err: any) {
        setUploadingFiles((prev) => {
          const next = new Map(prev);
          next.delete(fileId);
          setCurrentUploadingFileId((currentId) => (fileId === currentId ? null : currentId));
          if (next.size === 0) {
            setIsUploading(false);
            setUploadProgress(0);
          }
          return next;
        });
        setError(
          err.response?.data?.error ||
          t('kyc.upload.uploadFailed', 'Upload failed. Please try again.')
        );
      }
    },
    [documentType, onUploadSuccess, t]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      // Validate all files first
      const validationErrors: string[] = [];
      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(`${file.name}: ${error}`);
        }
      });

      if (validationErrors.length > 0) {
        setError(validationErrors.join('; '));
        return;
      }

      setError(null);
      setIsUploading(true);

      // Upload files sequentially to avoid overwhelming the server
      for (const file of fileArray) {
        await handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
        // Reset input to allow selecting the same files again
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const handleDelete = useCallback(
    async (documentId: string) => {
      if (deletingDocumentId) return; // Prevent multiple simultaneous deletions
      
      try {
        setDeletingDocumentId(documentId);
        setError(null);
        await deleteDocument(documentId);
        onDelete?.(documentId);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
          t('kyc.upload.deleteFailed', 'Failed to delete document. Please try again.')
        );
      } finally {
        setDeletingDocumentId(null);
      }
    },
    [onDelete, t, deletingDocumentId]
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return t('kyc.upload.status.verified', 'Verified');
      case 'pending':
        return t('kyc.upload.status.pending', 'Pending');
      case 'rejected':
        return t('kyc.upload.status.rejected', 'Rejected');
      default:
        return status;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p id={`file-${documentType}-description`} className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {/* Success message - MUST be visible when uploadSuccess is set */}
      {uploadSuccess ? (
        <div 
          role="alert" 
          aria-live="polite"
          className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 shadow-lg"
          id={`file-${documentType}-success`}
        >
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                ✅ {t('kyc.upload.uploadSuccess', 'Document uploaded successfully')}
              </p>
              <p className="text-sm text-green-800 dark:text-green-200 break-words mb-1">
                <strong className="font-medium">{uploadSuccess}</strong>
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 italic">
                {t('kyc.upload.savedToDatabase', 'Document has been saved to the database and will appear in the list below.')}
              </p>
            </div>
            <button
              onClick={() => {
                if (successTimeoutRef.current) {
                  clearTimeout(successTimeoutRef.current);
                  successTimeoutRef.current = null;
                }
                setUploadSuccess(null);
              }}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex-shrink-0"
              aria-label={t('kyc.upload.dismissSuccess', 'Dismiss success message')}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      {existingDocs.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('kyc.upload.uploadedDocuments', 'Uploaded documents')} ({existingDocs.length})
          </p>
          {existingDocs.map((doc) => {
            const isImage = isImageDocument(doc);
            // Use authenticated preview URL from cache
            const imageUrl = isImage ? imagePreviewUrls.get(doc.id) : null;

            return (
              <div
                key={doc.id}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {isImage && imageUrl ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={(doc as any).fileName || doc.file_name}
                          className="h-12 w-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const img = e.currentTarget;
                            img.style.display = 'none';
                            const container = img.parentElement;
                            if (container) {
                              const fallback = container.querySelector('.image-fallback');
                              if (fallback) {
                                (fallback as HTMLElement).classList.remove('hidden');
                                (fallback as HTMLElement).classList.add('block');
                              }
                            }
                          }}
                        />
                        <PhotoIcon className="h-12 w-12 text-primary-600 hidden image-fallback" aria-hidden="true" />
                      </div>
                    ) : (
                      <DocumentIcon className="h-8 w-8 text-primary-600 flex-shrink-0" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {(doc as any).fileName || doc.file_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {(((doc as any).fileSize || doc.file_size) / 1024).toFixed(2)} KB •{' '}
                        <span className="flex items-center gap-1">
                          {getStatusIcon((doc as any).verificationStatus || doc.verification_status)}
                          {getStatusText((doc as any).verificationStatus || doc.verification_status)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingDocumentId === doc.id || !!deletingDocumentId}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-2"
                    aria-label={t('kyc.upload.deleteDocument', 'Delete document')}
                  >
                    {deletingDocumentId === doc.id ? (
                      <svg
                        className="animate-spin h-5 w-5 text-red-600 dark:text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <XMarkIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label={t('kyc.upload.dragDropArea', 'Drag and drop area for file upload')}
        aria-describedby={`file-${documentType}-description`}
        className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
        }`}
      >
        <input
          type="file"
          id={`file-${documentType}`}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          onChange={handleFileInput}
          disabled={isUploading}
          aria-describedby={error ? `file-${documentType}-error` : `file-${documentType}-description`}
          aria-invalid={!!error}
        />
        <label
          htmlFor={`file-${documentType}`}
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          {isUploading ? (
            <div className="w-full">
              {/* Upload progress display with filename and file size */}
              <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                {uploadingFiles.size === 1 ? (
                  // Single file: Show filename and size
                  (() => {
                    const file = Array.from(uploadingFiles.values())[0];
                    return (
                      <>
                        {t('kyc.upload.uploading', 'Uploading')} <strong>{file.name}</strong> ({formatFileSize(file.size)})... {uploadProgress}%
                      </>
                    );
                  })()
                ) : uploadingFiles.size > 1 ? (
                  // Multiple files: Show current file with queue count and list up to 3 filenames
                  (() => {
                    const files = Array.from(uploadingFiles.entries());
                    const currentFile = currentUploadingFileId ? uploadingFiles.get(currentUploadingFileId) : null;
                    const remainingCount = uploadingFiles.size - (currentFile ? 1 : 0);
                    return (
                      <>
                        {currentFile ? (
                          <>
                            {t('kyc.upload.uploading', 'Uploading')} <strong>{currentFile.name}</strong> ({formatFileSize(currentFile.size)})... {uploadProgress}%
                            {remainingCount > 0 && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                ({remainingCount} {t('kyc.upload.more', 'more')} {remainingCount === 1 ? t('kyc.upload.file', 'file') : t('kyc.upload.files', 'files')} {t('kyc.upload.queued', 'queued')})
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {t('kyc.upload.uploading', 'Uploading')} {uploadingFiles.size} {t('kyc.upload.files', 'files')}... {uploadProgress}%
                          </>
                        )}
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {files.slice(0, 3).map(([id, file], idx) => (
                            <span key={id} className={`block truncate ${id === currentUploadingFileId ? 'font-medium' : ''}`}>
                              {id === currentUploadingFileId && '→ '}
                              {file.name} ({formatFileSize(file.size)})
                            </span>
                          ))}
                          {uploadingFiles.size > 3 && (
                            <span className="text-gray-400">...{uploadingFiles.size - 3} {t('kyc.upload.more', 'more')}</span>
                          )}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    {t('kyc.upload.uploading', 'Uploading...')} {uploadProgress}%
                  </>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {t('kyc.upload.clickToUpload', 'Click to upload')}
                </span>{' '}
                {t('kyc.upload.orDragDrop', 'or drag and drop')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PDF, PNG, JPG (MAX. 16MB) • {t('kyc.upload.multipleFiles', 'Multiple files supported')}
              </p>
            </>
          )}
        </label>
      </div>

      {error && (
        <p 
          role="alert" 
          aria-live="polite"
          className="text-sm text-red-600 dark:text-red-400"
          id={`file-${documentType}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

