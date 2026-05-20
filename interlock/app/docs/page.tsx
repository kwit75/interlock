"use client";
import Link from "next/link";
import { useState } from "react";

type Section =
  | "quickstart"
  | "auth"
  | "detections"
  | "webhooks"
  | "errors";

export default function DocsPage() {
  const [section, setSection] = useState<Section>("detections");
  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-200 font-sans flex flex-col">
      <TopNav />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <aside className="w-64 shrink-0 border-r border-white/5 px-4 py-8">
          <div className="text-[10px] tracking-[0.25em] uppercase text-slate-500 mb-3">
            ◆ API reference · v1
          </div>
          <NavLink
            on={section === "quickstart"}
            onClick={() => setSection("quickstart")}
          >
            Quickstart
          </NavLink>
          <NavLink on={section === "auth"} onClick={() => setSection("auth")}>
            Authentication
          </NavLink>
          <NavLink
            on={section === "detections"}
            onClick={() => setSection("detections")}
          >
            Detections API
          </NavLink>
          <NavLink
            on={section === "webhooks"}
            onClick={() => setSection("webhooks")}
          >
            Webhooks
          </NavLink>
          <NavLink
            on={section === "errors"}
            onClick={() => setSection("errors")}
          >
            Errors
          </NavLink>
          <div className="mt-6 pt-6 border-t border-white/5 text-[11px] text-slate-500 leading-relaxed">
            Need help?{" "}
            <span className="text-blue-400">support@interlock.ai</span>
            <br />
            Status:{" "}
            <Link href="/trust" className="text-emerald-400 hover:underline">
              ● all systems operational
            </Link>
          </div>
        </aside>

        <main className="flex-1 px-10 py-8 max-w-3xl">
          {section === "quickstart" && <Quickstart />}
          {section === "auth" && <Auth />}
          {section === "detections" && <Detections />}
          {section === "webhooks" && <Webhooks />}
          {section === "errors" && <Errors />}
        </main>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <nav className="h-14 border-b border-white/5 flex items-center px-6 lg:px-12">
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[13px] font-semibold"
          style={{
            background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
          }}
        >
          ◆
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          INTERLOCK
        </span>
        <span className="text-[11px] text-slate-500 ml-2 px-1.5 py-0.5 rounded bg-slate-800/80 font-mono">
          docs
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-6 text-[13px] text-slate-300">
        <Link href="/trust" className="hover:text-white">
          Trust
        </Link>
        <Link href="/meet" className="hover:text-white">
          Live demo
        </Link>
        <Link
          href="/install"
          className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium transition"
        >
          Add to Workspace
        </Link>
      </div>
    </nav>
  );
}

function NavLink({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-1.5 rounded text-[13px] mb-0.5 transition ${
        on
          ? "bg-blue-500/15 text-blue-300 border-l-2 border-blue-400 -ml-[2px] pl-[14px]"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[32px] font-semibold tracking-tight mb-3">{children}</h1>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-semibold mt-10 mb-3 border-t border-white/5 pt-7">
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] text-slate-300 leading-relaxed mb-4">{children}</p>
  );
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-white/5 mb-5">
      <div className="px-3 py-1.5 border-b border-white/5 bg-slate-950/40 text-[10px] uppercase tracking-widest text-slate-500 font-mono flex items-center justify-between">
        <span>{language}</span>
        <span className="text-slate-600">copy</span>
      </div>
      <pre className="px-4 py-3 bg-[#06080a] text-[12.5px] text-slate-300 overflow-x-auto leading-relaxed font-mono">
        {code}
      </pre>
    </div>
  );
}

function Tabs({ active, on, options }: { active: string; on: (k: string) => void; options: string[] }) {
  return (
    <div className="flex gap-1 mb-2 border-b border-white/5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => on(opt)}
          className={`px-3 py-1.5 text-[12px] -mb-px transition ${
            active === opt
              ? "border-b-2 border-blue-400 text-blue-300"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Quickstart() {
  return (
    <>
      <H1>Quickstart</H1>
      <P>
        Send your first detection in under five minutes. INTERLOCK runs as a
        Google Workspace add-on for production, but for development you can
        call the Detections API directly against any video stream URL or file
        upload.
      </P>
      <H2>1. Install via Workspace Marketplace</H2>
      <P>
        Visit the{" "}
        <Link href="/install" className="text-blue-400 underline">
          Workspace Marketplace listing
        </Link>{" "}
        and authorize the OAuth scopes for your tenant. A per-tenant API key is
        auto-provisioned and visible in the Admin → Detector tab inside the
        Meet add-on.
      </P>
      <H2>2. Make your first call</H2>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.interlock.ai/v1/detections \\
  -H "Authorization: Bearer ilk_live_sk_8f3a..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "stream_url": "https://meet.google.com/qrx-vfgr-djy/recording",
    "tenant_id": "ten_arup",
    "policy": "strict"
  }'`}
      />
      <H2>3. Wire your webhook</H2>
      <P>
        INTERLOCK posts a signed event to your endpoint within ~300 ms of a
        verdict. See <span className="text-blue-400 cursor-pointer">Webhooks</span>{" "}
        for the payload schema and signature verification.
      </P>
    </>
  );
}

