import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#161616",
          padding: "80px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                color: "#ededed",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-1.5px",
              }}
            >
              DevFlow
            </span>
            <span
              style={{
                color: "#12a594",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-1.5px",
              }}
            >
              AI
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1f1f1f",
              border: "1.5px solid #0ac5b3",
              borderRadius: "9999px",
              padding: "8px 24px",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#0ac5b3",
                borderRadius: "50%",
                boxShadow: "0 0 8px #0ac5b3",
              }}
            />
            <span
              style={{
                color: "#ededed",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.3px",
              }}
            >
              Open Source
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              color: "#ededed",
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-4px",
              textAlign: "center",
            }}
          >
            Async Standups.
          </div>
          <div
            style={{
              color: "#ededed",
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-4px",
              marginTop: "-18px",
              textAlign: "center",
            }}
          >
            Codebase Onboarding.
          </div>

          <div
            style={{
              width: "100%",
              height: "3px",
              background: "linear-gradient(to right, transparent 0%, #0ac5b3 35%, #0ac5b3 65%, transparent 100%)",
              marginTop: "38px",
              marginBottom: "38px",
              borderRadius: "2px",
            }}
          />

          <div
            style={{
              color: "#0ac5b3",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.5px",
              maxWidth: "680px",
              textAlign: "center",
            }}
          >
            Open source AI productivity for dev teams
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}