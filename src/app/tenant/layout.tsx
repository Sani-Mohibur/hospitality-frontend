import { TenantSidebar } from "@/components/layout/tenant-sidebar";
import { TenantTopbar } from "@/components/layout/tenant-topbar";
import { AuthGuard } from "@/components/auth-guard";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER", "STAFF"]}>
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
        <TenantSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TenantTopbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
