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

function Layout() {
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
                <Layout />
              </DataProvider>
            </SidePanelProvider>
          </CallProvider>
        </PermissionsProvider>
      </BrowserRouter>
    </PreferencesProvider>
  );
}
