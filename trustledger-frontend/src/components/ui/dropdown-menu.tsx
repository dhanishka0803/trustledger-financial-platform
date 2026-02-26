import * as React from "react"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; isOpen?: boolean; setIsOpen?: (open: boolean) => void }
>(({ children, asChild, isOpen, setIsOpen, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, { 
      ref, 
      onClick: () => setIsOpen?.(!isOpen),
      ...props 
    })
  }
  return (
    <button ref={ref} onClick={() => setIsOpen?.(!isOpen)} {...props}>
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = ({ 
  children, 
  align = "center",
  className = "",
  isOpen,
  setIsOpen
}: { 
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}) => {
  if (!isOpen) return null
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen?.(false)
  }
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={handleBackdropClick}
      />
      <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-gray-800 p-1 shadow-md ${
        align === "end" ? "right-0" : align === "start" ? "left-0" : "left-1/2 transform -translate-x-1/2"
      } ${className}`}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { setIsOpen })
          }
          return child
        })}
      </div>
    </>
  )
}

const DropdownMenuItem = ({ 
  children, 
  className = "",
  onClick,
  setIsOpen,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { setIsOpen?: (open: boolean) => void }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsOpen?.(false)
    onClick?.(e)
  }
  
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
      {children}
    </div>
  )
}

const DropdownMenuSeparator = () => {
  return <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}