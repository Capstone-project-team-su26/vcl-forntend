import AuthGuard from "@/app/components/AuthGuard";
import SalesLayoutShell from "@/app/pages/sales/components/SalesLayoutShell";
import { ROLE_GROUPS } from "@/utils/routeAccess";

export const dynamic = "force-dynamic";

export default function SalesLayout({ children }) {
  return (
    <AuthGuard allowedRoles={ROLE_GROUPS.SALE}>
      <SalesLayoutShell>{children}</SalesLayoutShell>
    </AuthGuard>
  );
}
