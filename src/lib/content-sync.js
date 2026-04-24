const CONTENT_UPDATED_EVENT = 'content-updated';
const CONTENT_UPDATED_STORAGE_KEY = 'doctor_site_content_updated_at';

export function notifyContentUpdated() {
  const timestamp = Date.now().toString();

  window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT, { detail: timestamp }));
  window.localStorage.setItem(CONTENT_UPDATED_STORAGE_KEY, timestamp);
}

export function subscribeToContentUpdates(callback) {
  const handleUpdate = () => callback();
  const handleStorage = (event) => {
    if (event.key === CONTENT_UPDATED_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(CONTENT_UPDATED_EVENT, handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}
