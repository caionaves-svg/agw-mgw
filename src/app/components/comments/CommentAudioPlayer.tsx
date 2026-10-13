import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface CommentAudioPlayerProps {
  /** Duração em segundos */
  duracao: number;
}

const NUM_BARS = 36;

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

// Player compacto de áudio para comentários internos (reprodução simulada,
// como o AudioMessage do chat).
export default function CommentAudioPlayer({ duracao }: CommentAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const total = Math.max(duracao, 1);

  const bars = useMemo(
    () => Array.from({ length: NUM_BARS }, () => Math.random() * 70 + 30),
    [],
  );

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= total) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, total]);

  const progress = elapsed / total;

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setElapsed(((e.clientX - rect.left) / rect.width) * total);
  };

  return (
    <div className="flex items-center gap-2 bg-muted rounded-full pl-1 pr-3 py-1 w-[220px] max-w-full">
      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        className="size-7 shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity"
        title={isPlaying ? "Pausar" : "Ouvir"}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5" fill="currentColor" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
        )}
      </button>

      <div
        className="flex-1 min-w-0 flex items-center gap-[2px] h-6 cursor-pointer"
        onClick={seek}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i / NUM_BARS < progress ? "bg-primary" : "bg-muted-foreground/40"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <span className="text-xs font-mono text-muted-foreground shrink-0">
        {formatTime(isPlaying || elapsed > 0 ? elapsed : total)}
      </span>
    </div>
  );
}
