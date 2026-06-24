import AuthGuard from "@/app/components/AuthGuard";
import { ROLE_GROUPS } from "@/utils/routeAccess";

export default function AdminLayout({ children }) {
  return <AuthGuard allowedRoles={ROLE_GROUPS.ADMIN}>{children}</AuthGuard>;
}
