import { MessagesSquare } from "lucide-react";
import { Button } from "../ui/button";
import { useCollab } from "../../contexts/CollabContext";

// Botão do header que abre o cVortex Collab, com contador de não lidas
export default function CollabButton() {
  const { toggle, isOpen, totalUnread } = useCollab();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      title="cVortex Collab — menções e conversas"
      aria-label={`cVortex Collab${totalUnread ? `, ${totalUnread} não lidas` : ""}`}
      className={`relative h-9 w-9 p-0 ${
        isOpen ? "border-primary text-primary bg-primary/10 hover:bg-primary/15" : ""
      }`}
    >
      <MessagesSquare className="size-4.5" />
      {totalUnread > 0 && (
        <span
          key={totalUnread}
          className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1 animate-in zoom-in duration-200"
        >
          {totalUnread > 9 ? "9+" : totalUnread}
        </span>
      )}
    </Button>
  );
}
