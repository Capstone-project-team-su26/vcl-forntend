"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import styles from "./CopyCodeButton.module.scss";

export default function CopyCodeButton({ value }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={styles.btn}
      title={copied ? "Đã sao chép" : "Sao chép mã"}
      aria-label={copied ? "Đã sao chép mã" : "Sao chép mã"}
    >
      <Icon icon={copied ? "lucide:check" : "lucide:copy"} className={styles.icon} />
    </button>
  );
}
