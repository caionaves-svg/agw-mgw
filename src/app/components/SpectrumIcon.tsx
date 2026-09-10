interface SpectrumIconProps {
  size?: number;
  color?: string;
}

export default function SpectrumIcon({
  size = 8,
  color = "var(--color-primary-500)", // Usando escala semântica exposta no @theme
}: SpectrumIconProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Centro sólido */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          backgroundColor: color,
        }}
      />

      {/* Primeira onda */}
      <div
        className="absolute rounded-full border-2 animate-ping"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderColor: color,
          animationDuration: "2s",
          animationDelay: "0s",
        }}
      />

      {/* Segunda onda */}
      <div
        className="absolute rounded-full border-2 animate-ping"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          borderColor: color,
          opacity: 0.6,
          animationDuration: "2s",
          animationDelay: "0.3s",
        }}
      />

      {/* Terceira onda */}
      <div
        className="absolute rounded-full border-2 animate-ping"
        style={{
          width: size,
          height: size,
          borderColor: color,
          opacity: 0.3,
          animationDuration: "2s",
          animationDelay: "0.6s",
        }}
      />
    </div>
  );
}