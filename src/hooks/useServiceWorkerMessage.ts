import { useEffect } from 'react';

/**
 * Custom hook to listen for service worker messages of a specific type.
 * @param {Function} onMessageCallback Callback function to execute when the specified message is received.
 */
export function useServiceWorkerMessage(messageType: string, onMessageCallback: () => void) {
  useEffect(() => {
    // Define the message handler
    const handleMessage = (event: any) => {
      if (event.data && event.data.type === messageType) {
        onMessageCallback();
      }
    };

    // Check for service worker support and if it's controlling the page
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Add the message event listener
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    // Cleanup function to remove the event listener
    return () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [messageType, onMessageCallback]); // Re-run the effect if the callback changes
}