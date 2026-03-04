import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ds/Input";

export interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value = "", onChange, error, label, className, disabled }, ref) => {
    // value is expected to be YYYY-MM-DD
    // format to DD/MM/YYYY for display
    const formatToDisplay = (val: string) => {
      if (!val) return "";
      // Match ISO full or partial format ignoring time if split
      const datePart = val.split('T')[0];
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = datePart.split("-");
        return `${d}/${m}/${y}`;
      }
      return val;
    };

    const [displayValue, setDisplayValue] = useState(formatToDisplay(value));

    useEffect(() => {
      const datePart = value.split('T')[0];
      if (value === "" || datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        setDisplayValue(formatToDisplay(value));
      }
    }, [value]);

    const formatDateBr = (val: string) => {
      const numbers = val.replace(/\D/g, "");
      if (numbers.length === 0) return "";
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      const formatted = formatDateBr(rawVal);
      setDisplayValue(formatted);

      if (formatted.length === 10) {
        // DD/MM/YYYY
        const d = formatted.slice(0, 2);
        const m = formatted.slice(3, 5);
        const y = formatted.slice(6, 10);
        onChange?.(`${y}-${m}-${d}`);
      } else {
        onChange?.(formatted);
      }
    };

    return (
      <Input
        ref={ref}
        type="tel"
        label={label}
        value={displayValue}
        onChange={handleChange}
        placeholder="DD/MM/AAAA"
        error={error}
        disabled={disabled}
        maxLength={10}
        className={cn("!bg-[#ffffff]", className)}
      />
    );
  }
);

DateInput.displayName = "DateInput";
