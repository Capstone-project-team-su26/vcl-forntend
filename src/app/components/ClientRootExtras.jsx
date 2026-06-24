"use client";

import { Suspense } from "react";
import AccessNotice from "@/app/components/AccessNotice";
import AuthSessionSync from "@/app/components/AuthSessionSync";

export default function ClientRootExtras() {
  return (
    <>
      <AuthSessionSync />
      <Suspense fallback={null}>
        <AccessNotice />
      </Suspense>
    </>
  );
}
