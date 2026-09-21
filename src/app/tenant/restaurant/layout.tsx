import { ModuleGuard } from "@/components/auth/module-guard";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModuleGuard module="RESTAURANT">
      <div className="space-y-6">
        {children}
      </div>
    </ModuleGuard>
  );
}
