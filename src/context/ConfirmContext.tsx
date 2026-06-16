import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type ConfirmContextValue = {
  confirm: (message: string) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

  const confirm = useCallback((msg: string) => {
    setMessage(msg)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }, [])

  function answer(value: boolean) {
    setOpen(false)
    resolver?.(value)
    setResolver(null)
  }

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => answer(false)}>
          <div className="modal card" role="dialog" onClick={(e) => e.stopPropagation()}>
            <p>{message}</p>
            <div className="row-actions">
              <button type="button" className="btn" onClick={() => answer(false)}>
                Cancel
              </button>
              <button type="button" className="btn danger" onClick={() => answer(true)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
