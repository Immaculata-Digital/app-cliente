import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ds/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

const COUNTRY_CODES = [
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+351", country: "PT", flag: "🇵🇹" },
];

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", onChange, error, label, className, inputClassName, disabled }, ref) => {
    // Determine initial state
    const getDefaultState = () => {
      let ddi = "+55";
      let phone = "";
      if (value) {
        if (value.startsWith("+55")) {
          ddi = "+55";
          phone = value.slice(3);
        } else if (value.startsWith("+1")) {
          ddi = "+1";
          phone = value.slice(2);
        } else if (value.startsWith("+351")) {
          ddi = "+351";
          phone = value.slice(4);
        } else {
           // Fallback, extract only numbers
           phone = value.replace(/\D/g, "");
        }
      }
      return { ddi, phone };
    };

    const [countryCode, setCountryCode] = useState(getDefaultState().ddi);
    const [phoneNumber, setPhoneNumber] = useState(getDefaultState().phone);

    // Sync external value changes (like form reset or external update)
    useEffect(() => {
       const { ddi, phone } = getDefaultState();
       setCountryCode(ddi);
       // only format if BR, else just digits
       setPhoneNumber(ddi === "+55" ? formatPhoneBr(phone) : phone);
    }, [value]);

    const formatPhoneBr = (val: string) => {
      const numbers = val.replace(/\D/g, "");
      if (numbers.length === 0) return "";
      if (numbers.length <= 2) return `(${numbers}`;
      if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatGenericPhone = (val: string) => {
       return val.replace(/\D/g, "");
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawVal = e.target.value.replace(/\D/g, '');
      
      // Limit to 11 digits for BR
      if (countryCode === "+55" && rawVal.length > 11) {
         rawVal = rawVal.slice(0, 11);
      } else if (rawVal.length > 15) {
         rawVal = rawVal.slice(0, 15); // max international length
      }

      let formatted = rawVal;
      if (countryCode === "+55") {
         formatted = formatPhoneBr(rawVal);
      } else {
         formatted = formatGenericPhone(rawVal);
      }

      setPhoneNumber(formatted);
      onChange?.(`${countryCode}${rawVal}`);
    };

    const handleCountryChange = (val: string) => {
      setCountryCode(val);
      const rawVal = phoneNumber.replace(/\D/g, '');
      onChange?.(`${val}${rawVal}`);
    };

    const displayPlaceholder = countryCode === "+55" ? "(00) 00000-0000" : "0000000000";

    return (
      <div className={cn("w-full", className)}>
         {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5 leading-none">
            {label}
          </label>
        )}
        <div className="flex gap-2 relative">
           <div className="w-[90px] shrink-0">
             <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
               <SelectTrigger className={cn("h-11 bg-card w-full justify-between px-2", inputClassName, error && "border-destructive/80")}>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {COUNTRY_CODES.map((c) => (
                   <SelectItem key={c.code} value={c.code} className="px-2">
                     <span className="flex items-center gap-1.5 text-sm">
                       <span>{c.flag}</span>
                       <span>{c.code}</span>
                     </span>
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           
           <div className="flex-1 min-w-0">
               <Input
                 ref={ref}
                 type="tel"
                 value={phoneNumber}
                 onChange={handlePhoneChange}
                 placeholder={displayPlaceholder}
                 error={error}
                 disabled={disabled}
                 className={inputClassName}
               />
           </div>
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
