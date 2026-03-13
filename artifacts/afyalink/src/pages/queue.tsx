import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useListPatients } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Queue() {
  const { chpId } = useAuth();
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<string>("Wote");

  const { data: patients, isLoading } = useListPatients(
    { chpId: chpId || undefined },
    { query: { enabled: !!chpId, refetchInterval: 5000 } }
  );

  const getTriageColor = (level: string | null | undefined) => {
    switch (level) {
      case "normal": return "border-l-[#00A651] text-[#00A651] bg-[#00A651]/10";
      case "urgent": return "border-l-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10";
      case "emergency": return "border-l-[#E30613] text-[#E30613] bg-[#E30613]/10";
      case "pregnancy_danger": return "border-l-[#7C3AED] text-[#7C3AED] bg-[#7C3AED]/10";
      default: return "border-l-slate-300 text-slate-500 bg-slate-100";
    }
  };

  const getTriageLabel = (level: string | null | undefined) => {
    if (!level) return "Needs Triage";
    return level.replace("_", " ").toUpperCase();
  };

  const getAvatarColor = (level: string | null | undefined) => {
    if (level === "emergency" || level === "pregnancy_danger") return "bg-[#E30613] text-white";
    return "bg-primary text-white";
  };

  const filters = [
    { id: "Wote", label: t("filterAll") },
    { id: "Dharura", label: t("filterUrgent") },
    { id: "Ujauzito", label: t("filterPregnancy") },
    { id: "Wakimbizi", label: t("filterRefugee") },
  ];

  const filteredPatients = patients?.filter(p => {
    if (filter === "Wote") return true;
    if (filter === "Dharura") return p.triageLevel === "emergency" || p.triageLevel === "urgent";
    if (filter === "Ujauzito") return p.triageLevel === "pregnancy_danger";
    if (filter === "Wakimbizi") return p.isRefugee;
    return true;
  }) || [];

  return (
    <div className="space-y-5">
      <div className="text-center pb-2">
        <p className="text-[12px] text-slate-400 font-medium">Vuta kushuka ili kusasisha</p>
      </div>

      <div>
        <h2 className="text-[24px] font-display font-bold text-slate-800 leading-tight">
          {lang === 'en' ? "Today's Queue" : "Queue Leo"}
        </h2>
        <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary text-[14px] font-bold px-3 py-1 rounded-full">
          {filteredPatients.length} {t("queueToday")}
        </Badge>
      </div>
      
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-[16px] font-bold transition-all border-2 ${
              filter === f.id 
                ? "bg-slate-800 text-white border-slate-800" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="w-full h-28 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-[18px] font-bold text-slate-600 mb-2">Hakuna wagonjwa leo</h3>
        </div>
      ) : (
        <div className="space-y-3 pb-20">
          <AnimatePresence>
            {filteredPatients.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/triage/${patient.id}`}>
                  <Card className={`overflow-hidden hover:shadow-md transition-shadow border-y border-r border-slate-200 border-l-[6px] shadow-sm rounded-2xl cursor-pointer ${getTriageColor(patient.triageLevel).split(' ')[0]}`}>
                    <div className="p-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-bold shadow-sm ${getAvatarColor(patient.triageLevel)}`}>
                        {patient.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[18px] text-slate-800 truncate">{patient.name}</h3>
                          {patient.isRefugee && (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px] px-1.5 py-0">Refugee</Badge>
                          )}
                        </div>
                        <p className="text-[14px] text-slate-500 font-medium flex items-center gap-1 mb-2">
                          {patient.age}y • {patient.sex.charAt(0).toUpperCase()} • <MapPin className="w-3 h-3 ml-1" /> {patient.location}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-[12px] font-bold ${getTriageColor(patient.triageLevel).split(' ').slice(1).join(' ')}`}>
                            {getTriageLabel(patient.triageLevel)}
                          </span>
                          {(patient.status === "pending" || patient.status === "queued_for_sync") && (
                            <span className="flex items-center justify-center w-2.5 h-2.5 bg-[#E30613] rounded-full" title="Unsynced" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Action Button */}
      <Link href="/triage/new" className="fixed bottom-24 right-4 sm:absolute sm:bottom-6 sm:right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30">
        <Plus className="w-8 h-8 stroke-[3]" />
      </Link>
    </div>
  );
}
