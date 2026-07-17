"use client";

import { formatMoneyInput, parseMoneyInput } from "@/utils/moneyInput";
import styles from "./VndMoneyInput.module.scss";

export default function VndMoneyInput({
  id,
  name,
  value = "",
  onChange,
  required,
  disabled,
  className = `${styles.input} input-focus-ring`,
  placeholder = "VD: 1.500.000",
  ...rest
}) {
  const rawValue = parseMoneyInput(value);

  function handleChange(event) {
    onChange?.(parseMoneyInput(event.target.value));
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={rawValue} readOnly /> : null}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatMoneyInput(rawValue)}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
        {...rest}
      />
    </>
  );
}
