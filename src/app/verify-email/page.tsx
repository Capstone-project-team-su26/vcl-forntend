import { Suspense } from "react";
import { VerifyEmailPage } from "@/modules/auth";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
