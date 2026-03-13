import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { Plus, MapPin, Ambulance, FileText, X, Check, Navigation } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useListReferrals, useListPatients, useCreateReferral } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FACILITIES = [
  "Kakuma Mission Hospital", 
  "Dadaab Level 4", 
  "Turkana County Referral", 
  "Garissa County Referral", 
  "Mandera County Referral"
];

const formSchema = z.object({
  patientId: z.string().min(1, "Select patient"),
  facilityName: z.string().min(1, "Select facility"),
  urgency: z.enum(["routine", "urgent", "emergency"]),
  distanceKm: z.coerce.number().default(15),
  county: z.string().default("Turkana"),
});

export default function Referrals() {
  const { chpId } = useAuth();
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);

  const { data: referrals, isLoading, refetch } = useListReferrals();
  const { data: patients } = useListPatients({ chpId: chpId || undefined });
  const createReferral = useCreateReferral();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { urgency: "urgent" }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const res = await createReferral.mutateAsync({
        data: {
          ...data,
          chpId: chpId || "UNKNOWN",
          facilityLevel: "Level 4", 
        }
      });
      toast({ title: "Referral Created successfully" });
      setIsCreating(false);
      refetch();
      
      const patient = patients?.find(p => p.id === data.patientId);
      if (patient?.isRefugee) {
        setShowQR(res.id);
      }
    } catch (err) {
      toast({ title: "Failed to create referral", variant: "destructive" });
    }
  };

  const getUrgencyColor = (u: string) => {
    if (u === "emergency") return "bg-[#E30613]/10 text-[#E30613] border-[#E30613]/20";
    if (u === "urgent") return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
    return "bg-[#00A651]/10 text-[#00A651] border-[#00A651]/20";
  };

  if (showQR) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 bg-white rounded-3xl p-6 text-center shadow-sm">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-[28px] font-display font-bold mb-2 leading-tight">Rejeleo la Mkimbizi Limeundwa</h2>
          <p className="text-slate-500 text-[18px] max-w-[250px] mx-auto">Mwambie mgonjwa aonyeshe hii {t("patientCard")} (QR) anapofika zahanati.</p>
        </div>
        
        <div className="p-6 bg-white border-4 border-slate-100 rounded-3xl shadow-xl">
          <QRCodeSVG value={`afyalink:referral:${showQR}`} size={220} level="H" />
        </div>
        
        <Button size="lg" className="w-full mt-auto h-16 text-[18px] font-bold rounded-2xl bg-primary text-white" onClick={() => setShowQR(null)}>
          {t("backQueue")}
        </Button>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[24px] font-display font-bold text-slate-800">{t("createReferral")}</h2>
          <button onClick={() => setIsCreating(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="space-y-2">
            <Label className="text-[16px] font-bold text-slate-700">Mgonjwa (Select Patient)</Label>
            <select {...form.register("patientId")} className="flex h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-[18px] font-medium outline-none focus:border-primary">
              <option value="">-- Chagua (Choose) --</option>
              {patients?.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.isRefugee ? "(Refugee)" : ""}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[16px] font-bold text-slate-700">Kituo cha Afya (Destination)</Label>
            <select {...form.register("facilityName")} className="flex h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-[18px] font-medium outline-none focus:border-primary">
              <option value="">-- Chagua (Choose) --</option>
              {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[16px] font-bold text-slate-700">Hali ya Dharura (Urgency)</Label>
            <select {...form.register("urgency")} className="flex h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-[18px] font-medium outline-none focus:border-primary">
              <option value="routine">Kawaida (Routine)</option>
              <option value="urgent">Dharura Ndogo (Urgent)</option>
              <option value="emergency">Dharura Kuu (Emergency)</option>
            </select>
          </div>

          <Button type="submit" className="w-full h-16 text-[18px] font-bold rounded-2xl mt-4 bg-primary text-white" disabled={createReferral.isPending}>
            {createReferral.isPending ? "Inatuma..." : "Tuma Rejeleo (Send)"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-display font-bold text-slate-800">{t("referralPage")}</h2>
        
        <Button onClick={() => setIsCreating(true)} className="h-12 rounded-full px-5 text-[16px] font-bold shadow-md bg-primary text-white">
          <Plus className="w-5 h-5 mr-1"/> Mpya
        </Button>
      </div>

      {/* Map Placeholder */}
      <div className="w-full h-24 bg-slate-200 rounded-3xl overflow-hidden relative border-2 border-slate-300 flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-400">
            <path d="M10,20 L90,20 L90,80 L10,80 Z" />
          </svg>
        </div>
        <div className="bg-white/90 px-4 py-2 rounded-xl backdrop-blur-sm z-10 flex items-center gap-2 shadow-sm">
          <Navigation className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-700 text-[14px]">Ramani ya Kaunti (Turkana)</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="w-full h-40 bg-slate-200 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : referrals?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Ambulance className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-[18px] font-bold text-slate-600">Hakuna rejeleo (No referrals)</h3>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {referrals?.map((ref, i) => {
            const patient = patients?.find(p => p.id === ref.patientId);
            return (
              <motion.div key={ref.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-white">
                    <div>
                      <h3 className="font-bold text-[18px] leading-tight mb-2 text-slate-800">
                        {patient?.isRefugee ? "Anonymous (Refugee)" : patient?.name || "Unknown Patient"}
                      </h3>
                      <div className="flex items-center text-slate-500 text-[15px] font-medium bg-slate-50 px-2 py-1 rounded-lg w-fit">
                        <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                        {ref.facilityName}
                      </div>
                    </div>
                    <Badge variant="outline" className={`border-2 ${getUrgencyColor(ref.urgency)} uppercase px-3 py-1 font-bold text-[12px] rounded-lg`}>
                      {ref.urgency}
                    </Badge>
                  </div>
                  
                  {/* Status Tracker */}
                  <div className="bg-slate-50 px-5 py-4">
                    <div className="flex justify-between items-center relative mb-2">
                      <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
                      
                      {['queued', 'sent', 'seen'].map((status, idx) => {
                        const isActive = ref.status === 'completed' || (ref.status === 'in_transit' && idx <= 1) || (idx === 0);
                        return (
                          <div key={status} className="relative z-10 flex flex-col items-center gap-1">
                            <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-primary border-primary' : 'bg-slate-100 border-slate-300'}`}></div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase mt-2">
                      <span>Queued</span>
                      <span>In Transit</span>
                      <span>Arrived</span>
                    </div>

                    {patient?.isRefugee && (
                      <div className="mt-4 flex justify-end">
                        <button onClick={() => setShowQR(ref.id)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-[14px] font-bold flex items-center transition-colors">
                          <FileText className="w-4 h-4 mr-2" /> Kadi ya Mgonjwa
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
}
