import * as React from "react";
import { cn } from "./utils";
import { Search } from "lucide-react";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, type = "text", showIcon = true, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {showIcon && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "flex h-9 w-full rounded-full border border-border px-3 py-1 text-base transition-all duration-200 bg-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm",
            "focus:outline-none focus-visible:outline-none",
            showIcon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
export default SearchInput;
