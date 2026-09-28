import { useUiStore } from '@/stores/ui'

export function useToast() {
  const ui = useUiStore()
  return {
    success: (title, message) => ui.toast({ tone: 'success', title, message }),
    info: (title, message) => ui.toast({ tone: 'info', title, message }),
    warning: (title, message) => ui.toast({ tone: 'warning', title, message }),
    error: (title, message) => ui.toast({ tone: 'danger', title, message, timeout: 6000 }),
  }
}
