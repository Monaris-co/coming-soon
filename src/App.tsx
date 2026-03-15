import { motion } from "framer-motion";
import { ArrowRight, Mail, Users, Sparkles } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabase";

function useWaitlist() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!supabase) return;
    try {
      const { count: total, error: countError } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });
      if (countError) throw countError;
      setCount(total ?? 0);
    } catch {
      setCount(null);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const join = useCallback(
    async (email: string) => {
      if (!supabase) {
        setError("Waitlist is not configured.");
        return false;
      }
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        setError("Please enter your email.");
        setIsLoading(false);
        return false;
      }
      try {
        const { error: insertError } = await supabase.from("waitlist").insert({
          email: trimmed,
        });
        if (insertError) {
          if (insertError.code === "23505") {
            setError("You're already on the waitlist.");
          } else {
            setError(insertError.message || "Something went wrong.");
          }
          return false;
        }
        setSuccess(true);
        await fetchCount();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCount]
  );

  return { count, join, isLoading, error, success };
}

export default function App() {
  const { count, join, isLoading, error, success } = useWaitlist();
  const [email, setEmail] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await join(email);
    if (ok) setEmail("");
  };

  /* Shared green panel */
  const greenPanel = (
    <div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#d4f542] via-[#c8ff00] to-[#a8df00] p-5 sm:p-7 sm:w-[58%] font-sans">
      <div className="absolute inset-0">
        <div
          className="absolute left-0 top-0 bottom-0 w-[35%] bg-gradient-to-r from-[#e8ffb3]/70 to-transparent"
          style={{ clipPath: "ellipse(100% 80% at 0% 50%)" }}
        />
        <div
          className="absolute left-[15%] top-0 bottom-0 w-[40%] bg-gradient-to-r from-[#dcff85]/50 to-transparent"
          style={{ clipPath: "ellipse(80% 90% at 20% 50%)" }}
        />
      </div>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1a1a]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/50">
          <Sparkles className="h-3 w-3" />
          Early Access
        </div>
        <h2 className="mt-2 text-xl font-bold leading-[1.12] text-[#1a1a1a] leading-tight">
          Own Your Cashflow.
        </h2>
      </div>
      <div className="relative z-10 mt-4 sm:mt-5">
        {success ? (
          <div className="rounded-2xl bg-[#1a1a1a]/10 p-4 sm:p-5 text-center">
            <p className="text-sm font-bold text-[#1a1a1a]">
              You&apos;re on the list! 🎉
            </p>
            <p className="mt-1 text-xs text-[#1a1a1a]/60">
              We&apos;ll reach out when you&apos;re in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a1a1a]/30 group-focus-within:text-[#1a1a1a]/60 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                className={`h-11 sm:h-[52px] w-full rounded-2xl border-2 bg-white pl-11 sm:pl-12 pr-4 text-sm sm:text-[15px] font-medium text-[#1a1a1a] placeholder-[#1a1a1a]/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:border-[#1a1a1a]/20 focus:outline-none focus:ring-4 focus:ring-[#1a1a1a]/5 focus:shadow-[0_4px_16px_rgba(0,0,0,0.08)] disabled:opacity-50 transition-all ${error ? "border-red-500/50" : "border-[#1a1a1a]/8"}`}
              />
            </div>
            {error && (
              <p className="text-xs font-semibold text-red-600 pl-1">
                {error}
              </p>
            )}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.97 }}
              className="flex h-11 sm:h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1a1a1a] text-sm sm:text-[15px] font-semibold text-[#c8ff00] hover:bg-[#252525] active:bg-[#303030] disabled:opacity-50 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            >
              {isLoading ? (
                "Joining..."
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );

  /* Shared dark panel */
  const darkPanel = (clickHandler?: () => void) => (
    <div
      className={`relative w-full overflow-hidden bg-[#0f0f14] p-5 sm:p-7 sm:w-[42%] font-sans ${clickHandler ? "cursor-pointer group" : ""}`}
      onClick={clickHandler}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-auto">
          <p className="text-lg sm:text-xl font-bold italic tracking-tight text-white">
            Monaris
          </p>
        </div>
        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Registrations
            </p>
            <motion.p
              key={count}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl font-black text-[#BFFF00] sm:text-7xl leading-none"
            >
              {count !== null ? count.toLocaleString() : "—"}
            </motion.p>
          </div>
        </div>
        {clickHandler && (
          <div className="mt-2 sm:mt-3 flex items-center gap-2 text-white/30 group-hover:text-white/50 transition-colors">
            <Users className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">
              Tap to learn more →
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════ TOP: Lime-green hero ═══════ */}
      <div className="relative bg-[#BFFF00] flex-shrink-0">
        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-[1100px] mx-auto flex h-16 items-center px-4 sm:px-6">
            <a href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-[#1a1a1a]/5">
                <img src="/monar.png" alt="Monaris" className="h-7 w-auto" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">
                Monaris
              </span>
            </a>
          </div>
        </header>

        {/* Headline + subtitle */}
        <section className="relative z-10 px-4 sm:px-6 pt-8 pb-14 sm:pt-14 sm:pb-24">
          <div className="max-w-[1100px] mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[clamp(1.6rem,4vw,3.2rem)] font-bold leading-[1.12] tracking-[-0.025em] text-[#1a1a1a] max-w-[800px]"
            >
              The first private cashflow OS
              <br className="hidden sm:block" />
              {" "}for the stablecoin economy.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-4 text-sm sm:text-base text-[#1a1a1a]/50 max-w-[460px] leading-relaxed font-medium"
            >
            Your cashflow is proof of income. Proof that no bank can see. Every receivable builds a Monaris Score — your real-time financial identity. That Score unlocks capital, payment financing (pay-fi), credit, and BNPL backed by income you already earned.{" "}
              <span className="font-bold underline text-black">Private by default. Always.</span>
            </motion.p>
          </div>
        </section>

        {/* Curved separator */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 L0,8 Q720,40 1440,8 L1440,40 Z" fill="#0a0a0f" />
          </svg>
        </div>
      </div>

      {/* ═══════ BOTTOM: Dark section ═══════ */}
      <div className="relative bg-[#0a0a0f] flex-1">
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10">
          {/* Waitlist count pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 sm:px-5 py-2 sm:py-2.5">
              <span className="text-2xl sm:text-3xl font-black text-[#BFFF00]">
                {count !== null ? count.toLocaleString() : "—"}
              </span>
              <span className="text-xs sm:text-sm text-white/40 font-medium">
                on the waitlist for Monaris Alpha
              </span>
              <span className="h-2 w-2 rounded-full bg-[#BFFF00] animate-pulse" />
            </div>
          </motion.div>

          {/* ═══ MOBILE CARD (no flip, compact) ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sm:hidden mx-auto w-full max-w-[400px] rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_48px_-12px_rgba(0,0,0,0.6),0_48px_96px_-24px_rgba(0,0,0,0.4)]"
          >
            {greenPanel}
            {/* Slim dark footer — Monaris at bottom-right */}
            <div className="relative w-full bg-[#0f0f14] py-5 px-5 flex items-center justify-end">
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              <p className="relative z-10 text-base font-bold italic tracking-tight text-white">
                Monaris
              </p>
            </div>
          </motion.div>

          {/* ═══ DESKTOP CARD (flip) ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden sm:block flip-card mx-auto w-full max-w-[520px]"
          >
            <div className={`flip-card-inner min-h-[320px] ${isFlipped ? "flipped" : ""}`}>
              {/* FRONT */}
              <div className="flip-card-front w-full rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_48px_-12px_rgba(0,0,0,0.6),0_48px_96px_-24px_rgba(0,0,0,0.4)]">
                <div className="flex min-h-[320px] flex-row">
                  {greenPanel}
                  {darkPanel(() => setIsFlipped(true))}
                </div>
              </div>

              {/* BACK — Financial Dashboard Mockup */}
              <div className="flip-card-back w-full rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_48px_-12px_rgba(0,0,0,0.6),0_48px_96px_-24px_rgba(0,0,0,0.4)]">
                <div
                  className="flex min-h-[320px] h-full flex-row relative cursor-pointer font-sans"
                  onClick={() => setIsFlipped(false)}
                >
                  {/* Left — green data panel */}
                  <div className="relative flex w-[58%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#d4f542] via-[#c8ff00] to-[#a8df00] p-7">
                    <div className="absolute inset-0">
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[35%] bg-gradient-to-r from-[#e8ffb3]/70 to-transparent"
                        style={{ clipPath: "ellipse(100% 80% at 0% 50%)" }}
                      />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">
                        Cashflow Account
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#1a1a1a] tracking-tight">
                        0xa836…BbBf
                      </p>
                    </div>
                    <div className="relative z-10 mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">
                        Credit Limit
                      </p>
                      <p className="mt-1 text-3xl font-black text-[#1a1a1a] tracking-tight">
                        $23
                      </p>
                    </div>
                    <div className="relative z-10 mt-4 flex gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">
                          Net Inflow
                        </p>
                        <p className="mt-1 text-xl font-black text-[#1a1a1a] tracking-tight">
                          +$16
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/40">
                          Credit Tier
                        </p>
                        <p className="mt-1 text-xl font-black text-[#1a1a1a] tracking-tight">
                          B
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right — dark info panel */}
                  <div className="relative flex w-[42%] flex-col justify-between overflow-hidden bg-[#0f0f14] p-7">
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                      }}
                    />
                    <div className="relative z-10">
                      <p className="text-xl font-bold italic tracking-tight text-white">
                        Monaris
                      </p>
                    </div>
                    <div className="relative z-10 mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Available Now
                      </p>
                      <p className="mt-1 text-3xl font-black text-[#BFFF00] tracking-tight">
                        $15
                      </p>
                    </div>
                    <div className="relative z-10 mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Reserved
                      </p>
                      <p className="mt-1 text-xl font-bold text-white/60 tracking-tight">
                        $8
                      </p>
                    </div>
                    <div className="relative z-10 mt-3 flex items-center justify-end">
                      <span className="text-xs font-semibold italic text-[#BFFF00]/60">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-auto border-t border-white/[0.05] py-6">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/monar.png" alt="Monaris" className="h-4 w-auto opacity-40" />
              <span className="text-xs font-medium text-white/20">Monaris</span>
            </div>
            <p className="text-xs text-white/20">
              © {new Date().getFullYear()} Monaris. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
