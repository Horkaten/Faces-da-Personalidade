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

        // 1) Criar usuário no Auth enviando metadados (ESSENCIAL PARA O TRIGGER)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: firstName,
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Se o email confirmation estiver ATIVO, ele não terá sessão agora
        if (signUpData.user && !signUpData.session) {
          setMessage("Conta criada! Verifique seu e-mail para confirmar a conta antes de entrar.");
          setLoading(false);
          return;
        }

        // 2) Se o email confirmation estiver DESATIVADO, ele loga direto
        const user = signUpData.user;
        if (user) {
          // Fazemos um upsert manual apenas para garantir, caso o Trigger do banco falhe
          await supabase.from("users").upsert({
            id: user.id,
            email: email,
            name: firstName,
            full_name: fullName,
          });

          setMessage("Bem-vindo! Entrando...");
          router.push("/dashboard");
        }

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
      const userMsg = err?.message || "Erro inesperado.";
      setMessage(userMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen w-full flex overflow-hidden relative text-white bg-black"
    >
      {/* BG DE FUNDO */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Lado Esquerdo (Desktop) */}
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

      {/* Lado Direito (Formulário) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 relative">
        <div className="w-full max-w-md z-10">

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
              className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${
                message.toLowerCase().includes("erro") || message.toLowerCase().includes("preencha")
                  ? "bg-red-900/20 text-red-400 border border-red-500/20"
                  : "bg-amber-500/10 text-amber-200 border border-amber-500/20"
              }`}
            >
              <AlertCircle size={18} /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">Primeiro Nome</label>
                    <div className="relative mt-2">
                      <Type className="absolute left-4 top-4 text-neutral-500" size={18} />
                      <input
                        className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: João"
                        required={isSignUp}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative mt-2">
                      <UserCircle className="absolute left-4 top-4 text-neutral-500" size={18} />
                      <input
                        className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-4 text-neutral-500" size={18} />
                <input
                  className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-amber-500/70 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-4 text-neutral-500" size={18} />
                <input
                  className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl py-4 pl-12 pr-4 focus:border-amber-500/50 outline-none transition-all"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black uppercase tracking-widest rounded-xl flex justify-center items-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>{isSignUp ? "Cadastrar" : "Entrar"} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="text-neutral-500 hover:text-amber-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              {isSignUp ? "Já tenho conta • Entrar" : "Não tem conta? • Cadastrar-se"}
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}