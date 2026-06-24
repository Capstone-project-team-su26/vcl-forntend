import InternalShell from "@/app/components/InternalShell";
import { OPS_NAV } from "@/app/pages/operations/components/operationsNav";
import { ROUTES } from "@/utils/appRoutes";

export default function OperationsShell({ activeNav = "dashboard", children }) {
  return (
    <InternalShell
      navItems={OPS_NAV}
      activeNav={activeNav}
      roleLabel="Operations"
      logoHref={ROUTES.operations.dashboard}
    >
      {children}
    </InternalShell>
  );
}
