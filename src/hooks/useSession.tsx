import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface Operator {
  operatorId: string;
  role: string;
  sessionId: string;
  authenticatedAt: number;
}

interface SessionContextValue {
  operator: Operator | null;
  signIn: (operatorId: string, role: string) => Operator;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null);

  const signIn = useCallback((operatorId: string, role: string) => {
    const next: Operator = {
      operatorId: operatorId || "RESCUE-OPS-01",
      role,
      sessionId: `SES-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      authenticatedAt: Date.now(),
    };
    setOperator(next);
    return next;
  }, []);

  const signOut = useCallback(() => setOperator(null), []);

  const value = useMemo(() => ({ operator, signIn, signOut }), [operator, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
