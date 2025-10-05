'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ children }: { children: ReactNode }) {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')

  return (
    <div
      onClick={() => context.setIsOpen(!context.isOpen)}
      className="cursor-pointer"
    >
      {children}
    </div>
  )
}

export function DropdownMenuContent({ children }: { children: ReactNode }) {
  const context = useContext(DropdownContext)
  const ref = useRef<HTMLDivElement>(null)

  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')

  useEffect(() => {
    if (!context) return

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context.setIsOpen(false)
      }
    }

    if (context.isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [context])

  if (!context.isOpen) return null

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  onClick
}: {
  children: ReactNode
  onClick?: () => void
}) {
  const context = useContext(DropdownContext)
  
  const handleClick = () => {
    onClick?.()
    context?.setIsOpen(false)
  }

  return (
    <div
      onClick={handleClick}
      className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2"
    >
      {children}
    </div>
  )
}

