"use client";
import { jsx } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
function StaffConsignmentsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/staff?salesTab=consignments");
  }, [router]);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface text-muted text-sm", children: "\u0110ang chuy\u1EC3n t\u1EDBi Sales..." });
}
export {
  StaffConsignmentsPage as default
};
