export function formatRelativeTimeIST(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  // convert to IST offset (India is UTC+5:30)
  // We display relative time based on now - date in ms
  const now = new Date();
  const diff = now - date; // ms
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds === 1 ? '' : 's'} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' });
}

export function formatAbsoluteIST(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}