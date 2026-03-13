import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Stethoscope, FileOutput, LayoutDashboard, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export function MobileContainer({ children }: { children: React.ReactNode }) {
  const { chpId } = useAuth();
  const { t, changeLanguage, lang } = useI18n();
  const [location] = useLocation();

  if (location === "/login" || location === "/splash" || location === "/") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-[480px] h-screen sm:h-[90vh] bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative sm:border-[8px] sm:border-zinc-800">
          {children}
        </div>
      </div>
    );
  }

  let title = "AfyaLink";
  if (location === "/queue") title = t("queue");
  if (location.startsWith("/triage")) title = t("triage");
  if (location === "/referrals") title = t("referrals");
  if (location === "/dashboard") title = t("dashboard");
  if (location === "/settings") title = t("settings");

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-[480px] h-screen sm:h-[90vh] bg-slate-50 sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative sm:border-[8px] sm:border-zinc-800 flex flex-col">
        
        {/* Header bar */}
        <header className="bg-white px-4 pt-4 pb-3 flex flex-col gap-3 shadow-sm z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center p-1">
                <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-display font-bold text-[20px] text-slate-800 truncate max-w-[160px]">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={lang}
                onChange={(e) => changeLanguage(e.target.value as any)}
                className="bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border-0 py-1.5 px-2 focus:ring-primary cursor-pointer"
              >
                <option value="sw">SWA</option>
                <option value="en">ENG</option>
                <option value="so">SOM</option>
                <option value="ar">AR</option>
              </select>
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {chpId?.substring(0, 2) || "CH"}
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 w-fit">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-bold text-green-800">
              ✓ Inafanya kazi bila mtandao
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
          <div className="p-4 min-h-full flex flex-col">
            {children}
            <div className="mt-auto pt-8 pb-4 text-center">
              <p className="text-[10px] text-slate-400 font-medium">© CHPs Kenya</p>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-between items-center pb-safe z-20">
          <NavItem href="/queue" icon={<Home />} label="Home" active={location === "/queue"} />
          <NavItem href="/triage/new" icon={<Stethoscope />} label="Triage" active={location.startsWith("/triage")} />
          <NavItem href="/referrals" icon={<FileOutput />} label="Referrals" active={location === "/referrals"} />
          <NavItem href="/dashboard" icon={<LayoutDashboard />} label="Reports" active={location === "/dashboard"} />
          <NavItem href="/settings" icon={<SettingsIcon />} label="Settings" active={location === "/settings"} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center justify-center w-16 gap-1 transition-all duration-200",
      active ? "text-primary" : "text-slate-400 hover:text-slate-600"
    )}>
      <div className={cn("p-1.5 rounded-xl transition-colors", active ? "bg-primary/10" : "")}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 stroke-[2]" })}
      </div>
      <span className={cn("text-[11px] font-semibold tracking-wide", active && "text-primary font-bold")}>{label}</span>
    </Link>
  );
}
