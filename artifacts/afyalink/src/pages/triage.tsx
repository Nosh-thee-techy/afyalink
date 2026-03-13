import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Activity, Thermometer, Brain, Baby, Mic, Video, Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useCreatePatient, useUpdatePatient, useGetPatient } from "@workspace/api-client-react";
import { PatientTriageLevel } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name required"),
  age: z.coerce.number().min(0).max(120),
  sex: z.enum(["male", "female", "other"]),
  location: z.string().min(2, "Location required"),
  isRefugee: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const SYMPTOMS = [
  { id: "fever", label: "High Fever", icon: Thermometer, weight: 2 },
  { id: "breathing", label: "Difficulty Breathing", icon: Activity, weight: 3 },
  { id: "confusion", label: "Confusion / Lethargy", icon: Brain, weight: 3 },
  { id: "bleeding_preg", label: "Bleeding (Pregnant)", icon: Baby, weight: 4 },
  { id: "rash", label: "Skin Rash", icon: AlertCircle, weight: 1 },
  { id: "diarrhea", label: "Severe Diarrhea", icon: AlertCircle, weight: 2 },
];

export default function Triage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const { chpId } = useAuth();
  const { t, lang } = useI18n();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<{ level: PatientTriageLevel, conf: number } | null>(null);
  const [patientId, setPatientId] = useState<string | null>(isNew ? null : id);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [showEnToggle, setShowEnToggle] = useState(false);

  const { data: existingPatient } = useGetPatient(id || "", { query: { enabled: !isNew } });
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 0,
      sex: "male",
      location: "",
      isRefugee: false,
    }
  });

  useEffect(() => {
    if (existingPatient) {
      form.reset({
        name: existingPatient.name,
        age: existingPatient.age,
        sex: existingPatient.sex,
        location: existingPatient.location,
        isRefugee: existingPatient.isRefugee,
      });
      if (existingPatient.triageLevel) {
        setTriageResult({
          level: existingPatient.triageLevel as PatientTriageLevel,
          conf: existingPatient.triageConfidence || 95
        });
        setStep(3);
      } else {
        setStep(2);
      }
    }
  }, [existingPatient, form]);

  const toggleSymptom = (symId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symId) ? prev.filter(id => id !== symId) : [...prev, symId]
    );
  };

  const handleRunAI = async () => {
    if (selectedSymptoms.length === 0) {
      toast({ title: "Select symptoms", description: "Tafadhali chagua angalau dalili moja.", variant: "destructive" });
      return;
    }

    setIsTakingPhoto(true);
    setTimeout(async () => {
      setIsTakingPhoto(false);
      
      let totalWeight = 0;
      let hasPregnancyDanger = false;
      
      selectedSymptoms.forEach(sid => {
        const sym = SYMPTOMS.find(s => s.id === sid);
        if (sym) totalWeight += sym.weight;
        if (sid === "bleeding_preg") hasPregnancyDanger = true;
      });

      let level: PatientTriageLevel = "normal";
      if (hasPregnancyDanger) level = "pregnancy_danger";
      else if (totalWeight >= 4) level = "emergency";
      else if (totalWeight >= 2) level = "urgent";

      const conf = Math.floor(Math.random() * 15) + 85; 
      setTriageResult({ level, conf });
      
      if (patientId) {
        await updatePatient.mutateAsync({
          id: patientId,
          data: {
            triageLevel: level,
            triageConfidence: conf,
            symptomsDescription: selectedSymptoms.join(", ")
          }
        });
        toast({ title: "Triage saved" });
      }
      setStep(3);
    }, 1500);
  };

  const onBasicInfoSubmit = async (data: FormData) => {
    try {
      if (isNew) {
        const res = await createPatient.mutateAsync({
          data: {
            ...data,
            chpId: chpId || "UNKNOWN",
          }
        });
        setPatientId(res.id);
      } else if (patientId) {
        await updatePatient.mutateAsync({
          id: patientId,
          data: {} 
        });
      }
      setStep(2);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save patient", variant: "destructive" });
    }
  };

  const getTriageDisplay = (level: PatientTriageLevel, showEn: boolean) => {
    switch (level) {
      case "normal": return { 
        color: "bg-[#00A651]", 
        title: showEn ? "NORMAL – Follow advice" : "KAWAIDA – Fuata ushauri", 
        desc: showEn ? "No immediate danger, monitor at home." : "Hakuna hatari, mpe ushauri wa nyumbani.", 
        icon: CheckCircle2 
      };
      case "urgent": return { 
        color: "bg-[#F59E0B]", 
        title: showEn ? "URGENT – See today" : "DHARURA NDOGO – Tazama leo", 
        desc: showEn ? "Needs medical attention today." : "Anahitaji matibabu leo, mpeleke zahanati.", 
        icon: AlertCircle 
      };
      case "emergency": return { 
        color: "bg-[#E30613] animate-pulse", 
        title: showEn ? "EMERGENCY! – Call NOW" : "DHARURA KUU! – Piga simu SASA", 
        desc: showEn ? "Immediate life threat. Dispatch ambulance." : "Hatari kubwa! Ita gari la wagonjwa sasa hivi.", 
        icon: AlertTriangle 
      };
      case "pregnancy_danger": return { 
        color: "bg-[#7C3AED]", 
        title: showEn ? "PREGNANCY DANGER – Urgent referral" : "HATARI YA UJAUZITO – Rejeleo la haraka", 
        desc: showEn ? "Maternal danger signs present." : "Dalili za hatari za ujauzito. Mpeleke hospitali mara moja.", 
        icon: Baby 
      };
      default: return { color: "bg-slate-500", title: "UNKNOWN", desc: "Needs assessment", icon: Activity };
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-bold text-slate-500">Step {step}/3</span>
        <div className="flex items-center gap-2 flex-1 ml-4">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-[24px] font-display font-bold mb-4 text-slate-800">Maelezo ya Mgonjwa</h2>
            <form onSubmit={form.handleSubmit(onBasicInfoSubmit)} className="space-y-5 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200">
              
              <div className="space-y-2">
                <Label className="text-[16px] font-bold text-slate-700">Jina Kamili</Label>
                <Input {...form.register("name")} placeholder="Jina la mgonjwa" className="h-14 text-[18px] bg-slate-50 border-slate-200 rounded-2xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[16px] font-bold text-slate-700">Umri (Age)</Label>
                  <Input type="number" {...form.register("age")} className="h-14 text-[18px] bg-slate-50 border-slate-200 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[16px] font-bold text-slate-700">Jinsia (Sex)</Label>
                  <select {...form.register("sex")} className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[18px] font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    <option value="male">Mwanaume</option>
                    <option value="female">Mwanamke</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[16px] font-bold text-slate-700">Eneo / Kijiji (Location)</Label>
                <Input {...form.register("location")} placeholder="Mfn. Kakuma Camp 3" className="h-14 text-[18px] bg-slate-50 border-slate-200 rounded-2xl" />
              </div>

              <label className="flex items-center gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl cursor-pointer">
                <input type="checkbox" {...form.register("isRefugee")} className="w-6 h-6 rounded text-primary focus:ring-primary" />
                <div className="flex flex-col">
                  <span className="font-bold text-[16px] text-blue-900">Mgonjwa ni Mkimbizi? (Refugee)</span>
                  <span className="text-[14px] text-blue-700">Itatengeneza namba ya siri (QR code)</span>
                </div>
              </label>

              <Button type="submit" className="w-full h-14 text-[18px] font-bold rounded-2xl mt-4 bg-primary text-white" disabled={createPatient.isPending}>
                {createPatient.isPending ? "Inahifadhi..." : "Endelea (Continue)"} <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h2 className="text-[24px] font-display font-bold mb-4 text-slate-800">Uchunguzi wa Dalili</h2>
            
            <div className="flex flex-col items-center mb-8 gap-4">
              <button 
                type="button"
                onClick={() => toast({ title: "Kamera imeanza", description: "Camera started (demo)" })}
                className="w-32 h-32 rounded-full bg-primary flex flex-col items-center justify-center text-white shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
              >
                <Camera className="w-12 h-12 mb-1" />
              </button>
              <span className="font-bold text-[18px] text-slate-700">{t("takePhoto")}</span>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 flex gap-4 items-center">
              <button 
                type="button"
                onClick={() => toast({ title: "Inarekodi...", description: "Recording voice note (demo)" })}
                className="w-16 h-16 rounded-full bg-[#E30613] flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-red-500/30"
              >
                <Mic className="w-8 h-8" />
              </button>
              <div className="flex-1">
                <p className="font-bold text-[16px] text-slate-700 mb-1">{t("recordVoice")}</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E30613] w-1/3 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Textarea placeholder="Maelezo ya ziada / Additional notes" className="h-24 text-[16px] rounded-2xl bg-white border-slate-200 resize-none" />
            </div>

            <h3 className="font-bold text-[18px] text-slate-700 mb-3">Chagua Dalili (Select Symptoms):</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {SYMPTOMS.map(sym => {
                const isSelected = selectedSymptoms.includes(sym.id);
                const Icon = sym.icon;
                return (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col items-start gap-3 transition-all min-h-[100px] ${
                      isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                    <span className={`text-[16px] font-bold leading-tight ${isSelected ? 'text-primary' : 'text-slate-600'}`}>{sym.label}</span>
                  </button>
                )
              })}
            </div>

            <Button 
              onClick={handleRunAI} 
              className="w-full h-[64px] text-[20px] font-bold rounded-2xl shadow-xl shadow-primary/20 bg-gradient-to-r from-[#00A651] to-emerald-600 text-white"
              disabled={isTakingPhoto}
            >
              {isTakingPhoto ? (
                <><Activity className="w-6 h-6 mr-2 animate-spin" /> Inachakata (Processing)...</>
              ) : (
                <><Brain className="w-6 h-6 mr-2" /> {t("runAI")}</>
              )}
            </Button>
          </motion.div>
        )}

        {step === 3 && triageResult && (
          <motion.div key="step3" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <div className={`p-6 rounded-[2rem] text-white shadow-xl ${getTriageDisplay(triageResult.level, showEnToggle).color}`}>
              <div className="flex justify-between items-start mb-4">
                {(() => {
                  const Icon = getTriageDisplay(triageResult.level, showEnToggle).icon;
                  return <Icon className="w-14 h-14 opacity-90" />
                })()}
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white/20 px-4 py-1.5 rounded-full text-[14px] font-bold backdrop-blur-md">
                    {triageResult.conf}% Uhakika (Conf)
                  </div>
                  <button 
                    onClick={() => setShowEnToggle(!showEnToggle)}
                    className="text-[12px] bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-bold transition-colors"
                  >
                    {showEnToggle ? "SW" : "EN"} Toggle
                  </button>
                </div>
              </div>
              <h3 className="font-display text-[28px] leading-tight font-extrabold mb-2">{getTriageDisplay(triageResult.level, showEnToggle).title}</h3>
              <p className="text-white/90 font-medium text-[18px]">{getTriageDisplay(triageResult.level, showEnToggle).desc}</p>
            </div>

            {/* Video Record Call to action */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-5 text-center">
              <Button className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[18px] rounded-2xl shadow-lg shadow-orange-500/20 mb-3">
                <Video className="w-6 h-6 mr-2" />
                {t("recordVideo")}
              </Button>
              <div className="flex justify-center items-center gap-1 mb-3 h-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-2 bg-orange-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i*0.1}s` }}></div>
                ))}
              </div>
              <Button variant="outline" className="w-full h-12 border-2 border-orange-200 text-orange-700 bg-white font-bold rounded-xl text-[16px]">
                <MessageSquare className="w-5 h-5 mr-2" />
                {t("sendSMS")}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 py-3 rounded-2xl font-bold text-[16px]">
              <CheckCircle2 className="w-5 h-5" />
              {t("queuedSync")} ✓
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full h-[56px] text-[18px] font-bold rounded-2xl bg-primary text-white" 
                onClick={() => {
                  if (triageResult.level === "normal") setLocation("/queue");
                  else setLocation("/referrals");
                }}
              >
                {triageResult.level === "normal" ? "Maliza (Done)" : t("createReferral")}
              </Button>
              <Button variant="outline" className="w-full h-[56px] text-[18px] font-bold rounded-2xl bg-white border-2 border-slate-200" onClick={() => setLocation("/queue")}>
                {t("backQueue")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
