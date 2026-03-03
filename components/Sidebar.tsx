"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", icon: "📊", label: "Dashboard" },
  { href: "/leads", icon: "🎯", label: "Lead Intel" },
  { href: "/competitive", icon: "⚔️", label: "Competitive" },
  { href: "/strategy", icon: "🧠", label: "Strategy" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 220, minHeight: "100vh", background: "#0E0E16",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem",
        position: "fixed", top: 0, left: 0, zIndex: 50,
      }} className="desktop-sidebar">
        <div style={{ padding: "0.5rem 0.8rem 1.5rem" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
            <span style={{
              background: "linear-gradient(135deg,#6C5CE7,#00CEC9)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>JustPaid</span>
          </div>
          <div style={{ fontSize: "0.65rem", color: "#5A5A6A", marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "1px" }}>
            Social Intelligence
          </div>
        </div>

        {nav.map(({ href, icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.7rem",
                padding: "0.65rem 0.8rem", borderRadius: "10px",
                background: active ? "rgba(108,92,231,0.15)" : "transparent",
                border: `1px solid ${active ? "rgba(108,92,231,0.3)" : "transparent"}`,
                color: active ? "#A29BFE" : "#8A8A9A",
                fontSize: "0.85rem", fontWeight: active ? 600 : 400,
                transition: "all 0.2s", cursor: "pointer",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}

        <div style={{ marginTop: "auto", padding: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.65rem", color: "#3A3A4A", textAlign: "center" }}>Auto-refresh · 24h</div>
          <a href="https://justpaid.io" target="_blank" rel="noreferrer"
            style={{ display: "block", textAlign: "center", marginTop: "0.4rem", fontSize: "0.7rem", color: "#6C5CE7", textDecoration: "none" }}>
            justpaid.io ↗
          </a>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" style={{
        display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "#0E0E16", borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))",
        justifyContent: "space-around", alignItems: "center",
      }}>
        {nav.map(({ href, icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none", flex: 1 }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                padding: "0.4rem 0",
                color: active ? "#A29BFE" : "#5A5A6A",
              }}>
                <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                <span style={{ fontSize: "0.6rem", fontWeight: active ? 600 : 400 }}>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
