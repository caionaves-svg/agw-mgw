import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type FontSize = "small" | "medium" | "large";

interface PreferencesContextType {
  theme: Theme;
  fontSize: FontSize;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Carregar preferências do localStorage ou usar padrões
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "light";
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem("fontSize");
    return (saved as FontSize) || "medium";
  });

  // Aplicar tema ao documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Função para detectar tema do sistema
    const getSystemTheme = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    // Aplicar tema
    if (theme === "system") {
      const systemTheme = getSystemTheme();
      if (systemTheme === 'dark') {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Aplicar tamanho de fonte ao documento
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "small") {
      root.setAttribute("data-font-size", "small");
    } else if (fontSize === "large") {
      root.setAttribute("data-font-size", "large");
    } else {
      root.removeAttribute("data-font-size");
    }
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        fontSize,
        toggleTheme,
        setTheme,
        setFontSize,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}