import { redirect } from "next/navigation";
import { ROUTES } from "@/utils/appRoutes";

export default function Page() {
  redirect(ROUTES.auth.login);
}
