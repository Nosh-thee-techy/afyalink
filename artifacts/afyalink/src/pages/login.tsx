import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Login() {
  const { login } = useAuth();
  const { t, changeLanguage, lang } = useI18n();
  const [chpId, setChpId] = useState("");
  const [isCaregiver, setIsCaregiver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chpId.trim().length > 3) {
      login(chpId.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 overflow-y-auto">
      {/* Top App Bar area */}
      <div className="bg-primary px-6 pt-12 pb-24 text-white rounded-b-[2.5rem] shadow-md">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-display font-bold leading-tight max-w-[200px]">
            {t("welcome")}
          </h1>
          <span className="text-4xl" role="img" aria-label="Kenya">🇰🇪</span>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-16 pb-8">
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit} 
          className="w-full"
        >
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-primary/20 space-y-6">
            <div className="space-y-3">
              <label className="text-[18px] font-bold text-slate-800">{t("chpId")}</label>
              <Input 
                placeholder="e.g. CHP-KE-001" 
                value={chpId}
                onChange={(e) => setChpId(e.target.value)}
                className="h-16 text-[20px] font-medium border-slate-200 bg-slate-50 focus-visible:ring-primary focus-visible:border-primary px-4 rounded-2xl"
                required
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="text-[16px] font-bold text-slate-700 cursor-pointer select-none" htmlFor="caregiver-mode">
                {t("caregiversMode")}
              </label>
              <Switch 
                id="caregiver-mode" 
                checked={isCaregiver} 
                onCheckedChange={setIsCaregiver}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-[56px] text-[18px] font-bold rounded-2xl shadow-md bg-primary hover:bg-primary/90 text-white"
              disabled={chpId.length < 4}
            >
              {t("ingia")}
            </Button>

            <div className="text-center pt-2">
              <p className="text-slate-500 text-sm italic">
                {t("noInternet")}
              </p>
            </div>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <button className="text-[#E30613] font-bold text-[16px] underline underline-offset-4">
            {t("emergency_login")}
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-3 flex-wrap"
        >
          <LangBtn current={lang} code="sw" label="🇰🇪 SWA" onClick={changeLanguage} />
          <LangBtn current={lang} code="en" label="🇬🇧 EN" onClick={changeLanguage} />
          <LangBtn current={lang} code="so" label="🇸🇴 SOM" onClick={changeLanguage} />
          <LangBtn current={lang} code="ar" label="🇸🇦 AR" onClick={changeLanguage} />
        </motion.div>
      </div>
    </div>
  );
}

function LangBtn({ current, code, label, onClick }: { current: string, code: any, label: string, onClick: (c: any) => void }) {
  const active = current === code;
  return (
    <button 
      type="button"
      onClick={() => onClick(code)}
      className={`px-4 py-3 rounded-2xl text-[16px] font-bold transition-all border-2 ${
        active 
        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
