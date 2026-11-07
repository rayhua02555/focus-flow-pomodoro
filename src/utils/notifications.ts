import confetti from 'canvas-confetti';

export function fireConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#10b981'],
    });
  } catch {
    // Ignore confetti issues
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission();
    return res === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        silent: false,
      });
    } catch {
      // Fallback
    }
  }
}
