import { redirect } from "next/navigation";

export default function RetailDashboardRedirect() {
  redirect("/tenant/dashboard");
}
