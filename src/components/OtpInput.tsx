"use client";

import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  hasError = false,
  disabled = false,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  // Normalize value to always be an array of OTP_LENGTH chars
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    refs.current[clamped]?.focus();
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, ""); // only digits
    if (!raw) return;

    const char = raw[raw.length - 1]; // take last typed digit
    const newDigits = [...digits];
    newDigits[index] = char;
    onChange(newDigits.join(""));

    // Move focus forward
    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        onChange(newDigits.join(""));
      } else if (index > 0) {
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        focusIndex(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newDigits = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    onChange(newDigits.join(""));
    // Focus last filled box
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const borderClass = hasError
    ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500"
    : "border-white/15 focus:ring-[#b80014]/50 focus:border-[#b80014]/70";

  return (
    <div className="flex gap-2 justify-center" aria-label="Kode OTP">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          id={`otp-digit-${i}`}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoComplete="one-time-code"
          aria-label={`Digit ke-${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={`
            w-11 h-14 text-center text-white text-xl font-bold
            bg-white/8 border rounded-xl outline-none
            transition-all duration-150
            focus:ring-2 caret-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${borderClass}
            ${digit ? "border-white/30" : ""}
          `}
        />
      ))}
    </div>
  );
}
