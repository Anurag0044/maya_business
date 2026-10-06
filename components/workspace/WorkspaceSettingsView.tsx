"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Key,
  Building2,
  Bot,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ApiKeyItem, ApiKeyStatus } from "./types";

interface WorkspaceSettingsViewProps {
  onBack: () => void;
}

const DEFAULT_API_KEYS: ApiKeyItem[] = [
  {
    id: "key-1",
    name: "Production Voice Agent",
    prefix: "maya_live_",
    maskedKey: "maya_live_••••••••81f4",
    status: "active",
    createdAt: "Sep 14, 2025",
    lastUsed: "12m ago",
    scope: "full",
    expiresAt: "Never",
  },
  {
    id: "key-2",
    name: "Twilio Telephony Dispatch",
    prefix: "maya_live_",
    maskedKey: "maya_live_••••••••39d2",
    status: "active",
    createdAt: "Aug 28, 2025",
    lastUsed: "2h ago",
    scope: "webhooks",
    expiresAt: "90 days",
  },
  {
    id: "key-3",
    name: "BI Read Analytics Client",
    prefix: "maya_live_",
    maskedKey: "maya_live_••••••••04a9",
    status: "revoked",
    createdAt: "Jul 10, 2025",
    lastUsed: "14d ago",
    scope: "read",
    expiresAt: "30 days",
  },
];

