import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FinSight — Financial command center";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 64, background: "#ffffff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#ffc400", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontSize: 28, fontWeight: 800 }}>F</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>FinSight</span>
            <span style={{ fontSize: 14, opacity: 0.6 }}>Financial command center</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
          <span style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.1 }}>Financial clarity,</span>
          <span style={{ fontSize: 54, fontWeight: 800, color: "#b38600" }}>finally.</span>
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 18, opacity: 0.7 }}>Track IDR, USD, EUR, JPY, SGD — AI categorization, budgets, charts.</div>
      </div>
    ),
    { ...size },
  );
}
