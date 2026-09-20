import { ImageResponse } from "next/og";

export const alt = "Wanderly — plan the route, the days, and the budget";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: Atlas ink on ivory, a dotted route with three stops. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#f3f1e8",
          color: "#1d2935",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div
            style={{ width: 14, height: 14, borderRadius: 7, background: "#bc3f2b" }}
          />
          <div
            style={{
              flexGrow: 1,
              borderTop: "4px dashed #bc3f2b",
              opacity: 0.7,
            }}
          />
          <div
            style={{ width: 14, height: 14, borderRadius: 7, background: "#bc3f2b" }}
          />
          <div
            style={{
              flexGrow: 1,
              borderTop: "4px dashed #bc3f2b",
              opacity: 0.7,
            }}
          />
          <div
            style={{ width: 14, height: 14, borderRadius: 7, background: "#bc3f2b" }}
          />
        </div>

        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: "-2px" }}>
          Wanderly
        </div>
        <div
          style={{
            fontSize: 38,
            marginTop: 20,
            color: "#5f6a72",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          The route, the days, and the budget — one plan, in seconds.
        </div>
      </div>
    ),
    size,
  );
}
