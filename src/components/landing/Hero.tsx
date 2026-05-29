import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import dashboardImg from "@/assets/dashboard-hero.jpg";

export function Hero() {
  return (
    <section className="relative pt-36 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
        >
          Your AI Content Team.<br />
          <span className="text-gradient">Create once. Publish everywhere.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          The AI-powered social media operating system for creators, agencies and brands.
          Automate, schedule and analyze across every platform — from one futuristic dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" className="bg-gradient-brand border-0 hover:opacity-90 h-12 px-6 text-base">
            Start free trial <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button size="lg" variant="outline" className="glass h-12 px-6 text-base">
            <Play className="mr-1 size-4" /> Watch demo
          </Button>
        </motion.div>

        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required • 14-day free trial • Cancel anytime
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="relative mt-16"
        >
          <div className="absolute -inset-8 bg-gradient-brand opacity-20 blur-3xl rounded-full" />
          <div className="relative glass rounded-3xl p-2 glow">
            <img
              src={dashboardImg}
              alt="Nexora AI dashboard preview"
              width={1600}
              height={1100}
              className="rounded-2xl w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}