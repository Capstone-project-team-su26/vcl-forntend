import AuthGuard from "@/app/components/AuthGuard";
import { ROLE_GROUPS } from "@/utils/routeAccess";

export default function ProfileLayout({ children }) {
  return <AuthGuard allowedRoles={ROLE_GROUPS.CUSTOMER}>{children}</AuthGuard>;
}
