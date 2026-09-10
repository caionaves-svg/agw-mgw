import { Button } from "./ui/button";
import { X, LayoutGrid, Mail, Calendar, FileText, MessageSquare } from "lucide-react";
import { useSidePanel } from "../contexts/SidePanelContext";

export default function AppsPanel() {
  const { closePanel } = useSidePanel();

  const apps = [
    { name: "Email", icon: Mail, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Agenda", icon: Calendar, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Notas", icon: FileText, color: "text-yellow-500", bg: "bg-yellow-50" },
    { name: "Chat", icon: MessageSquare, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="bg-white border border-border rounded-[8px] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="py-3 px-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-[16px]">Aplicativos</span>
        </div>
        <Button variant="ghost" size="sm" onClick={closePanel} className="h-6 w-6 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {apps.map((app, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-2 aspect-square"
            >
              <div className={`p-3 rounded-full ${app.bg}`}>
                <app.icon className={`w-6 h-6 ${app.color}`} />
              </div>
              <span className="text-sm font-medium text-foreground">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}