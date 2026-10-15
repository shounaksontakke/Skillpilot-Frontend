"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Role, Session } from "@/lib/types";

const STORAGE_KEY = "skillpilot.session.v1";
const CHANGE_EVENT = "skillpilot:session-change";
type Listener = () => void;
const listeners = new Set<Listener>();

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "token" in parsed &&
      typeof parsed.token === "string" &&
      "email" in parsed &&
      typeof parsed.email === "string" &&
      "role" in parsed &&
      (parsed.role === "ADMIN" || parsed.role === "STUDENT")
    ) {
      return { token: parsed.token, email: parsed.email, role: parsed.role as Role };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

function notifySessionChange(): void {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

interface AuthContextValue {
  session: Session | null;
  setSession: (session: Session) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, readSession, () => null);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession: (nextSession) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        notifySessionChange();
      },
      signOut: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        notifySessionChange();
      },
    }),
    [session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function getEmailFromToken(token: string): string {
  try {
    const payload = token.split(".")[1];
    if (!payload) return "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized)) as { sub?: unknown };
    return typeof decoded.sub === "string" ? decoded.sub : "";
  } catch {
    return "";
  }
}
