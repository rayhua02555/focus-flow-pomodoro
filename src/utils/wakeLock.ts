/**
 * Screen Wake Lock API manager.
 * Keeps the mobile screen on while the Pomodoro timer is running,
 * preventing unexpected device sleep / lock screen.
 */

class ScreenWakeLock {
  private sentinel: any = null;
  private isRequested: boolean = false;

  async request(): Promise<boolean> {
    this.isRequested = true;
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
        });
        return true;
      } catch {
        // May be rejected if low battery mode is on or tab is backgrounded
        return false;
      }
    }
    return false;
  }

  release(): void {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        this.sentinel.release();
      } catch {
        // ignore
      }
      this.sentinel = null;
    }
  }

  // Automatically re-request wake lock if tab becomes visible again
  async onVisibilityChange(): Promise<void> {
    if (
      this.isRequested &&
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible' &&
      !this.sentinel
    ) {
      await this.request();
    }
  }
}

export const screenWakeLock = new ScreenWakeLock();

