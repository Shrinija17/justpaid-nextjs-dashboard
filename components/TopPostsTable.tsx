"use client";
import { fmt, PLATFORM_COLORS } from "@/lib/utils";

interface Post { platform:string; title:string; post_type:string; views:number; likes:number; comments:number; }

export default function TopPostsTable({ posts }: { posts: Post[] }) {
  if (!posts?.length) return <div style={{ color:"#52525b", textAlign:"center", padding:"2rem" }}>No data</div>;
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.82rem" }}>
        <thead>
          <tr style={{ borderBottom:"1px solid #27272a" }}>
            {["Platform","Title","Type","Views","Likes","Comments"].map(h => (
              <th key={h} style={{
                padding:"0.7rem 0.8rem", textAlign:"left", color:"#52525b",
                fontWeight:600, fontSize:"0.68rem", textTransform:"uppercase", letterSpacing:"0.8px",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((p, i) => (
            <tr key={i} className="table-row" style={{ borderBottom:"1px solid rgba(39,39,42,0.5)" }}>
              <td style={{ padding:"0.75rem 0.8rem" }}>
                <span style={{ color: PLATFORM_COLORS[p.platform]||"#6366f1", fontWeight:600, fontSize:"0.78rem" }}>{p.platform}</span>
              </td>
              <td style={{ padding:"0.75rem 0.8rem", color:"#e4e4e7", maxWidth:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</td>
              <td style={{ padding:"0.75rem 0.8rem" }}>
                <span className="badge badge-source">{p.post_type}</span>
              </td>
              <td style={{ padding:"0.75rem 0.8rem", color:"#fafafa", fontWeight:600, fontVariantNumeric:"tabular-nums" }}>{fmt(p.views)}</td>
              <td style={{ padding:"0.75rem 0.8rem", color:"#22c55e", fontVariantNumeric:"tabular-nums" }}>{fmt(p.likes)}</td>
              <td style={{ padding:"0.75rem 0.8rem", color:"#a1a1aa", fontVariantNumeric:"tabular-nums" }}>{fmt(p.comments)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
