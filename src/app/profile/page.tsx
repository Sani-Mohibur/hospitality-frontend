import { redirect } from "next/navigation";

export default function ProfileRedirectPage() {
  redirect("/tenant/settings/profile");
}