function Auth() {
  return (
    <>
      <H1>Authentication</H1>
      <P>
        INTERLOCK uses bearer-token authentication. Every API request must
        include an <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">Authorization</code>{" "}
        header with a per-tenant key issued at install time.
      </P>
      <H2>Key types</H2>
      <P>
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">ilk_live_sk_*</code>{" "}
        — production secret, never exposed client-side.
        <br />
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">ilk_test_sk_*</code>{" "}
        — sandbox key, returns synthetic detector traces.
        <br />
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">ilk_pk_*</code>{" "}
        — publishable key for client-side SDK init.
      </P>
      <H2>Rotation</H2>
      <P>
        Keys rotate automatically every 90 days. Manual rotation is available
        from the Admin → Detector tab; existing keys remain valid for a 7-day
        grace window after rotation.
      </P>
    </>
  );
}

function Detections() {
  const [tab, setTab] = useState("curl");
  return (
    <>
      <H1>Detections API</H1>
      <P>
        Submit a video stream URL or pre-uploaded clip. The Detections endpoint
        returns a deterministic verdict, per-detector confidence, and a list of
        flagged frames within ~300 ms of stream availability.
      </P>
      <H2>
        <span className="text-emerald-300 font-mono text-[14px] mr-2">POST</span>{" "}
        /v1/detections
      </H2>
      <Tabs
        active={tab}
        on={setTab}
        options={["curl", "python", "node"]}
      />
      {tab === "curl" && (
        <CodeBlock
          language="bash"
          code={`curl -X POST https://api.interlock.ai/v1/detections \\
  -H "Authorization: Bearer ilk_live_sk_***" \\
  -H "Content-Type: application/json" \\
  -d '{
    "meeting_id": "meet_8f3a4b2c",
    "stream_url": "https://stream.googleapis.com/v1/meet/qrx-vfgr-djy",
    "tenant_id": "ten_arup",
    "policy": "strict",
    "callbacks": {
      "on_verdict": "https://hooks.northwind.example/interlock"
    }
  }'`}
        />
      )}
      {tab === "python" && (
        <CodeBlock
          language="python"
          code={`from interlock import Client

client = Client(api_key="ilk_live_sk_***")

detection = client.detections.create(
    meeting_id="meet_8f3a4b2c",
    stream_url="https://stream.googleapis.com/v1/meet/qrx-vfgr-djy",
    tenant_id="ten_arup",
    policy="strict",
)

print(detection.verdict, detection.confidence)
# -> synthetic 0.987`}
        />
      )}
      {tab === "node" && (
        <CodeBlock
          language="javascript"
          code={`import Interlock from '@interlock/node';

const client = new Interlock({ apiKey: process.env.INTERLOCK_KEY });

const detection = await client.detections.create({
  meeting_id: 'meet_8f3a4b2c',
  stream_url: 'https://stream.googleapis.com/v1/meet/qrx-vfgr-djy',
  tenant_id: 'ten_arup',
  policy: 'strict',
});

console.log(detection.verdict);  // 'synthetic'`}
        />
      )}
      <H2>Response</H2>
      <CodeBlock
        language="json"
        code={`{
  "detection_id": "det_01HXY2VFM7K1QZRS9P8N4B6D3F",
  "meeting_id": "meet_8f3a4b2c",
  "tenant_id": "ten_arup",
  "verdict": "synthetic",
  "confidence": 0.987,
  "operating_point": {
    "fpr": 0.003,
    "fnr": 0.021,
    "eer_baseline": 0.011
  },
  "latency_ms": 287,
  "model_version": "detect-3b-omni-v2.1",
  "signals": [
    { "id": "lip_sync",            "confidence": 0.93, "frames": [7,8,9] },
    { "id": "facial_geometry",     "confidence": 0.89, "frames": [14,15] },
    { "id": "lighting_shadows",    "confidence": 0.81, "frames": [17,18,19] },
    { "id": "eye_movement",        "confidence": 0.94, "frames": [22] },
    { "id": "temporal_consistency","confidence": 0.78, "frames": [24,25,26] },
    { "id": "voice_formants",      "confidence": 0.96, "frames": [11,12] }
  ],
  "action": {
    "type": "human_review_required",
    "policy_id": "INTERLOCK-R001",
    "co_signers_required": ["cfo", "general_counsel"]
  },
  "audit": {
    "request_id": "req_01HXY2VFM7K1QZ",
    "captured_at": "2026-05-23T20:55:14.872Z"
  }
}`}
      />
      <H2>Request parameters</H2>
      <Params
        rows={[
          [
            "meeting_id",
            "string · required",
            "Meet meeting code. Used for audit-trail correlation.",
          ],
          [
            "stream_url",
            "string · required",
            "Server-side stream URL — must be reachable from INTERLOCK's egress IPs.",
          ],
          [
            "tenant_id",
            "string · required",
            "Workspace tenant identifier. Determines model chain + signer policy.",
          ],
          [
            "policy",
            "enum · default: balanced",
            "strict · balanced · permissive. Sets confidence threshold and signer count.",
          ],
          [
            "callbacks.on_verdict",
            "string · optional",
            "HTTPS endpoint for signed webhook. Replaces synchronous response.",
          ],
        ]}
      />
    </>
  );
}

