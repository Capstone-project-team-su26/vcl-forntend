"use client";

import dynamic from "next/dynamic";

const OperationalConsolidate = dynamic(
  () => import("../components/OperationalConsolidate"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-24 text-muted">
        Đang tải consolidation...
      </div>
    ),
    ssr: false,
  }
);

export default function Page() {
  return <OperationalConsolidate />;
}
