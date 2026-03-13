import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, HardDrive, RefreshCw, Info, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { logout, chpId } = useAuth();
  const { t, lang, changeLanguage } = useI18n();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Usawazishaji umekamilika",
        description: "Data zote zimesawazishwa kikamilifu.",
        className: "bg-green-600 text-white border-none"
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Language Section */}
      <section className="space-y-3">
        <h3 className="font-bold text-slate-800 text-[18px] flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          {t("language")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <LangCard code="sw" label="Kiswahili" flag="🇰🇪" current={lang} onClick={changeLanguage} />
          <LangCard code="en" label="English" flag="🇬🇧" current={lang} onClick={changeLanguage} />
          <LangCard code="so" label="Somali" flag="🇸🇴" current={lang} onClick={changeLanguage} />
          <LangCard code="ar" label="Arabic" flag="🇸🇦" current={lang} onClick={changeLanguage} />
        </div>
      </section>

      {/* Storage Section */}
      <section className="space-y-3">
        <h3 className="font-bold text-slate-800 text-[18px] flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          {t("storage")}
        </h3>
        <Card className="p-4 border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] font-semibold text-slate-700">Storage Used</span>
            <span className="text-[14px] font-bold text-slate-500">1.2 GB / 8 GB</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-primary h-3 rounded-full" style={{ width: "15%" }}></div>
          </div>
        </Card>
      </section>

      {/* Sync Section */}
      <section className="space-y-3">
        <Button 
          onClick={handleSync}
          disabled={isSyncing}
          variant="outline"
          className="w-full h-14 text-[18px] font-bold border-2 border-primary text-primary hover:bg-primary/5 rounded-2xl"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {t("syncNow")}
        </Button>
      </section>

      <hr className="border-slate-200" />

      {/* Logout */}
      <section>
        <Button 
          onClick={logout}
          variant="ghost"
          className="w-full h-14 text-[18px] font-bold text-[#E30613] hover:text-[#E30613] hover:bg-red-50 rounded-2xl justify-start px-4"
        >
          <LogOut className="w-6 h-6 mr-3" />
          {t("logout")} ({chpId})
        </Button>
      </section>

      {/* About */}
      <section className="space-y-3 pt-4">
        <h3 className="font-bold text-slate-800 text-[18px] flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-400" />
          {t("about")}
        </h3>
        <Card className="p-4 bg-slate-50 border-slate-200 shadow-sm text-center">
          <h4 className="font-display font-bold text-xl text-slate-800 mb-1">AfyaLink v1.0</h4>
          <p className="text-slate-500 text-sm mb-1">Imejengwa kwa ajili ya Kenya 2026</p>
          <p className="text-slate-400 text-xs">Supported by CHPs</p>
        </Card>
      </section>
    </div>
  );
}

function LangCard({ code, label, flag, current, onClick }: any) {
  const active = current === code;
  return (
    <Card 
      onClick={() => onClick(code)}
      className={`p-3 flex items-center gap-3 cursor-pointer transition-all border-2 ${
        active ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <span className="text-2xl">{flag}</span>
      <span className={`font-bold flex-1 ${active ? 'text-primary' : 'text-slate-700'}`}>{label}</span>
      {active && <Check className="w-5 h-5 text-primary" />}
    </Card>
  );
}
