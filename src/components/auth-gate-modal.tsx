"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth-provider";
import { CloseIcon } from "./icons";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  message?: string;
}

export function AuthGateModal({ isOpen, onClose, onSuccess, message }: AuthGateModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setError(""); setTab("login");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (tab === "register" && !firstName) { setError("Please enter your first name."); return; }
    if (tab === "login") {
      await login(email, password);
    } else {
      await register({ email, password, firstName, lastName });
    }
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative bg-white max-w-sm w-full p-8 outline-none"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {message && (
          <p className="text-[12px] text-warm-gray text-center mb-5 uppercase tracking-[0.6px]">{message}</p>
        )}

        <div className="flex border-b border-black/10 mb-6">
          {(["login", "register"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-2 text-[11px] font-medium uppercase tracking-[0.8px] transition-colors ${
                tab === t ? "text-charcoal border-b-2 border-charcoal -mb-px" : "text-warm-gray"
              }`}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-[13px] text-center">{error}</p>}

          {tab === "register" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-black/15 rounded px-3 py-2.5 text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-black/15 rounded px-3 py-2.5 text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-black/15 rounded px-3 py-2.5 text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.8px] text-charcoal mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-black/15 rounded px-3 py-2.5 text-[14px] text-charcoal outline-none focus:border-charcoal transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-cta w-full text-[12px] mt-2">
            {tab === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
}
