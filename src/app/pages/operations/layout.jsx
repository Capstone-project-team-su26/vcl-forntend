import AuthGuard from "@/app/components/AuthGuard";
import { ROLE_GROUPS } from "@/utils/routeAccess";

export const dynamic = "force-dynamic";

export default function OperationalDashboardLayout({ children }) {
  return <AuthGuard allowedRoles={ROLE_GROUPS.OPS}>{children}</AuthGuard>;
}
