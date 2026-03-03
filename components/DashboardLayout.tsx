import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0F" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem 2.5rem" }} className="dashboard-main">
        {children}
      </main>
      <style>{`
        @media (min-width: 769px) {
          .dashboard-main {
            margin-left: 220px;
            max-width: calc(100vw - 220px);
          }
        }
        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            max-width: 100vw;
            padding: 1.25rem 1rem 5rem;
          }
        }
      `}</style>
    </div>
  );
}
