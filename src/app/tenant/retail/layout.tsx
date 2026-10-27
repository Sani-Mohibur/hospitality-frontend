import { ModuleGuard } from "@/components/auth/module-guard";

export default function RetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModuleGuard module="RETAIL">
      <div className="space-y-6">
        {children}
      </div>
    </ModuleGuard>
  );
}
