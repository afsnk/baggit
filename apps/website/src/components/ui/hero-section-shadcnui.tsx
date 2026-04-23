import { Button } from '#/components/ui/button'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[500px] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-[var(--muted-foreground)]">
          <Sparkles className="size-3" />
          Refer and earn on every transaction
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-6 text-5xl font-bold tracking-tight md:text-8xl"
      >
        Turn your network into
        <br />
        <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
          recurring revenue
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-8 max-w-2xl text-lg text-(--foreground)/70"
      >
        Join Baggit’s referral partner program and earn volume-based commissions
        on real transaction activity.
      </motion.p>

      <motion.div variants={itemVariants} className="flex gap-4 mt-4">
        <Button size="lg" className="gap-2">
          Become a referral partner
          <ArrowUpRight className="size-4" />
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-12 flex items-center gap-8 text-sm text-foreground/60"
      >
        <div>
          <div className="text-2xl font-bold text-foreground">500+</div>
          <div>Partners</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-2xl font-bold text-foreground">$50,950+</div>
          <div>Payout</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <div className="text-2xl font-bold text-foreground">100%</div>
          <div>Open Source</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
