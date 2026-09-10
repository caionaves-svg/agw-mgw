import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { LayoutDashboard, MessageSquare, Users, Radio, Target } from "lucide-react";
import { GerenciamentoOverview } from "../components/gerenciamento/GerenciamentoOverview";
import { GerenciamentoAtendimentos } from "../components/gerenciamento/GerenciamentoAtendimentos";
import { GerenciamentoAtendentes } from "../components/gerenciamento/GerenciamentoAtendentes";
import { GerenciamentoCanais } from "../components/gerenciamento/GerenciamentoCanais";
import { GerenciamentoSLA } from "../components/gerenciamento/GerenciamentoSLA";
import { Text } from "../components/ui/text";

export default function GerenciamentoPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground" style={{ fontSize: "var(--text-2xl)" }}>
              Gerenciamento
            </h1>
            <Text variant="sm" className="text-muted-foreground mt-1">
              Centro de controle operacional e monitoramento
            </Text>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-border px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-none h-12 p-0 gap-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none bg-transparent px-4 py-3"
            >
              <LayoutDashboard className="w-4 h-4" />
              <Text variant="sm" className="font-medium">
                Overview
              </Text>
            </TabsTrigger>

            <TabsTrigger
              value="atendimentos"
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none bg-transparent px-4 py-3"
            >
              <MessageSquare className="w-4 h-4" />
              <Text variant="sm" className="font-medium">
                Atendimentos
              </Text>
            </TabsTrigger>

            <TabsTrigger
              value="atendentes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none bg-transparent px-4 py-3"
            >
              <Users className="w-4 h-4" />
              <Text variant="sm" className="font-medium">
                Atendentes
              </Text>
            </TabsTrigger>

            <TabsTrigger
              value="canais"
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none bg-transparent px-4 py-3"
            >
              <Radio className="w-4 h-4" />
              <Text variant="sm" className="font-medium">
                Canais
              </Text>
            </TabsTrigger>

            <TabsTrigger
              value="sla"
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-primary rounded-none bg-transparent px-4 py-3"
            >
              <Target className="w-4 h-4" />
              <Text variant="sm" className="font-medium">
                SLA e Metas
              </Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="mt-0">
            <GerenciamentoOverview />
          </TabsContent>

          <TabsContent value="atendimentos" className="mt-0">
            <GerenciamentoAtendimentos />
          </TabsContent>

          <TabsContent value="atendentes" className="mt-0">
            <GerenciamentoAtendentes />
          </TabsContent>

          <TabsContent value="canais" className="mt-0">
            <GerenciamentoCanais />
          </TabsContent>

          <TabsContent value="sla" className="mt-0">
            <GerenciamentoSLA />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
