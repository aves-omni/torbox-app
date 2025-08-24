'use client';

import { useEffect, useState } from 'react';
import { useUpload } from '../shared/hooks/useUpload';
import { DropZone } from '../shared/DropZone';
import TorrentOptions from './TorrentOptions';
import UploadItemList from './UploadItemList';
import UploadProgress from './UploadProgress';
import useIsMobile from '@/hooks/useIsMobile';
import { phEvent } from '@/utils/sa';
import { useTranslations } from 'next-intl';
import Toast from '../shared/Toast';

// Local storage keys
const UPLOADER_EXPANDED_KEY = 'uploader-expanded';
const UPLOADER_OPTIONS_KEY = 'uploader-options-expanded';

export default function ItemUploader({ apiKey, activeType = 'torrents' }) {
  const t = useTranslations('ItemUploader');
  const {
    items,
    setItems,
    linkInput,
    setLinkInput,
    error,
    setError,
    globalOptions,
    updateGlobalOptions,
    showOptions,
    setShowOptions,
    validateAndAddFiles,
    uploadItems,
    isUploading,
    progress,
    webdlPassword,
    setWebdlPassword,
  } = useUpload(apiKey, activeType);

  // State to track if the uploader is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();
  const [toast, setToast] = useState(null);

  // Set initial expanded state based on localStorage or screen size
  useEffect(() => {
    setIsClient(true);

    const handleResize = () => {
      // Only set default state if no localStorage value exists
      if (
        typeof localStorage !== 'undefined' &&
        localStorage.getItem(UPLOADER_EXPANDED_KEY) === null
      ) {
        // Desktop (>= 1024px) is expanded by default, mobile/tablet is collapsed
        setIsExpanded(window.innerWidth >= 1024);
      }
    };

    // Try to get saved preference from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedState = localStorage.getItem(UPLOADER_EXPANDED_KEY);
      if (savedState !== null) {
        setIsExpanded(savedState === 'true');
      } else {
        // If no saved preference, set based on screen size
        handleResize();
      }

      // Also load options expanded state
      if (activeType === 'torrents') {
        const savedOptionsState = localStorage.getItem(UPLOADER_OPTIONS_KEY);
        if (savedOptionsState !== null) {
          setShowOptions(savedOptionsState === 'true');
        }
      }
    } else {
      // Fallback if localStorage is not available
      handleResize();
    }

    // Add resize listener (only affects initial state when no localStorage value exists)
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [activeType, setShowOptions]);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    if (isClient && typeof localStorage !== 'undefined') {
      localStorage.setItem(UPLOADER_EXPANDED_KEY, isExpanded.toString());
    }
  }, [isExpanded, isClient]);

  // Save options expanded state to localStorage when it changes
  useEffect(() => {
    if (
      isClient &&
      typeof localStorage !== 'undefined' &&
      activeType === 'torrents'
    ) {
      localStorage.setItem(UPLOADER_OPTIONS_KEY, showOptions.toString());
    }
  }, [showOptions, isClient, activeType]);

  // Clear items when switching asset types
  useEffect(() => {
    setError(null);
  }, [activeType, setItems, setError]);

  // Show toast notification when error occurs
  useEffect(() => {
    if (error) {
      setToast({
        message: error,
        type: 'error'
      });
    }
  }, [error]);

  // Show success notification when upload completes
  const handleUploadComplete = () => {
    const successCount = items.filter(item => item.status === 'success').length;
    const totalCount = items.length;
    
    if (successCount > 0 && successCount === totalCount) {
      setToast({
        message: `Successfully uploaded ${successCount} ${activeType === 'usenet' ? 'NZB' : activeType === 'torrents' ? 'torrent' : 'download'}${successCount > 1 ? 's' : ''}`,
        type: 'success'
      });
    }
  };

  // Monitor upload completion
  useEffect(() => {
    const hasCompletedUploads = items.some(item => item.status === 'success');
    const hasNoQueuedItems = !items.some(item => item.status === 'queued' || item.status === 'processing');
    
    if (hasCompletedUploads && hasNoQueuedItems && !isUploading) {
      handleUploadComplete();
    }
  }, [items, isUploading, activeType]);

  // Get asset type specific labels
  const getAssetTypeInfo = () => {
    switch (activeType) {
      case 'usenet':
        return {
          title: t('title.usenet'),
          inputPlaceholder: t('placeholder.usenet'),
          dropzoneText: t('dropzone.usenet'),
          buttonText: t('button.usenet'),
          fileExtension: '.nzb',
          showDropzone: true,
        };
      case 'webdl':
        return {
          title: t('title.webdl'),
          inputPlaceholder: t('placeholder.webdl'),
          dropzoneText: '',
          buttonText: t('button.webdl'),
          fileExtension: '',
          showDropzone: false,
        };
      default:
        return {
          title: t('title.torrents'),
          inputPlaceholder: t('placeholder.torrents'),
          dropzoneText: t('dropzone.torrents'),
          buttonText: t('button.torrents'),
          fileExtension: '.torrent',
          showDropzone: true,
        };
    }
  };

  const assetTypeInfo = getAssetTypeInfo();

  const handleDismiss = () => {
    setItems([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processInputLinks();
    }
  };

  const processInputLinks = () => {
    if (!linkInput.trim()) return;

    setLinkInput(linkInput);
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) return null;

  return (
    <div className="mt-4 px-2 py-2 lg:p-4 mb-4 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark">
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-md lg:text-lg font-medium text-primary-text dark:text-primary-text-dark">
          {isMobile ? t('title.default') : assetTypeInfo.title}
        </h3>
        <div className="flex items-center gap-2 lg:gap-4">
          {activeType === 'torrents' && isExpanded && (
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-1 text-xs lg:text-sm text-accent dark:text-accent-dark hover:text-accent/80 dark:hover:text-accent-dark/80 transition-colors"
            >
              {showOptions ? t('options.hide') : t('options.show')}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs lg:text-sm text-accent dark:text-accent-dark hover:text-accent/80 dark:hover:text-accent-dark/80 transition-colors"
            aria-expanded={isExpanded}
          >
            {isExpanded ? t('section.hide') : t('section.show')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div
            className={`grid ${
              assetTypeInfo.showDropzone
                ? 'lg:grid-cols-2 gap-2 lg:gap-6'
                : 'grid-cols-1'
            } mt-4`}
          >
            <div className={`${assetTypeInfo.showDropzone ? '' : 'w-full'}`}>
              <textarea
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (activeType === 'webdl') {
                    processInputLinks();
                  }
                }}
                disabled={isUploading}
                placeholder={assetTypeInfo.inputPlaceholder}
                className="w-full min-h-[120px] lg:min-h-40 h-40 p-2 lg:p-3 border border-border dark:border-border-dark rounded-lg 
                  bg-transparent text-sm lg:text-base text-primary-text dark:text-primary-text-dark 
                  placeholder-primary-text/50 dark:placeholder-primary-text-dark/50
                  focus:outline-none focus:ring-2 focus:ring-accent/20 dark:focus:ring-accent-dark/20 
                  focus:border-accent dark:focus:border-accent-dark
                  disabled:bg-surface-alt dark:disabled:bg-surface-alt-dark 
                  disabled:text-primary-text/50 dark:disabled:text-primary-text-dark/50
                  transition-colors duration-200"
              />
            </div>

            {assetTypeInfo.showDropzone && (
              <div>
                <DropZone
                  onDrop={validateAndAddFiles}
                  disabled={isUploading}
                  acceptedFileTypes={assetTypeInfo.fileExtension}
                  dropzoneText={assetTypeInfo.dropzoneText}
                />
              </div>
            )}
          </div>

          {activeType === 'webdl' && (
            <div className="mt-2">
              <input
                type="password"
                value={webdlPassword}
                onChange={(e) => setWebdlPassword(e.target.value)}
                placeholder={t('placeholder.webdlPassword')}
                className="w-full p-2 border border-border dark:border-border-dark rounded-lg bg-transparent text-sm lg:text-base text-primary-text dark:text-primary-text-dark placeholder-primary-text/50 dark:placeholder-primary-text-dark/50 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:focus:ring-accent-dark/20 focus:border-accent dark:focus:border-accent-dark transition-colors duration-200"
              />
            </div>
          )}

          {/* Options section */}
          {activeType === 'torrents' && (
            <TorrentOptions
              showOptions={showOptions}
              globalOptions={globalOptions}
              updateGlobalOptions={updateGlobalOptions}
            />
          )}

          <UploadItemList
            items={items}
            setItems={setItems}
            uploading={isUploading}
            activeType={activeType}
          />

          {items.filter((item) => item.status === 'queued').length > 0 &&
            !isUploading && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    uploadItems();
                    phEvent('upload_items');
                  }}
                  disabled={isUploading}
                  className="mt-4 w-full lg:w-auto bg-accent hover:bg-accent/90 text-white text-sm px-4 lg:px-4 py-2 mb-4 rounded-md
                    transition-colors duration-200 disabled:bg-accent/90 disabled:cursor-not-allowed"
                >
                  {assetTypeInfo.buttonText} (
                  {items.filter((item) => item.status === 'queued').length})
                </button>
              </div>
            )}

          <UploadProgress progress={progress} uploading={isUploading} />

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium">{t('errors.uploadFailed')}</p>
                  <p className="mt-1 break-words">{error}</p>
                  {error.includes('temporarily') && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {t('errors.temporaryIssue')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help section for common issues */}
          {activeType === 'usenet' && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">{t('help.nzbTips')}</p>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• {t('help.validLinks')}</li>
                    <li>• {t('help.checkApiKey')}</li>
                    <li>• {t('help.serverErrors')}</li>
                    <li>• {t('help.downloadSlots')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {items.length > 0 &&
            !items.some(
              (item) =>
                item.status === 'queued' || item.status === 'processing',
            ) && (
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-end mt-4">
                <h3 className="text-xs lg:text-sm text-primary-text dark:text-primary-text-dark/70">
                  {t('status.processing', {
                    count: items.filter((item) => item.status === 'success')
                      .length,
                    total: items.length,
                  })}
                </h3>

                <button
                  onClick={handleDismiss}
                  className="text-sm text-primary-text/70 hover:text-primary-text dark:text-primary-text-dark dark:hover:text-primary-text-dark/70"
                  aria-label={t('status.clearItems')}
                >
                  {t('status.clearItems')}
                </button>
              </div>
            )}
        </>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
