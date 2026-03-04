"use client";
import { Youtube, Instagram, Linkedin, Twitter } from "lucide-react";

const PLATFORM_ICON: Record<string, React.ElementType> = {
  YouTube: Youtube,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  Twitter: Twitter,
};

interface KpiCardProps {
  platform: string;
  color: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sub: string;
  subValue: string;
}

export default function KpiCard({ platform, color, value, delta, deltaPositive, sub, subValue }: KpiCardProps) {
  const Icon = PLATFORM_ICON[platform] || Youtube;

  return (
    <div
      className="kpi-card"
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 16, padding: "1.5rem",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = color + "55";
        el.style.boxShadow = `0 0 40px ${color}15`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "#27272a";
        el.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.2rem" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: color + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={color} strokeWidth={1.5} />
        </div>
        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px" }}>
          {platform}
        </span>
      </div>

      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fafafa", letterSpacing: "-1px" }}>{value}</div>

      <div style={{ marginTop: "0.5rem" }}>
        <span className={deltaPositive ? "badge badge-up" : "badge badge-down"} style={{ fontWeight: 700 }}>
          {deltaPositive ? "+" : ""}{delta}
        </span>
      </div>

      <div style={{ marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid #27272a" }}>
        <div style={{ fontSize: "0.6rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.2rem" }}>{sub}</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fafafa" }}>{subValue}</div>
      </div>
    </div>
  );
}
