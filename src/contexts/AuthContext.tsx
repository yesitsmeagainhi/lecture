// ──────────────────────────────────────────────────────────
//  src/contexts/AuthContext.tsx
//  Updated to match actual column names from Google Sheets
// ──────────────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

export interface Student {
  number: string;
  password: string;
  name: string;
  course: string;
  batch: string;
  year: string;
  branch: string;
  admissionYear: string;
  pendingFees: string;
  Role: string;      // Capital R as in sheet
  Faculty?: string;  // Capital F as in sheet
  
  /* allow any extra columns */
  [key: string]: any;
}

interface AuthCtx {
  student: Student | null;
  signIn: (u: Student) => void;
  logOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);

  const signIn = (u: Student) => {
    console.log('AuthContext - Signing in:', u);
    setStudent(u);
  };
  
  const logOut = () => {
    console.log('AuthContext - Logging out');
    setStudent(null);
  };

  return (
    <Ctx.Provider value={{ student, signIn, logOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be within <AuthProvider>');
  return ctx;
};