import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="text-[10px] tracking-widest text-slate-500 uppercase mb-4">
        INTERLOCK · v1.0
      </div>
      <h1 className="text-5xl font-semibold mb-4 text-center">
        CFO Wire-Fraud Defense
      </h1>
      <p className="text-slate-400 mb-12 max-w-xl text-center text-sm leading-relaxed">
        A multimodal-AI command center that detects deepfake-CEO scams in
        real time, freezes wires in a sandboxed Linux environment, and
        drafts SEC Form 8-K Item 1.05 cybersecurity-incident disclosures for
        an authorized officer to file via EDGAR.
      </p>
      <Link
        href="/incident"
        className="px-10 py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white rounded-md text-lg font-medium transition"
      >
        Start Live Demo
      </Link>
      <div className="mt-16 text-[10px] text-slate-500 tracking-widest uppercase text-center">
        Built for Google I/O Hackathon · Cerebral Valley × Google DeepMind
        <br />
        Shack15 · San Francisco · May 23, 2026
      </div>
    </main>
  );
}
