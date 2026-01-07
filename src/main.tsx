import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n' // Import i18n configuration

// Suppress Chrome extension errors in console
// These errors come from browser extensions trying to communicate with content scripts
// and are not related to our application
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out Chrome extension errors
    const message = args.join(' ');
    if (
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('chrome.runtime') ||
      message.includes('Extension context invalidated')
    ) {
      // Silently ignore Chrome extension errors
      return;
    }
    // Filter out chunk loading errors (these are handled by ErrorBoundary)
    // UUID pattern matches Vite chunk IDs (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:1)
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9]+/i;
    if (
      (message.includes('Failed to load resource') && message.includes('net::ERR_FILE_NOT_FOUND')) ||
      (message.includes('net::ERR_FILE_NOT_FOUND') && uuidPattern.test(message)) ||
      uuidPattern.test(message)
    ) {
      // These are Vite chunk loading errors, likely HMR issues
      // They're handled by ErrorBoundary and global error handlers, so we can suppress them
      return;
    }
    // Log all other errors normally
    originalError.apply(console, args);
  };

  // Also handle unhandled promise rejections from Chrome extensions
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason || '');
    if (
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('chrome.runtime') ||
      message.includes('Extension context invalidated')
    ) {
      event.preventDefault();
      return;
    }
    // Handle chunk loading errors gracefully
    if (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('ChunkLoadError')
    ) {
      console.warn('Chunk loading error detected, page will reload:', message);
      // Reload after a short delay to allow error boundary to handle it
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      event.preventDefault();
      return;
    }
  });

  // Handle network errors for failed resource loads (chunk loading)
  // Only handle script/link errors that look like chunk loading issues
  let chunkErrorHandled = false;
  let reloadTimeout: ReturnType<typeof setTimeout> | null = null;
  
  window.addEventListener('error', (event) => {
    // Check if it's a chunk loading error (UUID format or chunk-related)
    const target = event.target as HTMLElement;
    // UUID pattern for Vite chunk IDs
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9]+/i;
    const isChunkError = 
      target &&
      (target.tagName === 'SCRIPT' || target.tagName === 'LINK') &&
      (event.message?.includes('Failed to load') ||
       event.message?.includes('net::ERR_FILE_NOT_FOUND') ||
       uuidPattern.test(event.filename || '') ||
       uuidPattern.test(event.message || ''));
    
    if (isChunkError && !chunkErrorHandled) {
      chunkErrorHandled = true;
      // Clear any existing reload timeout
      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }
      // Show a brief message before reloading
      console.warn('🔄 Chunk loading error detected (Vite HMR issue). Reloading page in 1 second...');
      // Reload page after a delay to retry
      reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, true);
  
  // Also intercept fetch errors for chunk loading
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args);
    } catch (error: any) {
      const url = args[0]?.toString() || '';
      const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9]+/i;
      if (uuidPattern.test(url) && !chunkErrorHandled) {
        chunkErrorHandled = true;
        console.warn('🔄 Chunk fetch error detected. Reloading page in 1 second...');
        if (reloadTimeout) {
          clearTimeout(reloadTimeout);
        }
        reloadTimeout = setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      throw error;
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
