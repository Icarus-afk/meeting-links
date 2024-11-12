import * as React from "react";
import { cn } from "@/lib/utils";

const LoadingScreen = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75",
      className
    )}
    {...props}
  >
    <div className="loader">Loading...</div>
  </div>
));
LoadingScreen.displayName = "LoadingScreen";

export { LoadingScreen };
