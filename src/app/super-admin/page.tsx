import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Users, Package, CreditCard, DollarSign, CheckCircle2, AlertCircle, Building2, TrendingUp, Settings, BarChart3 } from "lucide-react";
import { RevenueChart } from "@/components/super-admin/revenue-chart";

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e58d4] to-[#3b82f6] rounded-2xl p-8 text-white flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin</h1>
          <p className="text-blue-100 mb-6">Here's your platform performance overview</p>
          
          <div className="flex gap-6">
            <div className="bg-white/10 rounded-xl p-4 min-w-[160px]">
              <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                <Users className="w-4 h-4" /> New Tenants
              </div>
              <div className="text-2xl font-bold">12 <span className="text-sm font-normal text-green-300 ml-1">+2 from yesterday</span></div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 min-w-[160px]">
              <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                <CreditCard className="w-4 h-4" /> Revenue Today
              </div>
              <div className="text-2xl font-bold">$4,200 <span className="text-sm font-normal text-green-300 ml-1">+5%</span></div>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Tenants", value: "342", trend: "+12.5%", label: "Active accounts", progress: 75, icon: Building2, color: "text-blue-600" },
          { title: "Active Modules", value: "1,204", trend: "+8.2%", label: "Subscribed features", progress: 62, icon: Package, color: "text-green-600" },
          { title: "Total Subscriptions", value: "856", trend: "+15.3%", label: "Active plans", progress: 85, icon: CreditCard, color: "text-orange-500" },
          { title: "Platform Revenue", value: "$1.2M", trend: "+23.1%", label: "YTD Revenue", progress: 90, icon: DollarSign, color: "text-purple-600" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm border-slate-100">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 hover:bg-green-100">{stat.trend}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 mb-3">{stat.title}</div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>{stat.progress}%</span>
              </div>
              <Progress value={stat.progress} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Comprehensive revenue performance metrics</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100">This Month</Button>
                <Button variant="ghost" size="sm">This Year</Button>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-blue-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-blue-100/50">
                  <div className="text-blue-500 mb-2"><DollarSign className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">$640K</div>
                  <div className="text-xs text-slate-500 font-medium">Total Revenue</div>
                </div>
                <div className="bg-green-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-green-100/50">
                  <div className="text-green-500 mb-2"><TrendingUp className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">+18.5%</div>
                  <div className="text-xs text-slate-500 font-medium">Growth Rate</div>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-purple-100/50">
                  <div className="text-purple-500 mb-2"><BarChart3 className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">$213K</div>
                  <div className="text-xs text-slate-500 font-medium">Avg/Month</div>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-orange-100/50">
                  <div className="text-orange-500 mb-2"><Package className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">3,022</div>
                  <div className="text-xs text-slate-500 font-medium">Total Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
                  <p className="text-xs text-slate-500">Frequently used admin tasks</p>
                </div>
              </div>
              <Card className="shadow-sm border-slate-100 bg-[#1e58d4] text-white border-none flex-1">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1 text-lg">Onboard Tenant</h3>
                  <p className="text-sm text-blue-100 mb-6">Create a new business entity</p>
                  <Button variant="secondary" className="w-full bg-white text-[#1e58d4] hover:bg-blue-50 border-none">Start Wizard</Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-100 bg-[#8b5cf6] text-white border-none flex-1">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Settings className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1 text-lg">Configure Pricing</h3>
                  <p className="text-sm text-purple-100 mb-6">Update platform module rates</p>
                  <Button variant="secondary" className="w-full bg-white text-[#8b5cf6] hover:bg-purple-50 border-none">Manage Modules</Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Top Tenants</h3>
                  <p className="text-xs text-slate-500">This month's leaders</p>
                </div>
                <Button variant="link" size="sm" className="text-blue-600 h-auto p-0 font-medium text-sm">View All &gt;</Button>
              </div>
              <Card className="shadow-sm border-slate-100 flex-1">
                <CardContent className="p-0 h-full">
                  <div className="divide-y divide-slate-100 h-full flex flex-col">
                    {[
                      { initials: "GH", name: "Grand Hotel", accounts: "1,245 users", growth: "+34.5%", revenue: "$24.5K", color: "bg-amber-500 text-white" },
                      { initials: "BP", name: "Bistro Plus", accounts: "876 users", growth: "+18.2%", revenue: "$19.8K", color: "bg-slate-400 text-white" },
                      { initials: "CR", name: "City Resort", accounts: "654 users", growth: "+15.7%", revenue: "$16.7K", color: "bg-orange-500 text-white" }
                    ].map((tenant, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors flex-1">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${tenant.color}`}>
                              {tenant.initials}
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-slate-100 text-slate-600">
                              {i + 1}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-800">{tenant.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{tenant.accounts} <span className="text-green-500 font-medium ml-1.5">{tenant.growth}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-slate-800">{tenant.revenue}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                Live Activity
                <span className="flex items-center text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span> Live
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "Grand Hotel registered as a tenant", time: "2 minutes ago", icon: Building2, color: "text-blue-500 bg-blue-50" },
                { title: "Bistro Plus renewed subscription", time: "15 minutes ago", icon: CheckCircle2, color: "text-green-500 bg-green-50" },
                { title: "Module 'HOSPITALITY' price updated", time: "32 minutes ago", icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
                { title: "Payment failed for tenant #842", time: "1 hour ago", icon: AlertCircle, color: "text-red-500 bg-red-50" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`mt-0.5 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-blue-600">View All Activities</Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100 border-t-4 border-t-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Pending Actions
                <Badge variant="destructive" className="rounded-full bg-red-500 hover:bg-red-600">3 Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl text-sm">
                  <span className="font-medium text-red-800">Overdue Subscriptions</span>
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl text-sm">
                  <span className="font-medium text-orange-800">Tenant Approvals</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">5</span>
                </div>
                <Button className="w-full mt-2" variant="outline">Review Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
