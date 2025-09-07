import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-accent-teal/30 bg-transparent text-accent-teal hover:bg-accent-teal/10 hover:border-accent-teal/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground hover:shadow-teal hover:-translate-y-1 font-semibold",
        premium: "bg-gradient-accent text-primary-foreground hover:shadow-primary hover:scale-105 font-semibold",
        glow: "bg-accent-teal text-background hover:bg-accent-teal/90 shadow-teal hover:shadow-xl animate-pulse-glow",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-500/25 hover:scale-105",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg hover:shadow-yellow-500/25 hover:scale-105",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/25 hover:scale-105",
        gradient: "bg-gradient-to-r from-primary to-accent-teal text-white hover:from-primary/90 hover:to-accent-teal/90 shadow-lg hover:shadow-xl hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  successText?: string
  errorText?: string
  onAsyncClick?: () => Promise<void>
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    successText,
    errorText,
    onAsyncClick,
    onClick,
    disabled,
    children,
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [isError, setIsError] = React.useState(false)
    const { toast } = useToast()
    
    const Comp = asChild ? Slot : "button"
    
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading || loading) return
      
      // Call regular onClick first
      if (onClick) {
        onClick(e)
      }
      
      // Handle async click
      if (onAsyncClick) {
        try {
          setIsLoading(true)
          setIsError(false)
          setIsSuccess(false)
          
          await onAsyncClick()
          
          setIsSuccess(true)
          if (successText) {
            toast({
              title: "Success!",
              description: successText,
              duration: 3000,
            })
          }
          
          // Reset success state after a delay
          setTimeout(() => setIsSuccess(false), 2000)
          
        } catch (error) {
          setIsError(true)
          const errorMessage = error instanceof Error ? error.message : "An error occurred"
          
          toast({
            title: "Error",
            description: errorText || errorMessage,
            variant: "destructive",
            duration: 5000,
          })
          
          // Reset error state after a delay
          setTimeout(() => setIsError(false), 3000)
          
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    const isDisabled = disabled || isLoading || loading
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isSuccess && "bg-green-600 text-white",
          isError && "bg-red-600 text-white",
          isDisabled && "opacity-50 cursor-not-allowed"
        )}
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        {...props}
      >
        {(isLoading || loading) ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span>{loadingText}</span>
          </>
        ) : isSuccess ? (
          <>
            <span className="text-green-100">✓</span>
            <span>{successText || children}</span>
          </>
        ) : isError ? (
          <>
            <span className="text-red-100">✗</span>
            <span>{errorText || children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }
