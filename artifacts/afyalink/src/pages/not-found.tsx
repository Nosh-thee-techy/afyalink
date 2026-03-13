import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-[250px]">The screen you are looking for doesn't exist or is currently unavailable offline.</p>
      
      <Link href="/queue">
        <Button className="w-full">Return Home</Button>
      </Link>
    </div>
  );
}
