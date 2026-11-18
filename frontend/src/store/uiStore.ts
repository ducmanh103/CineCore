import { create } from 'zustand';
import { Movie } from '../types';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (result: boolean) => void;
}

interface UiState {
  toasts: ToastItem[];
  confirmDialog: ConfirmState | null;
  trailerMovie: Movie | null;

  addToast: (toast: Omit<ToastItem, 'id'>, durationMs?: number) => void;
  dismissToast: (id: string) => void;

  confirm: (options: ConfirmOptions) => Promise<boolean>;
  resolveConfirm: (result: boolean) => void;

  openTrailer: (movie: Movie) => void;
  closeTrailer: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  confirmDialog: null,
  trailerMovie: null,

  addToast: (toast, durationMs = 4200) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { ...toast, id }],
    }));
    if (durationMs > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, durationMs);
    }
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        confirmDialog: {
          confirmText: 'Xác nhận',
          cancelText: 'Hủy bỏ',
          variant: 'primary',
          ...options,
          resolve,
        },
      });
    }),

  resolveConfirm: (result) => {
    const current = get().confirmDialog;
    if (current) {
      current.resolve(result);
    }
    set({ confirmDialog: null });
  },

  openTrailer: (movie) => set({ trailerMovie: movie }),
  closeTrailer: () => set({ trailerMovie: null }),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useUiStore.getState().addToast({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    useUiStore.getState().addToast({ type: 'error', title, description }, 5200),
  warning: (title: string, description?: string) =>
    useUiStore.getState().addToast({ type: 'warning', title, description }),
  info: (title: string, description?: string) =>
    useUiStore.getState().addToast({ type: 'info', title, description }),
};
