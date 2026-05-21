"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const C = {
  bg: "#0b0d10",
  surface: "#15171b",
  border: "rgba(255,255,255,0.06)",
  text: "#e8eaed",
  textDim: "#9aa0a6",
  textMuted: "#5f6368",
  accent: "#8ab4f8",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const is = (p: string) => path === p || path.startsWith(p + "/");
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ background: C.bg, color: C.text }}
    >
      {/* Top bar */}
      <header
        className="h-14 flex items-center px-6 gap-6"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <Link href="/app" className="flex items-center gap-2.5">
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
          <span
            className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded ml-1"
            style={{
              background: "rgba(168,85,247,0.15)",
              color: "#c4b5fd",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            on Antigravity 2.0
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1 ml-4 text-[12.5px]" style={{ color: C.textDim }}>
          <span className="px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>
            northwind.example
          </span>
          <span style={{ color: C.textMuted }}>·</span>
          <span>Enterprise</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-[13px]" style={{ color: C.textDim }}>
          <Link href="/docs" className="hover:text-white">Docs</Link>
          <Link href="/trust" className="hover:text-white">Trust</Link>
          <span
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: "#34d399" }}
            title="System status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            operational
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
            style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}
          >
            MC
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar nav */}
        <aside
          className="w-56 shrink-0 py-4 px-2 hidden md:flex flex-col gap-1"
          style={{ borderRight: `1px solid ${C.border}` }}
        >
          <NavLink href="/app" on={is("/app") && path === "/app"} icon="◆">
            Dashboard
          </NavLink>
          <NavLink href="/app/live" on={is("/app/live")} icon="●">
            Live monitoring
          </NavLink>
          <NavLink href="/app/library" on={is("/app/library")} icon="▢">
            Library
          </NavLink>
          <NavLink href="/app/incidents" on={is("/app/incidents")} icon="⚑">
            Incidents
          </NavLink>
          <NavSection>Antigravity 2.0</NavSection>
          <NavLink href="/app/agents" on={is("/app/agents")} icon="⬢" highlight>
            Agent Console
          </NavLink>
          <NavLink href="/app/sandboxes" on={is("/app/sandboxes")} icon="⌘">
            Sandboxes
          </NavLink>
          <NavSection>Account</NavSection>
          <NavLink href="/app/settings" on={is("/app/settings")} icon="⚙">
            Settings
          </NavLink>
          <NavLink href="/install" on={false} icon="↗">
            Marketplace
          </NavLink>
          <div className="mt-auto px-3 py-2 text-[10.5px] leading-relaxed" style={{ color: C.textMuted }}>
            v1.0.0 · region us-east1<br />
            Detector chain healthy
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  on,
  icon,
  highlight,
  children,
}: {
  href: string;
  on: boolean;
  icon: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition"
      style={{
        background: on
          ? "rgba(138,180,248,0.12)"
          : highlight
            ? "rgba(168,85,247,0.06)"
            : "transparent",
        color: on
          ? "#c2dafb"
          : highlight
            ? "#c4b5fd"
            : "#bdc1c6",
        border: on
          ? "1px solid rgba(138,180,248,0.30)"
          : "1px solid transparent",
      }}
    >
      <span
        className="w-4 text-center text-[11px]"
        style={{ color: on ? "#c2dafb" : highlight ? "#c4b5fd" : "#5f6368" }}
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}

function NavSection({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 pt-4 pb-1.5 text-[9.5px] tracking-[0.2em] uppercase"
      style={{ color: "#5f6368" }}
    >
      ◆ {children}
    </div>
  );
}
