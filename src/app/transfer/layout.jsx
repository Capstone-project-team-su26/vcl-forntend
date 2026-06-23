import AuthGuard from "@/app/components/AuthGuard";
import { ROLE_GROUPS } from "@/utils/routeAccess";

export default function TransferLayout({ children }) {
  return <AuthGuard allowedRoles={ROLE_GROUPS.STAFF}>{children}</AuthGuard>;
}
