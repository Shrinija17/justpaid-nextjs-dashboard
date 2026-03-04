"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Swords, BarChart3, Youtube, Instagram, Linkedin, Twitter } from "lucide-react";

const mainNav = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/competitive", icon: Swords, label: "Competitive" },
];

const platformNav = [
  { href: "/youtube", icon: Youtube, label: "YouTube", color: "#ef4444" },
  { href: "/instagram", icon: Instagram, label: "Instagram", color: "#f472b6" },
  { href: "/linkedin", icon: Linkedin, label: "LinkedIn", color: "#3b82f6" },
  { href: "/twitter", icon: Twitter, label: "Twitter", color: "#a1a1aa" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{
      width: 240, minHeight: "100vh", background: "#0a0a0c",
      borderRight: "1px solid #1e1e22",
      padding: "1.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem",
      position: "fixed", top: 0, left: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "0.5rem 0.75rem 1.5rem" }}>
        <div style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
          <span className="grad-text">JustPaid</span>
        </div>
        <div style={{ fontSize: "0.65rem", color: "#52525b", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 500 }}>
          Social Intelligence
        </div>
      </div>

      {/* Main nav label */}
      <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 0.75rem", marginBottom: "0.4rem" }}>
        Overview
      </div>

      {/* Main nav */}
      {mainNav.map(({ href, icon: Icon, label }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div
              className={`nav-item${active ? " active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.65rem 0.75rem", borderRadius: 10,
                border: `1px solid ${active ? "rgba(99,102,241,0.25)" : "transparent"}`,
                color: active ? "#818cf8" : "#71717a",
                fontSize: "0.83rem", fontWeight: active ? 600 : 400,
                cursor: "pointer",
              }}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.5} />
              {label}
            </div>
          </Link>
        );
      })}

      {/* Platform nav label */}
      <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "1.2px", padding: "0 0.75rem", marginTop: "1rem", marginBottom: "0.4rem" }}>
        Platforms
      </div>

      {/* Platform nav */}
      {platformNav.map(({ href, icon: Icon, label, color }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div
              className={`nav-item${active ? " active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.65rem 0.75rem", borderRadius: 10,
                border: `1px solid ${active ? color + "40" : "transparent"}`,
                color: active ? color : "#71717a",
                fontSize: "0.83rem", fontWeight: active ? 600 : 400,
                cursor: "pointer",
                background: active ? color + "10" : undefined,
              }}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.5} />
              {label}
            </div>
          </Link>
        );
      })}

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "0.75rem", borderTop: "1px solid #1e1e22" }}>
        <div style={{ fontSize: "0.6rem", color: "#3f3f46", textAlign: "center", fontWeight: 500 }}>
          Auto-refresh · 24h
        </div>
        <a href="https://justpaid.io" target="_blank" rel="noreferrer"
          style={{ display: "block", textAlign: "center", marginTop: "0.5rem", fontSize: "0.7rem", color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          justpaid.io
        </a>
      </div>
    </aside>
  );
}
