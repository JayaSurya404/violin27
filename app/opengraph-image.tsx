import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OgImage() {
  return new ImageResponse(
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, color: "#F7F5FF", background: "radial-gradient(circle at 70% 20%, #3d176d, #080611 55%)", fontFamily: "serif" }}>
      <div style={{ fontSize: 30, letterSpacing: 8, color: "#C4B5FD", textTransform: "uppercase" }}>A private letter</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 86, marginTop: 24 }}>Something I wanted<br/>to say.</div>
    </div>, { ...size }
  );
}
