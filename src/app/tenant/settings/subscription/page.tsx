import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { CheckCircle2, CreditCard, Download } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <RoleGuard allowedRoles={["TENANT_OWNER"]}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription & Billing</h1>
          <p className="text-gray-500">Manage your platform plan, modules, and payment methods.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50/50 border-b pb-4">
              <CardTitle className="text-blue-900">Current Plan</CardTitle>
              <CardDescription>You are on the Enterprise Tier</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold tracking-tight text-slate-800">$299</span>
                <span className="text-slate-500 mb-1">/ month</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Users</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Hospitality Module</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Restaurant Module</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Premium Support</li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full">Change Plan</Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-md border shadow-sm">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">Visa ending in 4242</p>
                      <p className="text-xs text-slate-500">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600">Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  Recent Invoices
                  <Button variant="link" size="sm" className="text-blue-600 font-normal">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Nov 1, 2023", amount: "$299.00", status: "Paid" },
                    { date: "Oct 1, 2023", amount: "$299.00", status: "Paid" },
                  ].map((invoice, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{invoice.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-800">{invoice.amount}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
