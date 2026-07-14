export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('VERDEVIA-toast', {
      detail: { message, type, duration },
    }),
  );
}
