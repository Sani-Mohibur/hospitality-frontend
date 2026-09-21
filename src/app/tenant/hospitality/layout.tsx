import { ModuleGuard } from "@/components/auth/module-guard";

export default function HospitalityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModuleGuard module="HOSPITALITY">
      <div className="space-y-6">
        {children}
      </div>
    </ModuleGuard>
  );
}