function Webhooks() {
  return (
    <>
      <H1>Webhooks</H1>
      <P>
        On every verdict, INTERLOCK posts a signed payload to your registered
        endpoint. Signatures use HMAC-SHA256 with your tenant&apos;s webhook
        secret, in the <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">
          X-Interlock-Signature
        </code>{" "}
        header.
      </P>
      <H2>Event types</H2>
      <P>
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">
          detection.verdict
        </code>{" "}
        — final verdict produced.
        <br />
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">
          wire.frozen
        </code>{" "}
        — bank-API freeze succeeded.
        <br />
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">
          disclosure.drafted
        </code>{" "}
        — Form 8-K Item 1.05 draft ready for officer review.
        <br />
        <code className="bg-slate-800/60 px-1 rounded text-[12.5px] font-mono">
          override.requested
        </code>{" "}
        — operator triggered dual-FIDO2 override flow.
      </P>
      <H2>Signature verification (Python)</H2>
      <CodeBlock
        language="python"
        code={`import hmac, hashlib

def verify(body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)`}
      />
    </>
  );
}

function Errors() {
  return (
    <>
      <H1>Errors</H1>
      <P>
        INTERLOCK uses conventional HTTP response codes. 2xx for success, 4xx
        for caller errors, 5xx for INTERLOCK&apos;s own faults — visible in
        real time on <Link href="/trust" className="text-blue-400 underline">/trust</Link>.
      </P>
      <ErrorTable
        rows={[
          ["400 invalid_request", "Required field missing or malformed."],
          ["401 unauthorized", "Invalid API key or revoked token."],
          ["403 tenant_mismatch", "API key does not authorize the specified tenant."],
          ["404 stream_unreachable", "INTERLOCK egress could not access the stream URL."],
          ["409 already_processed", "detection_id replayed; idempotent."],
          ["429 rate_limited", "Tenant exceeded its detections quota."],
          ["503 model_unavailable", "Detector chain unhealthy — see status.interlock.ai."],
        ]}
      />
    </>
  );
}

function Params({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="rounded-lg border border-white/5 overflow-hidden mb-5">
      {rows.map(([name, type, desc], i) => (
        <div
          key={name}
          className={`grid grid-cols-[160px_140px_1fr] gap-4 px-4 py-3 text-[12.5px] ${
            i % 2 === 0 ? "bg-slate-950/30" : ""
          }`}
        >
          <code className="text-blue-300 font-mono">{name}</code>
          <code className="text-slate-500 font-mono">{type}</code>
          <span className="text-slate-300">{desc}</span>
        </div>
      ))}
    </div>
  );
}

function ErrorTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-lg border border-white/5 overflow-hidden mb-5">
      {rows.map(([code, desc], i) => (
        <div
          key={code}
          className={`grid grid-cols-[230px_1fr] gap-4 px-4 py-3 text-[12.5px] ${
            i % 2 === 0 ? "bg-slate-950/30" : ""
          }`}
        >
          <code className="text-rose-300 font-mono">{code}</code>
          <span className="text-slate-300">{desc}</span>
        </div>
      ))}
    </div>
  );
}
