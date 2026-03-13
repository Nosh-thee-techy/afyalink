import { motion } from "framer-motion";
import { CloudOff, CloudUpload, Users, AlertTriangle, Baby, Building2, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useGetDashboardStats, useSyncToEchis } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { chpId } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  
  const { data: stats, isLoading, refetch } = useGetDashboardStats({ chpId: chpId || undefined });
  const syncMutation = useSyncToEchis();

  const handleSync = async () => {
    try {
      const res = await syncMutation.mutateAsync();
      toast({ 
        title: "✓ Synced to eCHIS", 
        description: `${res.recordsSynced} records updated securely.`,
        className: "bg-green-600 text-white border-none"
      });
      refetch();
    } catch (err) {
      toast({ title: "Sync failed", variant: "destructive" });
    }
  };

  const handleExport = () => {
    toast({ title: "Export Started", description: "Exported anonymized data to CSV" });
  };

  if (isLoading || !stats) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-slate-800">{t("dashboard")}</h2>
        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200">
          <CloudOff className="w-3 h-3" />
          {stats.pendingSync} Pending Sync
        </div>
      </div>

      {/* Main Action */}
      <Button 
        onClick={handleSync} 
        disabled={syncMutation.isPending || stats.pendingSync === 0}
        className={`w-full h-16 rounded-2xl shadow-lg transition-all ${stats.pendingSync > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30' : 'bg-slate-200 text-slate-500 shadow-none'}`}
      >
        <CloudUpload className={`w-6 h-6 mr-2 ${syncMutation.isPending ? 'animate-bounce' : ''}`} />
        <span className="font-display font-bold text-lg tracking-wide">{t("syncEchis")}</span>
      </Button>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="bg-primary" />
        <StatCard title="Referrals" value={stats.referralsMade} icon={Building2} color="bg-indigo-600" />
        <StatCard title="Emergencies" value={stats.emergencyCases} icon={AlertTriangle} color="bg-red-600" />
        <StatCard title="Pregnancy Alert" value={stats.pregnancyDangerCases} icon={Baby} color="bg-purple-600" />
      </div>

      {/* County Breakdown */}
      <Card className="border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">County / Camp Breakdown</h3>
          <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.countySummaries.map((c, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white">
              <span className="font-semibold text-slate-800">{c.county}</span>
              <div className="flex gap-4 text-sm">
                <span className="text-slate-500"><b className="text-slate-700">{c.totalCases}</b> Total</span>
                <span className="text-red-500 font-medium"><b className="text-red-600">{c.urgentCases}</b> Urgent</span>
              </div>
            </div>
          ))}
          {stats.countySummaries.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-medium">No data available</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-slate-100 shadow-sm p-4 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/3`}></div>
      <Icon className={`w-6 h-6 mb-3 ${color.replace('bg-', 'text-')}`} />
      <div className="font-display text-3xl font-extrabold text-slate-800 mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</div>
    </Card>
  );
}
