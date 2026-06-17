"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Chuyển hướng về Sales → tab Quản lý ký gửi */
export default function StaffConsignmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/staff?salesTab=consignments");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-muted text-sm">
      Đang chuyển tới Sales...
    </div>
  );
}
