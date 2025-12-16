"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, ArrowRight, Loader2, AlertCircle,
  UserCircle, Type
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        if (!firstName || !fullName) {
          throw new Error("Preencha nome completo e primeiro nome.");
        }

        // 1) Criar usuário no Auth (pode pedir confirmação via e-mail)
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) throw signUpError;

        // 2) Tentar atualizar a sessão local (pode não existir se email confirmation for exigida)
        await supabase.auth.refreshSession();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        // Se não houver sessão (ex.: precisa confirmar e-mail), NÃO force o upsert.
        if (!user) {
          setMessage("Conta criada. Verifique seu e-mail para confirmar a conta.");
          setLoading(false);
          return;
        }

        // 3) Se houver sessão JWT ativa, tentamos fazer um upsert para completar dados.
        //    Se o RLS bloquear (por exemplo), capturamos e seguimos sem quebrar o fluxo.
        try {
          const { error: dbError } = await supabase.from("users").upsert({
            id: user.id,
            email,
            name: firstName,
            full_name: fullName,
          });

          if (dbError) {
            // Se for erro de RLS ou duplicate, apenas logamos e continuamos.
            const msg = (dbError.message || "").toLowerCase();
            if (msg.includes("row-level security") || msg.includes("duplicate") || dbError.code === "23505") {
              // ignora — o trigger do supabase/auth já cria a linha ou o usuário já existe
              // opcional: console.warn(dbError)
            } else {
              throw dbError;
            }
          }
        } catch (upsertErr: any) {
          // se algo inesperado aconteceu, jogamos erro pra UI
          console.warn("upsert warning:", upsertErr);
          // mas não bloqueamos o fluxo de signup: o usuário já está criado no Auth
        }

        setMessage("Conta criada com sucesso! Entrando...");
        router.push("/dashboard");

      } else {
        // Login normal
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Login realizado!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      // mostra mensagem legível
      const userMsg = err?.message || "Erro inesperado.";
      setMessage(userMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen w-full flex overflow-hidden relative text-white"
    >
      {/* BG */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Left side */}
      <div className="hidden lg:flex w-1/2 items-center justify-center border-r border-white/5 backdrop-blur-sm">
        <div className="text-center px-12 z-10">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent mx-auto mb-8"></div>

          <h2 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-600 bg-clip-text text-transparent leading-tight">
            Faces da <br /> Personalidade
          </h2>

          <div className="w-24 h-1 mx-auto my-6 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

          <p className="text-neutral-400 tracking-[0.4em] text-sm uppercase">
            Estratégia • Evolução • Liderança
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 relative">
        <div className="w-full max-w-md z-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-medium mb-2">
              {isSignUp ? "Criar Conta" : "Bem-vindo."}
            </h1>
            <p className="text-neutral-400">
              {isSignUp ? "Preencha os seus dados." : "Faça login para continuar."}
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-3 rounded text-sm flex items-center gap-2 ${
                message.toLowerCase().includes("erro") ||
                message.toLowerCase().includes("preencha")
                  ? "bg-red-900/10 text-red-400 border border-red-500/20"
                  : "bg-amber-500/10 text-amber-200 border border-amber-500/20"
              }`}
            >
              <AlertCircle size={18} /> {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >

                  {/* Primeiro nome */}
                  <div>
                    <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                      Primeiro Nome
                    </label>
                    <div className="relative">
                      <Type className="absolute left-4 top-4 text-neutral-500" size={18} />
                      <input
                        className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: João"
                      />
                    </div>
                  </div>

                  {/* Nome completo */}
                  <div>
                    <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-4 text-neutral-500" size={18} />
                      <input
                        className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: João da Silva"
                      />
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-neutral-500" size={18} />
                <input
                  className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-neutral-500" size={18} />
                <input
                  className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold rounded-lg flex justify-center items-center gap-3 hover:brightness-105 disabled:opacity-70"
            >
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : (
                  <>
                    {isSignUp ? "Cadastrar" : "Entrar"}
                    <ArrowRight size={18} />
                  </>
                )}
            </button>
          </form>

          {/* Trocar entre login/cadastro */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="text-neutral-500 hover:text-amber-400 text-xs"
            >
              {isSignUp ? "Já tenho conta" : "Criar nova conta"}
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
