"use client";

import { Suspense } from "react";
import AccessNotice from "@/app/components/AccessNotice";

export default function ClientRootExtras() {
  return (
    <Suspense fallback={null}>
      <AccessNotice />
    </Suspense>
  );
}
