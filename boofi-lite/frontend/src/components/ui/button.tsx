import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        brutalism: "bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: " text-secondary-foreground hover:text-primary underline-offset-4 hover:underline transition-color",
        fito: "group relative overflow-hidden border border-input focus:outline-none focus:ring",
        paez: "group shadow-sm bg-gradient-to-r from-indigo-100 via-pink-100 to-purple-100 hover:text-accent-foreground active:text-opacity-75",
        charly: "group relative overflow-hidden border border-yellow-200 focus:outline-none focus:ring",
      },
      size: {
        default: "h-9 px-4 py-2",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // For 'fito' variant with hover animation
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

    // For 'paez' variant with hover effect
    if (variant === "paez") {
      return (
        <div className={cn(buttonVariants({ variant, size, className }))}>
          <span className="block rounded-md bg-background px-4 py-2 font-medium group-hover:bg-transparent border border-input shadow-sm hover:bg-accent hover:text-accent-foreground">
            {props.children}
          </span>
        </div>
      );
    }
    // For 'charly' variant with full background color when selected
    if (variant === "charly") {
      const isActive = props["aria-selected"]; // Detect selected state, replace with your state logic

      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            isActive ? "bg-yellow-300 text-black" : "" // Apply background when active
          )}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              "absolute inset-y-0 left-0 w-[3px] bg-yellow-300 transition-all group-hover:w-full group-active:bg-yellow-400",
              isActive ? "w-full" : "" // Ensure full width when active
            )}
          ></span>
          <span
            className={cn(
              "relative transition-colors",
              isActive ? "text-black" : "group-hover:text-black" // Adjust text color based on active state
            )}
          >
            {props.children}
          </span>
        </Comp>
      );
    }

    // Default button handling for other variants
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
