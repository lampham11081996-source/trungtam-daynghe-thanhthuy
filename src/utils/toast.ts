export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export type ToastCallback = (toast: ToastMessage) => void;

class ToastManager {
  private listeners: Set<ToastCallback> = new Set();

  subscribe(listener: ToastCallback) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 4000) {
    const toastMessage: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      duration
    };
    this.listeners.forEach((listener) => listener(toastMessage));
  }

  success(message: string, duration = 4000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 4000) {
    this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();
