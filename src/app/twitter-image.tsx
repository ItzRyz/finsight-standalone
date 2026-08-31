import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FinSight";
export const size = { width: 800, height: 418 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 48, background: "#ffc400" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffc400", fontSize: 20, fontWeight: 800 }}>F</div>
          <span style={{ fontSize: 24, fontWeight: 800 }}>FinSight</span>
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 36, fontWeight: 800 }}>AI-Powered Multicurrency</div>
        <div style={{ display: "flex", fontSize: 16, opacity: 0.7 }}>Expense tracker • Budgets • Charts</div>
      </div>
    ),
    { ...size },
  );
}
