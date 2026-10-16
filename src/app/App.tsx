import type { CSSProperties } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router";
import AppHeader from "./components/AppHeader";
import AtendimentosPage from "./pages/AtendimentosPage";
import GerenciamentoPage from "./pages/GerenciamentoPage";
import CasosManagementPage from "./pages/CasosManagementPage";
import { DataProvider } from "./contexts/DataContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { CallProvider } from "./contexts/CallContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { SidePanelProvider } from "./contexts/SidePanelContext";
import GlobalRightPanel from "./components/GlobalRightPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";
import { CollabProvider } from "./contexts/CollabContext";
import CollabPanel from "./components/collab/CollabPanel";
import { usePreferences } from "./contexts/PreferencesContext";

function Layout() {
  const { theme } = usePreferences();
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {/* Navbar no topo */}
      <AppHeader />

      {/* Container principal - flex row para o painel empurrar o conteúdo */}
      <div className="flex-1 flex overflow-hidden gap-0">
        {/* Área principal com roteamento */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/atendimentos" replace />}
            />
            <Route
              path="/atendimentos"
              element={
                <ProtectedRoute
                  module="atendimentos"
                  action="view"
                >
                  <AtendimentosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gerenciamento"
              element={
                <ProtectedRoute module="casos" action="view">
                  <GerenciamentoPage />
                </ProtectedRoute>
              }
            />
            <Route path="/management/cases" element={<CasosManagementPage />} />
            <Route
              path="*"
              element={<Navigate to="/atendimentos" replace />}
            />
          </Routes>
        </div>

        {/* Painel Global - agora dentro do flex, empurra o conteúdo */}
        <GlobalRightPanel />
      </div>

      {/* cVortex Collab - menções e conversas diretas */}
      <CollabPanel />
      <Toaster
        position="bottom-left"
        offset={24}
        theme={theme === "dark" ? "dark" : theme === "light" ? "light" : "system"}
        expand={false}
        style={{ "--width": "400px" } as CSSProperties}
      />
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <PermissionsProvider>
          <CallProvider>
            <SidePanelProvider>
              <DataProvider>
                <CollabProvider>
                  <Layout />
                </CollabProvider>
              </DataProvider>
            </SidePanelProvider>
          </CallProvider>
        </PermissionsProvider>
      </BrowserRouter>
    </PreferencesProvider>
  );
}
