import { Outlet, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import BrandLogo from "../components/BrandLogo.jsx";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F5F8FF] lg:grid lg:grid-cols-[minmax(440px,0.9fr)_1.1fr]">
      <section className="relative flex min-h-screen items-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
        <div className="relative mx-auto w-full max-w-[440px]">
          <Link to="/" className="inline-flex" aria-label="PropAI home">
            <BrandLogo size={44} />
          </Link>
          <div className="mt-10 lg:mt-14">
            <Outlet />
          </div>
          <p className="mt-10 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ShieldCheck size={15} className="text-brand-600" />
            Secure workspace for the PropAI sales team
          </p>
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-brand-950 lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(700px 500px at 90% 0%, rgba(34,211,238,.28), transparent 60%), radial-gradient(700px 600px at 0% 100%, rgba(37,99,235,.55), transparent 60%)",
          }}
        />
        <div className="relative max-w-xl">
          <h2 className="font-display text-4xl font-bold leading-tight text-white xl:text-5xl">
            Your AI sales agent on WhatsApp.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100/85">
            It greets every prospect, asks their language, qualifies the business and books PropAI demos — while your team focuses on closing.
          </p>
        </div>
        <img
          src="/images/propai-hero.png"
          alt="PropAI replying to a real estate enquiry on WhatsApp"
          className="relative mt-10 w-full max-w-lg rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
        />
      </aside>
    </div>
  );
}
