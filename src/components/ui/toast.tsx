"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"
type Toast = { id: string; message: string; type: ToastType }
type ToastContextType = { toast: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextType>({ toast: () => {} })
export function useToast() { return useContext(ToastContext) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, 4000)
  }, [])
  const removeToast = useCallback((id: string) => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, [])
  const icons = { success: <CheckCircle2 className="h-4 w-4 text-green-500" />, error: <AlertCircle className="h-4 w-4 text-red-500" />, info: <Info className="h-4 w-4 text-blue-500" /> }
  const colors = { success: "border-green-200 bg-green-50", error: "border-red-200 bg-red-50", info: "border-blue-200 bg-blue-50" }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg transition-all animate-in slide-in-from-right ${colors[t.type]}`}>
            {icons[t.type]}
            <span className="text-sm font-medium text-gray-900">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}