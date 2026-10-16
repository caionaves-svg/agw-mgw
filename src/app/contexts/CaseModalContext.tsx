import { createContext, useContext, useState, type ReactNode } from "react";
import LegacyCaseModal from "../components/LegacyCaseModal";

interface CaseModalContextType {
  /** Abre a modal "Dados do Caso" (legado) para o caso informado. */
  openCaseModal: (casoId: string, clienteNome?: string) => void;
}

const CaseModalContext = createContext<CaseModalContextType | null>(null);

export function CaseModalProvider({ children }: { children: ReactNode }) {
  const [caso, setCaso] = useState<{ id: string; clienteNome?: string } | null>(null);

  return (
    <CaseModalContext.Provider
      value={{ openCaseModal: (id, clienteNome) => setCaso({ id, clienteNome }) }}
    >
      {children}
      <LegacyCaseModal
        casoId={caso?.id ?? null}
        clienteNome={caso?.clienteNome}
        onClose={() => setCaso(null)}
      />
    </CaseModalContext.Provider>
  );
}

export function useCaseModal() {
  const ctx = useContext(CaseModalContext);
  if (!ctx) throw new Error("useCaseModal deve ser usado dentro de CaseModalProvider");
  return ctx;
}
