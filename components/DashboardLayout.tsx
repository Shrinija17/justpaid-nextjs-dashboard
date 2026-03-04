import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: "2rem 2.5rem", maxWidth: "calc(100vw - 240px)" }}>
        {children}
      </main>
    </div>
  );
}
