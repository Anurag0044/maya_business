"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Phone,
} from "lucide-react";
import MayaBrand from "@/components/MayaBrand";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="1" width="9" height="9" fill="#00A4EF" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#00A4EF" />
    </svg>
  );
}

function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/workspace");
    }, 250);
  };

  return (
    <main className="relative min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col justify-between overflow-x-hidden lg:overflow-hidden font-sans select-none bg-[#060709] text-white">
      {/* ========================================================================= */}
      {/* 1. PRISTINE ARCHITECTURAL EXECUTIVE BACKGROUND                            */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/login-bg.jpg"
          alt="MAYA Executive High-Rise Penthouse"
          fill
          priority
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/65 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060709]/85 via-transparent to-black/35 pointer-events-none" />

        {/* Ambient subtle highlight behind card in signature monochrome */}
        <div
          className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full pointer-events-none opacity-20 blur-[100px]"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP HEADER NAVIGATION                                                 */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-14 py-4 sm:py-5 flex items-center justify-between">
        {/* Brand identity linking home cleanly without nested anchor */}
        <MayaBrand href="/" animated={false} />
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN HERO CONTENT & FLOATING GLASS CARD                               */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-2 sm:py-3">
        {/* Left Column: Authentic Editorial Headline (Matching Hero Typography Discipline) */}
        <div className="flex-1 flex flex-col justify-center max-w-lg lg:-translate-y-16 xl:-translate-y-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow: Minimalist Architectural Light Sweep */}
            <div className="mb-3 sm:mb-3.5">
              <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                Operate Business with MΛYΛ
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[clamp(2.15rem,3.4vw,3.65rem)] font-light tracking-[-0.03em] leading-[1.05] text-white space-y-0.5">
              <div>Operate</div>
              <div>Smarter.</div>
              <div className="text-[#8e98ab]">Go Further.</div>
            </h1>
          </motion.div>
        </div>

        {/* Right Column: Sleek, Compact Luxury Glass Card matching main UI discipline */}
        <div className="w-full max-w-[365px] sm:max-w-[375px] relative shrink-0">
          {/* Soft ambient aura behind card */}
          <div
            className="absolute -inset-2 rounded-[32px] pointer-events-none opacity-20 blur-[28px]"
            style={{
              background:
                "radial-gradient(circle at 65% 65%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
            }}
          />

          {/* Frosted Obsidian Glass Card Surface */}
          <div className="relative rounded-[26px] sm:rounded-[28px] p-6 sm:p-7 bg-[#090C12]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_65px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col">
            <AnimatePresence mode="wait" initial={false}>
              {authMode === "signin" ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Card Header Typography with generous luxury spacing */}
                  <div className="mb-5 sm:mb-6">
                    {/* Eyebrow */}
                    <div className="mb-3.5 sm:mb-4">
                      <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                        WELCOME
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-[23px] sm:text-[25px] font-light tracking-[-0.025em] leading-[1.24] sm:leading-[1.26] space-y-1">
                      <div className="text-white">Sign in to</div>
                      <div className="text-[#8e98ab]">MΛYΛ Business.</div>
                    </h2>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2.5 sm:gap-3">
                    {/* Email Input Field */}
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7280] group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        autoComplete="email"
                        className="w-full h-11 pl-10 pr-4 rounded-[14px] bg-[#0b0e16]/80 border border-white/[0.08] text-[13px] text-white placeholder:text-[#556070] focus:outline-none focus:border-white/25 focus:bg-[#0e121d] focus:ring-1 focus:ring-white/10 transition-all duration-200"
                      />
                    </div>

                    {/* Password Input Field */}
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7280] group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoComplete="current-password"
                        className="w-full h-11 pl-10 pr-10 rounded-[14px] bg-[#0b0e16]/80 border border-white/[0.08] text-[13px] text-white placeholder:text-[#556070] focus:outline-none focus:border-white/25 focus:bg-[#0e121d] focus:ring-1 focus:ring-white/10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors p-1 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Keep me signed in & Forgot password row */}
                    <div className="flex items-center justify-between text-[11.5px] px-0.5 pt-0.5">
                      <label className="group flex items-center gap-2 text-[#8e95a5] hover:text-white transition-colors cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={keepSignedIn}
                          onChange={(e) => setKeepSignedIn(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-3.5 h-3.5 rounded-[4px] border transition-all duration-200 flex items-center justify-center ${keepSignedIn
                              ? "bg-[#141a24] border-white/30 text-white shadow-[0_0_8px_rgba(255,255,255,0.06)]"
                              : "bg-[#0b0e16]/80 border-white/15 group-hover:border-white/30"
                            }`}
                        >
                          {keepSignedIn && (
                            <Check className="w-2.5 h-2.5 stroke-[2.6] text-neutral-200" />
                          )}
                        </div>
                        <span>Keep me signed in</span>
                      </label>
                      <a
                        href="#forgot"
                        className="text-[#8e95a5] hover:text-white transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>

                    {/* Primary Action Button (Sign in →) matching main UI discipline */}
                    <button
                      type="submit"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="group relative w-full h-11 rounded-full mt-1.5 bg-white text-black font-medium text-[13px] tracking-tight flex items-center justify-center gap-2 hover:bg-neutral-100 active:scale-[0.99] transition-all duration-200 shadow-[0_2px_14px_rgba(255,255,255,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer disabled:opacity-60 select-none"
                    >
                      <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>

                    {/* Divider: or continue with */}
                    <div className="relative flex items-center justify-center my-2.5">
                      <div className="w-full border-t border-white/[0.07]" />
                      <span className="absolute px-2.5 bg-[#090C12] text-[11px] lowercase text-[#6b7280] font-sans select-none">
                        or continue with
                      </span>
                    </div>

                    {/* Social Login Buttons: Google, Microsoft, Apple */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {/* Google */}
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="h-10 rounded-[12px] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.98] transition-all flex items-center justify-center group cursor-pointer"
                        aria-label="Continue with Google"
                      >
                        <GoogleIcon className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
                      </button>

                      {/* Microsoft */}
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="h-10 rounded-[12px] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.98] transition-all flex items-center justify-center group cursor-pointer"
                        aria-label="Continue with Microsoft"
                      >
                        <MicrosoftIcon className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
                      </button>

                      {/* Apple */}
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        className="h-10 rounded-[12px] bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.98] transition-all flex items-center justify-center group text-white/90 hover:text-white cursor-pointer"
                        aria-label="Continue with Apple"
                      >
                        <AppleIcon className="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
                      </button>
                    </div>

                    {/* Create Account Action */}
                    <div className="mt-3.5 pt-3 border-t border-white/[0.07]">
                      <button
                        type="button"
                        onClick={() => setAuthMode("signup")}
                        className="group relative w-full h-11 px-4 rounded-[14px] bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className="text-[12.5px] font-medium text-white">
                          Create account
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6b7280] group-hover:text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {/* Create Account Header */}
                  <div className="mb-4 sm:mb-5">
                    <div className="mb-2.5 sm:mb-3 flex items-center justify-between">
                      <span className="text-[9.5px] sm:text-[10px] font-medium uppercase tracking-[0.24em] inline-block animate-luxury-shimmer select-none">
                        GET STARTED
                      </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode("signin")}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[#8e95a5] hover:text-white transition-colors cursor-pointer select-none"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Sign in</span>
                      </button>
                    </div>

                    <h2 className="text-[23px] sm:text-[25px] font-light tracking-[-0.025em] leading-[1.24] sm:leading-[1.26] space-y-1">
                      <div className="text-white">Create your</div>
                      <div className="text-[#8e98ab]">MΛYΛ Account.</div>
                    </h2>
                  </div>

                  {/* Create Account Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    {/* Full Name */}
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7280] group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        required
                        autoComplete="name"
                        className="w-full h-10 sm:h-10.5 pl-10 pr-4 rounded-[14px] bg-[#0b0e16]/80 border border-white/[0.08] text-[13px] text-white placeholder:text-[#556070] focus:outline-none focus:border-white/25 focus:bg-[#0e121d] focus:ring-1 focus:ring-white/10 transition-all duration-200"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7280] group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Work email address"
                        required
                        autoComplete="email"
                        className="w-full h-10 sm:h-10.5 pl-10 pr-4 rounded-[14px] bg-[#0b0e16]/80 border border-white/[0.08] text-[13px] text-white placeholder:text-[#556070] focus:outline-none focus:border-white/25 focus:bg-[#0e121d] focus:ring-1 focus:ring-white/10 transition-all duration-200"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7280] group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        required
                        autoComplete="tel"
                        className="w-full h-10 sm:h-10.5 pl-10 pr-4 rounded-[14px] bg-[#0b0e16]/80 border border-white/[0.08] text-[13px] text-white placeholder:text-[#556070] focus:outline-none focus:border-white/25 focus:bg-[#0e121d] focus:ring-1 focus:ring-white/10 transition-all duration-200"
                      />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6b7280] group-focus-within:text-white transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        required
                        autoComplete="new-password"
                        className="w-full h-10 sm:h-10.5 pl-10 pr-10 rounded-[14px] bg-[#0b0e16]/80 border border-white/[0.08] text-[13px] text-white placeholder:text-[#556070] focus:outline-none focus:border-white/25 focus:bg-[#0e121d] focus:ring-1 focus:ring-white/10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors p-1 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Terms Note */}
                    <p className="text-[10px] text-[#6b7280] px-0.5 leading-relaxed">
                      By registering, you agree to our{" "}
                      <a
                        href="#terms"
                        className="text-[#8e95a5] hover:text-white transition-colors underline underline-offset-2"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href="#privacy"
                        className="text-[#8e95a5] hover:text-white transition-colors underline underline-offset-2"
                      >
                        Privacy Policy
                      </a>.
                    </p>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="group relative w-full h-10 sm:h-11 rounded-full mt-1 bg-white text-black font-medium text-[13px] tracking-tight flex items-center justify-center gap-2 hover:bg-neutral-100 active:scale-[0.99] transition-all duration-200 shadow-[0_2px_14px_rgba(255,255,255,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer disabled:opacity-60 select-none"
                    >
                      <span>{isSubmitting ? "Creating account..." : "Create Account"}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>

                    {/* Switch back to Sign in */}
                    <div className="pt-1.5 text-center text-[11px] text-[#8e95a5]">
                      <span>Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => setAuthMode("signin")}
                        className="text-white hover:underline underline-offset-2 transition-colors font-medium cursor-pointer"
                      >
                        Sign in
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EDITORIAL FOOTER NAVIGATION & CAPTION                                  */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full px-6 sm:px-10 lg:px-14 py-4 sm:py-5 flex items-center justify-between text-[9.5px] sm:text-[10px] font-mono tracking-[0.24em] uppercase select-none">
        {/* Bottom-Left Architectural Caption with Crisp Editorial Visibility */}
        <div className="flex flex-col gap-0.5 leading-relaxed text-neutral-300/90 font-medium">
          <span>BUILT FOR</span>
          <span>A BIGGER TOMORROW.</span>
        </div>
      </footer>
    </main>
  );
}
