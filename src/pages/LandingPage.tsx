import { Link } from "react-router-dom";
import { ArrowRight, Printer, Palette, Shirt, Zap, MessageCircle, TrendingUp } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Printer,
    title: "Printing Methods",
    description: "DTF, screen printing, sublimation, DTG — get expert guidance on every technique.",
  },
  {
    icon: Palette,
    title: "Color & Design",
    description: "Perfect color combinations, palette suggestions, and design ideas for any garment.",
  },
  {
    icon: Shirt,
    title: "Fabric Selection",
    description: "Know exactly which fabric works best for your printing method and end product.",
  },
  {
    icon: Zap,
    title: "Troubleshooting",
    description: "Fix bleeding, cracking, fading, and adhesion issues instantly with AI guidance.",
  },
  {
    icon: MessageCircle,
    title: "Design Ideas",
    description: "Get creative concepts for t-shirts, hoodies, tote bags, and textile products.",
  },
  {
    icon: TrendingUp,
    title: "Business Tips",
    description: "Start and grow your textile printing business with expert pricing and supplier advice.",
  },
];

const suggestions = [
  "Best fabric for sublimation printing?",
  "DTF vs screen printing comparison",
  "Fix cracking print on shirts",
  "Trendy color palettes for streetwear",
  "Starting a DTG print business",
  "Hoodie design ideas for 2024",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/40 backdrop-blur-xl bg-background/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center glow-purple-sm">
            <Printer className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">FabricPrint AI</span>
        </div>
        <Link
          to="/chat"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all glow-purple-sm hover:glow-purple"
        >
          Start Chat
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />

        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Textile Expert
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-fade-up delay-100">
            Your Expert
            <br />
            <span className="text-gradient">Fabric Printing</span>
            <br />
            Assistant
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            Ask anything about DTF, sublimation, screen printing, fabric selection,
            color theory, and building your textile business. Get instant expert answers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up delay-300">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all glow-purple hover:scale-[1.02] active:scale-[0.98]"
            >
              Chat with FabricPrint AI
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-surface-1 text-foreground font-medium text-base hover:border-primary/50 hover:bg-surface-2 transition-all">
              See examples
            </button>
          </div>

          {/* Quick suggestion pills */}
          <div className="flex flex-wrap gap-2 justify-center animate-fade-up delay-400">
            {suggestions.map((s) => (
              <Link
                key={s}
                to={`/chat?q=${encodeURIComponent(s)}`}
                className="px-3 py-1.5 rounded-full text-xs border border-border bg-surface-1 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-surface-2 transition-all"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-primary" />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to know about <span className="text-gradient">fabric printing</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From choosing the right technique to scaling your business — FabricPrint AI has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border bg-surface-1 hover:border-primary/30 hover:bg-surface-2 transition-all hover:shadow-purple-sm cursor-default"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-all">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl border border-primary/20 bg-surface-1 relative overflow-hidden shadow-purple">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center mx-auto mb-6 glow-purple">
                <Printer className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                Ready to level up your prints?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Ask your first question and get expert-level answers in seconds.
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all glow-purple"
              >
                Start Chatting Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-purple flex items-center justify-center">
            <Printer className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">FabricPrint AI</span>
        </div>
        <p>Your intelligent textile printing assistant.</p>
      </footer>
    </div>
  );
}
