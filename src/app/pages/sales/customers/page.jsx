import { redirect } from "next/navigation";
import { ROUTES } from "@/utils/appRoutes";

/** Quản lý khách đã chuyển sang Admin → Quản lý khách. */
export default function Page() {
  redirect(ROUTES.sales.consignments);
}
