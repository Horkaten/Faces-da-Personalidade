"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { 
  User, Mail, ArrowLeft, Camera, Save, Loader2, 
  CheckCircle2, Fingerprint, ShieldAlert, KeyRound, Lock, Eye, EyeOff, AlertCircle
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState<any>({
    id: "",
    full_name: "",
    name: "",
    email: "",
    role: "",
    created_at: "",
    avatar_url: ""
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) { router.push("/login"); return; }
      const userId = sessionData.session.user.id;

      const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || "",
          name: data.name || "",
          email: data.email || "",
          role: data.role || "Estrategista",
          created_at: data.created_at || "",
          avatar_url: data.avatar_url || ""
        });
      }
      setLoading(false);
    }
    getProfile();
  }, [router]);

  // UPLOAD DE FOTO
  async function handleUploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}-${Date.now()}.${fileExt}`;

      const { error: storageErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (storageErr) throw storageErr;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: dbErr } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', uid);

      if (dbErr) throw dbErr;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      alert("Identidade visual sincronizada!");
    } catch (err: any) {
      alert("Erro ao salvar foto: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // ATUALIZAR NOME
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("users").update({
      full_name: profile.full_name,
      name: profile.name,
    }).eq("id", profile.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  // ATUALIZAR SENHA
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setPassSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(false), 3000);
    } else {
      alert(error.message);
    }
    setChangingPassword(false);
  }

  const passwordsMatch = newPassword === confirmPassword;
  const isPasswordValid = newPassword.length >= 6;
  const canSubmitPassword = passwordsMatch && isPasswordValid && newPassword !== "";

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-amber-500">
      <Loader2 className="animate-spin h-10 w-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-amber-500/[0.03] rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 relative z-10">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-amber-500 transition-all mb-6 group uppercase text-[10px] font-black tracking-[0.3em]">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retornar
            </button>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
              Meu <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Perfil</span>
            </h1>
          </div>
          
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] px-6 py-4 flex items-center gap-4 backdrop-blur-md">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Fingerprint size={20} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operação</p>
              <p className="text-sm font-bold text-white uppercase">{profile.role}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* LADO ESQUERDO: CARD DE FOTO */}
          <div className="xl:col-span-3 space-y-8">
            <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 text-center shadow-2xl relative group">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="w-full h-full rounded-[35px] bg-neutral-800 border border-white/10 overflow-hidden flex items-center justify-center text-amber-500 group-hover:border-amber-500/40 transition-all duration-500 shadow-2xl relative">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={56} strokeWidth={1} />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="animate-spin text-amber-500" />
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadPhoto} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-[-4px] right-[-4px] p-3 rounded-2xl bg-amber-500 text-black shadow-xl hover:bg-amber-400 hover:scale-110 transition-all border-2 border-black"
                >
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-1">{profile.full_name || "Operador"}</h2>
              <p className="text-amber-500/50 font-mono text-[10px] tracking-widest mb-8 uppercase">ID: {profile.id.slice(0,8)}</p>
            </div>

            <div className="bg-neutral-900/20 border border-white/5 rounded-[30px] p-8 flex items-start gap-4">
              <ShieldAlert className="text-gray-700 shrink-0" size={20} />
              <p className="text-[10px] text-gray-600 leading-relaxed uppercase font-bold tracking-tight">Os dados são protegidos por criptografia de ponta.</p>
            </div>
          </div>

          <div className="xl:col-span-9 space-y-10">
            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div className="bg-neutral-900/30 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10 flex items-center gap-3">
                <User size={14} className="text-amber-500" /> Identificação
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Nome Completo</label>
                    <input value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-[18px] px-6 py-4 text-sm text-white focus:border-amber-500/40 outline-none transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Codinome</label>
                    <input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-[18px] px-6 py-4 text-sm text-white focus:border-amber-500/40 outline-none transition-all" />
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <button type="submit" disabled={saving} className="px-8 py-3.5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-[15px] hover:bg-amber-500 transition-all flex items-center gap-2 active:scale-95">
                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Salvar Identidade
                  </button>
                  {success && <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14}/> Sincronizado</span>}
                </div>
              </form>
            </div>

            {/* SEÇÃO 2: SEGURANÇA (SENHA) */}
            <div className="bg-neutral-900/30 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10 flex items-center gap-3">
                <KeyRound size={14} className="text-amber-500" /> Segurança
              </h3>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Nova Senha</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full bg-black/40 border rounded-[18px] px-6 py-4 text-sm text-white outline-none transition-all ${newPassword && !isPasswordValid ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/40'}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Confirmar</label>
                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-black/40 border rounded-[18px] px-6 py-4 text-sm text-white outline-none transition-all ${confirmPassword && !passwordsMatch ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/40'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <button type="submit" disabled={changingPassword || !canSubmitPassword} className={`px-8 py-3.5 font-black text-[10px] uppercase tracking-[0.2em] rounded-[15px] border transition-all flex items-center gap-2 ${canSubmitPassword ? 'bg-neutral-800 text-white border-white/5 hover:border-red-500/50' : 'bg-neutral-900 text-gray-600 opacity-50 cursor-not-allowed'}`}>
                    {changingPassword ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />} Atualizar Senha
                  </button>
                  {passSuccess && <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14}/> Credencial Alterada</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}