export default function WorkspaceSettingsView({ onBack }: WorkspaceSettingsViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeSubTab, setActiveSubTab] = useState<"keys" | "profile" | "voice">("keys");
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(DEFAULT_API_KEYS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [keyName, setKeyName] = useState("");
  const [keyScope, setKeyScope] = useState<"full" | "read" | "webhooks">("full");
  const [keyExpiration, setKeyExpiration] = useState<"30 days" | "90 days" | "Never">("Never");
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Business Profile Form State
  const [businessName, setBusinessName] = useState("MAYA Healthcare & Education Services");
  const [receptionPhone, setReceptionPhone] = useState("+1 (800) 555-MAYA");
  const [fallbackPhone, setFallbackPhone] = useState("+1 (555) 019-2834");
  const [operatingHours, setOperatingHours] = useState("Mon - Fri: 8:00 AM - 7:00 PM EST");
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  // Voice Persona State
  const [voicePersona, setVoicePersona] = useState("maya-executive");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceGreeting, setVoiceGreeting] = useState(
    "Good day! Thank you for calling MAYA Business. My name is Maya. How may I assist your inquiry today?"
  );
  const [saveVoiceSuccess, setSaveVoiceSuccess] = useState(false);

  // Load persisted keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("maya_custom_api_keys");
      if (stored) {
        setApiKeys(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveKeysToStorage = (updated: ApiKeyItem[]) => {
    setApiKeys(updated);
    try {
      localStorage.setItem("maya_custom_api_keys", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleOpenCreateModal = () => {
    setKeyName("");
    setKeyScope("full");
    setKeyExpiration("Never");
    setNewlyGeneratedKey("");
    setIsCopied(false);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleGenerateKey = () => {
    if (!keyName.trim()) return;

    // Generate cryptographically secure key string
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const randomHex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const generated = `maya_live_sk_${randomHex}`;
    const lastFour = generated.slice(-4);
    const masked = `maya_live_••••••••${lastFour}`;

    const newKeyItem: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: keyName.trim(),
      prefix: "maya_live_",
      maskedKey: masked,
      status: "active",
      createdAt: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
      lastUsed: "Just now",
      scope: keyScope,
      expiresAt: keyExpiration,
    };

    setNewlyGeneratedKey(generated);
    setModalStep(2);

    const updated = [newKeyItem, ...apiKeys];
    saveKeysToStorage(updated);
  };

  const handleCopySecret = async (secret: string, keyId?: string) => {
    try {
      await navigator.clipboard.writeText(secret);
      if (keyId) {
        setCopiedId(keyId);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleRevokeKey = (id: string) => {
    const updated = apiKeys.map((k) =>
      k.id === id ? { ...k, status: "revoked" as ApiKeyStatus } : k
    );
    saveKeysToStorage(updated);
  };

  const handleDeleteKey = (id: string) => {
    const updated = apiKeys.filter((k) => k.id !== id);
    saveKeysToStorage(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveProfileSuccess(true);
    setTimeout(() => setSaveProfileSuccess(false), 2400);
  };

  const handleSaveVoice = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveVoiceSuccess(true);
    setTimeout(() => setSaveVoiceSuccess(false), 2400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 h-full flex flex-col justify-between gap-3.5 overflow-hidden min-h-0 select-none"
    >
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-4 shrink-0 pb-1">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`h-8.5 w-8.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "bg-white/[0.04] border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs"
            }`}
            title="Back to Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
          </motion.button>

          <div>
            <h1
              className={`text-[21px] sm:text-[23px] font-light tracking-[-0.03em] leading-tight ${
                isDark ? "text-white" : "text-[#0B0F17]"
              }`}
            >
              Workspace Settings
            </h1>
            <p
              className={`text-[12px] sm:text-[12.5px] font-normal leading-normal mt-0.5 ${
                isDark ? "text-[#9ca3af]" : "text-[#64748B]"
              }`}
            >
              Manage system authentication, AI voice parameters, and reception profile.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation Pills */}
        <div
          className={`flex items-center p-1 rounded-xl border text-[12px] font-medium shrink-0 ${
            isDark
              ? "bg-[#0b0e16]/80 border-white/[0.08]"
              : "bg-slate-100/90 border-[#E2E8F0]"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveSubTab("keys")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "keys"
                ? isDark
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-white text-[#0B0F17] font-semibold shadow-xs"
                : isDark
                ? "text-[#8a929f] hover:text-white"
                : "text-[#64748B] hover:text-slate-900"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("profile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "profile"
                ? isDark
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-white text-[#0B0F17] font-semibold shadow-xs"
                : isDark
                ? "text-[#8a929f] hover:text-white"
                : "text-[#64748B] hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("voice")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "voice"
                ? isDark
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-white text-[#0B0F17] font-semibold shadow-xs"
                : isDark
                ? "text-[#8a929f] hover:text-white"
                : "text-[#64748B] hover:text-slate-900"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Voice Agent</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Card */}
      <div
        className={`flex-1 min-h-0 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative ${
          isDark
            ? "bg-gradient-to-b from-[#111724]/95 via-[#0c101a]/95 to-[#080b12]/98 border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_8px_24px_-6px_rgba(0,0,0,0.55)]"
            : "bg-gradient-to-b from-white via-white to-[#F8FAFC] border-slate-200/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),0_4px_16px_rgba(15,23,42,0.05)]"
        }`}
      >
        <AnimatePresence mode="wait">
          {activeSubTab === "keys" && (
            <motion.div
              key="keys-subtab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 overflow-hidden"
            >
              {/* API Keys Header Banner */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b shrink-0 ${
                  isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
                }`}
              >
                <div>
                  <h3
                    className={`text-[14px] font-medium tracking-tight ${
                      isDark ? "text-white" : "text-[#0B0F17]"
                    }`}
                  >
                    API Keys & Credentials
                  </h3>
                  <p
                    className={`text-[11.5px] mt-0.5 leading-relaxed ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Authenticate external integrations, SIP telephone systems, and automation pipelines.
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={handleOpenCreateModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
                    isDark
                      ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                      : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Create New Key</span>
                </motion.button>
              </div>

              {/* API Keys Table */}
              <div className="flex-1 min-h-0 overflow-y-auto mt-2 pr-1">
                {apiKeys.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <Key className="w-9 h-9 stroke-[1.2] opacity-30 mb-2" />
                    <h4 className="text-[13px] font-medium">No API keys created yet</h4>
                    <p
                      className={`text-[11.5px] max-w-sm mt-1 ${
                        isDark ? "text-[#717682]" : "text-[#94A3B8]"
                      }`}
                    >
                      Generate a key to securely interface with your automated MAYA front-desk APIs.
                    </p>
                  </div>
                ) : (
                  <div className={`divide-y ${isDark ? "divide-white/[0.05]" : "divide-slate-100"}`}>
                    {/* Table Header Row */}
                    <div
                      className={`grid grid-cols-12 py-2 px-2 text-[9.5px] font-medium uppercase tracking-[0.16em] select-none shrink-0 ${
                        isDark ? "text-[#717682]" : "text-[#94A3B8]"
                      }`}
                    >
                      <div className="col-span-4">Name</div>
                      <div className="col-span-3">Key Token</div>
                      <div className="col-span-2">Scope</div>
                      <div className="col-span-1 text-center">Status</div>
                      <div className="col-span-1 text-right">Last Used</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {/* Table Key Items */}
                    {apiKeys.map((keyItem) => {
                      const isActive = keyItem.status === "active";

                      return (
                        <div
                          key={keyItem.id}
                          className={`grid grid-cols-12 items-center py-2.5 px-2 rounded-xl transition-colors duration-150 ${
                            isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Name + Meta */}
                          <div className="col-span-4 flex items-center gap-2.5 pr-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                isActive
                                  ? isDark
                                    ? "bg-white/[0.06] text-white border-white/[0.1]"
                                    : "bg-slate-100 text-slate-800 border-slate-200"
                                  : isDark
                                  ? "bg-white/[0.02] text-[#556070] border-white/[0.05]"
                                  : "bg-slate-50 text-slate-400 border-slate-200"
                              }`}
                            >
                              <Key className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`text-[12px] font-medium truncate ${
                                  isActive
                                    ? isDark
                                      ? "text-white"
                                      : "text-[#0F172A]"
                                    : isDark
                                    ? "text-[#717682] line-through"
                                    : "text-slate-400 line-through"
                                }`}
                              >
                                {keyItem.name}
                              </span>
                              <span
                                className={`text-[10px] leading-tight ${
                                  isDark ? "text-[#717682]" : "text-[#94A3B8]"
                                }`}
                              >
                                Created {keyItem.createdAt} • Expires {keyItem.expiresAt}
                              </span>
                            </div>
                          </div>

                          {/* Key Masked Token */}
                          <div className="col-span-3 flex items-center gap-1.5 font-mono text-[11px]">
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10.5px] ${
                                isDark
                                  ? "bg-black/40 border-white/[0.07] text-[#9ca3af]"
                                  : "bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              {keyItem.maskedKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopySecret(keyItem.maskedKey, keyItem.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isDark
                                  ? "text-[#8a929f] hover:text-white hover:bg-white/[0.06]"
                                  : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                              }`}
                              title="Copy identifier"
                            >
                              {copiedId === keyItem.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Scope Badge */}
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wide uppercase border ${
                                keyItem.scope === "full"
                                  ? isDark
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                  : keyItem.scope === "webhooks"
                                  ? isDark
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                  : isDark
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                                  : "bg-sky-50 text-sky-700 border-sky-200"
                              }`}
                            >
                              {keyItem.scope === "full"
                                ? "Full Access"
                                : keyItem.scope === "webhooks"
                                ? "Webhooks"
                                : "Read Only"}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-1 flex justify-center">
                            {isActive ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium border ${
                                  isDark
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${
                                  isDark
                                    ? "bg-white/[0.04] text-[#717682] border-white/[0.08]"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                Revoked
                              </span>
                            )}
                          </div>

                          {/* Last Used */}
                          <div
                            className={`col-span-1 text-right text-[10.5px] font-mono whitespace-nowrap ${
                              isDark ? "text-[#717682]" : "text-[#94A3B8]"
                            }`}
                          >
                            {keyItem.lastUsed}
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 flex justify-end gap-1">
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleRevokeKey(keyItem.id)}
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  isDark
                                    ? "text-[#8a929f] hover:text-rose-400 hover:bg-rose-500/10"
                                    : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                }`}
                                title="Revoke Key"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteKey(keyItem.id)}
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  isDark
                                    ? "text-[#717682] hover:text-white hover:bg-white/[0.05]"
                                    : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                                }`}
                                title="Delete Key record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSubTab === "profile" && (
            <motion.div
              key="profile-subtab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 overflow-y-auto"
            >
              <div
                className={`pb-3 border-b shrink-0 ${
                  isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
                }`}
              >
                <h3
                  className={`text-[14px] font-medium tracking-tight ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  Business Profile & Operational Identity
                </h3>
                <p
                  className={`text-[11.5px] mt-0.5 ${
                    isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
                >
                  Identity metadata used by MAYA when greeting callers and answering questions.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 flex flex-col gap-4 max-w-xl">
                <div>
                  <label
                    className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-[12.5px] border outline-none transition-colors ${
                      isDark
                        ? "bg-[#0b0e16]/80 border-white/[0.08] text-white focus:border-white/30"
                        : "bg-white border-slate-200 text-[#0B0F17] focus:border-slate-800"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${
                        isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                    >
                      Inbound Reception Line
                    </label>
                    <input
                      type="text"
                      value={receptionPhone}
                      onChange={(e) => setReceptionPhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-[12.5px] border outline-none font-mono ${
                        isDark
                          ? "bg-[#0b0e16]/80 border-white/[0.08] text-white focus:border-white/30"
                          : "bg-white border-slate-200 text-[#0B0F17] focus:border-slate-800"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${
                        isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                    >
                      Emergency Forwarding Line
                    </label>
                    <input
                      type="text"
                      value={fallbackPhone}
                      onChange={(e) => setFallbackPhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-[12.5px] border outline-none font-mono ${
                        isDark
                          ? "bg-[#0b0e16]/80 border-white/[0.08] text-white focus:border-white/30"
                          : "bg-white border-slate-200 text-[#0B0F17] focus:border-slate-800"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Operating Hours Schedule
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-[12.5px] border outline-none ${
                      isDark
                        ? "bg-[#0b0e16]/80 border-white/[0.08] text-white focus:border-white/30"
                        : "bg-white border-slate-200 text-[#0B0F17] focus:border-slate-800"
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-colors cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                        : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                    }`}
                  >
                    Save Business Profile
                  </motion.button>

                  {saveProfileSuccess && (
                    <span className="text-[11.5px] text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Changes saved successfully
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {activeSubTab === "voice" && (
            <motion.div
              key="voice-subtab"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 overflow-y-auto"
            >
              <div
                className={`pb-3 border-b shrink-0 ${
                  isDark ? "border-white/[0.08]" : "border-[#E2E8F0]"
                }`}
              >
                <h3
                  className={`text-[14px] font-medium tracking-tight ${
                    isDark ? "text-white" : "text-[#0B0F17]"
                  }`}
                >
                  MAYA Voice Agent Parameters
                </h3>
                <p
                  className={`text-[11.5px] mt-0.5 ${
                    isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                  }`}
                >
                  Configure acoustic cadence, response timing, and greeting prompts.
                </p>
              </div>

              <form onSubmit={handleSaveVoice} className="mt-4 flex flex-col gap-4 max-w-xl">
                <div>
                  <label
                    className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Acoustic Persona Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVoicePersona("maya-executive")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        voicePersona === "maya-executive"
                          ? isDark
                            ? "bg-white/[0.08] border-white/30 shadow-xs"
                            : "bg-slate-100 border-slate-900 shadow-xs"
                          : isDark
                          ? "bg-white/[0.02] border-white/[0.08] hover:border-white/15"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-[12px] font-medium">Maya Executive</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                      >
                        Warm, poised, articulate (Recommended)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVoicePersona("maya-dynamic")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        voicePersona === "maya-dynamic"
                          ? isDark
                            ? "bg-white/[0.08] border-white/30 shadow-xs"
                            : "bg-slate-100 border-slate-900 shadow-xs"
                          : isDark
                          ? "bg-white/[0.02] border-white/[0.08] hover:border-white/15"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-[12px] font-medium">Maya Dynamic</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                        }`}
                      >
                        Fast-paced, cheerful, conversational
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      className={`text-[11px] font-medium uppercase tracking-[0.1em] ${
                        isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                      }`}
                    >
                      Speech Cadence Speed
                    </label>
                    <span className="font-mono text-[11.5px]">{voiceSpeed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 ${
                      isDark ? "text-[#8e95a5]" : "text-[#64748B]"
                    }`}
                  >
                    Primary Inbound Greeting Script
                  </label>
                  <textarea
                    rows={3}
                    value={voiceGreeting}
                    onChange={(e) => setVoiceGreeting(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-[12px] border outline-none leading-relaxed resize-none ${
                      isDark
                        ? "bg-[#0b0e16]/80 border-white/[0.08] text-white focus:border-white/30"
                        : "bg-white border-slate-200 text-[#0B0F17] focus:border-slate-800"
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-colors cursor-pointer shadow-sm ${
                      isDark
                        ? "bg-white text-[#0B0F17] hover:bg-neutral-100"
                        : "bg-[#0B0F17] text-white hover:bg-[#1E293B]"
                    }`}
                  >
                    Save Voice Parameters
                  </motion.button>

                  {saveVoiceSuccess && (
                    <span className="text-[11.5px] text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Voice settings updated
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Create Key Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-md p-5 rounded-2xl border shadow-2xl overflow-hidden ${
                isDark
                  ? "bg-[#0c101a] border-white/15 text-white shadow-black/80"
                  : "bg-white border-slate-200 text-[#0B0F17] shadow-xl"
              }`}
            >
              {modalStep === 1 ? (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-inherit">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[14px] font-medium">Create New API Key</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3.5">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                        Key Name / Identifier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Production Agent, Twilio SIP"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        autoFocus
                        className={`w-full px-3 py-2 rounded-xl text-[12.5px] border outline-none ${
                          isDark
                            ? "bg-white/[0.04] border-white/10 text-white focus:border-white/30"
                            : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                        Access Scope
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "full", label: "Full Access" },
                          { id: "read", label: "Read Only" },
                          { id: "webhooks", label: "Webhooks" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setKeyScope(item.id as "full" | "read" | "webhooks")}
                            className={`py-1.5 px-2 rounded-lg text-[11.5px] border text-center transition-colors cursor-pointer ${
                              keyScope === item.id
                                ? isDark
                                  ? "bg-white text-black font-medium border-white"
                                  : "bg-[#0B0F17] text-white font-medium border-[#0B0F17]"
                                : isDark
                                ? "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400 mb-1">
                        Expiration
                      </label>
                      <select
                        value={keyExpiration}
                        onChange={(e) => setKeyExpiration(e.target.value as "30 days" | "90 days" | "Never")}
                        className={`w-full px-3 py-2 rounded-xl text-[12px] border outline-none cursor-pointer ${
                          isDark
                            ? "bg-[#0c101a] border-white/10 text-white focus:border-white/30"
                            : "bg-slate-50 border-slate-200 text-[#0B0F17] focus:border-slate-800"
                        }`}
                      >
                        <option value="30 days">30 days</option>
                        <option value="90 days">90 days</option>
                        <option value="Never">Never expire</option>
                      </select>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-inherit">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-3.5 py-1.5 rounded-xl text-[12px] font-medium text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateKey}
                        disabled={!keyName.trim()}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm ${
                          keyName.trim()
                            ? isDark
                              ? "bg-white text-black hover:bg-neutral-100"
                              : "bg-[#0B0F17] text-white hover:bg-slate-800"
                            : "opacity-40 cursor-not-allowed bg-white/[0.1] text-neutral-400"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Generate Key</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-inherit">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-medium">Save Your Secret Key</h3>
                      <p className="text-[11px] text-neutral-400">Created for: {keyName}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {/* Warning Callout */}
                    <div className="p-3 rounded-xl border border-amber-500/25 bg-amber-500/10 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Please copy your secret key now and store it securely. For your safety, you will not be able to view this token again.
                      </p>
                    </div>

                    {/* Secret Token Field */}
                    <div
                      className={`p-3 rounded-xl border font-mono text-[12px] flex items-center justify-between gap-2 break-all ${
                        isDark
                          ? "bg-black/60 border-white/15 text-emerald-400"
                          : "bg-slate-100 border-slate-300 text-emerald-700"
                      }`}
                    >
                      <span className="select-all font-semibold">{newlyGeneratedKey}</span>
                      <motion.button
                        type="button"
                        onClick={() => handleCopySecret(newlyGeneratedKey)}
                        whileTap={{ scale: 0.95 }}
                        className={`p-1.5 rounded-lg border shrink-0 transition-colors cursor-pointer ${
                          isCopied
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : isDark
                            ? "bg-white/10 text-white border-white/15 hover:bg-white/20"
                            : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
                        }`}
                        title="Copy Key"
                      >
                        {isCopied ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </div>
                        )}
                      </motion.button>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className={`w-full py-2 rounded-xl text-[12px] font-medium transition-colors cursor-pointer shadow-sm text-center ${
                          isDark
                            ? "bg-white text-black hover:bg-neutral-100"
                            : "bg-[#0B0F17] text-white hover:bg-slate-800"
                        }`}
                      >
                        I have securely copied this key
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
