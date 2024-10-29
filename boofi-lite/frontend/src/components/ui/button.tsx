import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { useTabStore } from "@/store/tabStore";
import { useMarketStore } from "@/store/marketStore";
import { usePaymentStore } from "@/store/paymentStore";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        brutalism: "bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-secondary-foreground hover:text-primary underline-offset-4 hover:underline transition-color",
        fito: "group relative overflow-hidden border border-input focus:outline-none focus:ring",
        paez: "group shadow-sm bg-gradient-to-r from-indigo-100 via-pink-100 to-purple-100 hover:text-accent-foreground active:text-opacity-75",
        charly: "group relative overflow-hidden border border-yellow-200 focus:outline-none focus:ring",
        canterby: "group relative overflow-hidden w-full items-center uppercase justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 shadow-sm bg-gradient-to-r from-indigo-100 via-pink-100 to-purple-100 hover:text-accent-foreground active:text-opacity-75",
      },
      size: {
        default: "h-9 px-4 py-2",
        noPadding: "h-9",
        xs: "h-6 rounded-md text-xs px-4 py-2",
        sm: "h-8 rounded-md text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tabValue?: string;
  storeType?: 'market' | 'payment' | 'tab';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, tabValue, storeType, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { activeTab } = useTabStore();
    const { currentViewTab: marketTab } = useMarketStore();
    const { currentPaymentTab } = usePaymentStore();
    
    const isActive = tabValue && (
      (storeType === 'market' && tabValue === marketTab) ||
      (storeType === 'payment' && tabValue === currentPaymentTab) ||
      (storeType === 'tab' && tabValue === activeTab)
    );

    if (variant === "fito") {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          <span className="absolute inset-y-0 left-0 w-[3px] bg-indigo-400 transition-all group-hover:w-full group-active:bg-indigo-500"></span>
          <span className="relative transition-colors group-hover:text-white">
            {props.children}
          </span>
        </Comp>
      );
    }

    if (variant === "paez") {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            isActive ? "bg-gradient-to-r from-indigo-200 via-pink-200 to-purple-200" : ""
          )}
          ref={ref}
          {...props}
        >
          <span className={cn(
            "block rounded-md px-4 py-2 font-medium transition-colors",
            isActive ? "bg-transparent text-accent-foreground" : "bg-background hover:bg-transparent hover:text-accent-foreground"
          )}>
            {props.children}
          </span>
        </Comp>
      );
    }


    if (variant === "canterby") {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            isActive ? "bg-gradient-to-r from-indigo-200 via-pink-200 to-purple-200" : ""
          )}
          ref={ref}
          {...props}
        >
          <span className={cn(
            "block rounded-md px-4 py-2 font-medium transition-colors",
            isActive ? "bg-transparent text-accent-foreground" : "bg-background hover:bg-transparent hover:text-accent-foreground"
          )}>
            {props.children}
          </span>
        </Comp>
      );
    }

    if (variant === "charly") {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            isActive ? "bg-yellow-300 text-black" : ""
          )}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              "absolute inset-y-0 left-0 w-[3px] bg-yellow-300 transition-all group-hover:w-full group-active:bg-yellow-400",
              isActive ? "w-full" : ""
            )}
          ></span>
          <span
            className={cn(
              "relative transition-colors",
              isActive ? "text-black" : "group-hover:text-black"
            )}
          >
            {props.children}
          </span>
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };