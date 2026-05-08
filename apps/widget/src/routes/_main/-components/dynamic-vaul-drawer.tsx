// app/components/DynamicVaulDrawer.tsx
'use client'

import * as React from 'react'
import { Drawer } from 'vaul'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'

type DrawerView = 'menu' | 'profile' | 'billing'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.06,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: { duration: 0.14, ease: EASE_OUT },
  },
}

export function DynamicVaulDrawer() {
  const [open, setOpen] = React.useState(false)
  const [view, setView] = React.useState<DrawerView>('menu')

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      // Let Vaul close, then reset the internal view.
      window.setTimeout(() => setView('menu'), 180)
    }
  }

  const goToMenu = () => setView('menu')
  const handleSelect = (next: DrawerView) => {
    if (next !== view) setView(next)
  }
  const handleCancel = () => {
    // Soft reset back to menu, keep drawer open.
    goToMenu()
  }

  return (
    <div className="flex items-center justify-center">
      <Drawer.Root open={open} onOpenChange={handleOpenChange} modal>
        <Drawer.Trigger asChild>
          <Button variant="outline">Open Drawer</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          {/* Subtle overlay so content behind is still visible */}
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />

          <Drawer.Content asChild>
            {/* Outer positioner, not animated in height (just placement) */}
            <motion.div
              className="fixed inset-x-4 bottom-0 z-50 flex justify-center max-w-[361px] mx-auto outline-none md:mx-auto md:w-full pointer-events-none"
              // initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 1.62, ease: EASE_OUT }}
              // style={
              //   {
              //     '--initial-transform': 'calc(100% + 8px)',
              //   } as React.CSSProperties
              // }
            >
              {/* This is the "sheet" we animate with layout, with rounded edges + max-w-lg */}
              <motion.div
                layout="size"
                layoutAnchor={{ x: 0.5, y: 1 }}
                layoutRoot
                transition={{ layout: { duration: 2.12, ease: EASE_OUT } }}
                className="pointer-events-auto h-full mb-4 rounded-2xl overflow-hidden border border-border/60 bg-background/95 shadow-lg shadow-black/40 backdrop-blur-md"
              >
                <div className="px-4 pt-3 pb-4">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <button
                      type="button"
                      onClick={goToMenu}
                      disabled={view === 'menu'}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground/80 hover:bg-muted/70 hover:text-foreground transition-colors disabled:opacity-0 disabled:pointer-events-none"
                    >
                      <span>←</span>
                      <span>Back</span>
                    </button>
                    <Drawer.Close asChild>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
                      >
                        ✕
                      </button>
                    </Drawer.Close>
                  </div>

                  {/* Animated title + description */}
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.66, ease: EASE_OUT }}
                      className="mt-2 space-y-1"
                    >
                      <Drawer.Title className="text-base font-semibold tracking-tight">
                        {view === 'menu' && 'Options'}
                        {view === 'profile' && 'Profile preferences'}
                        {view === 'billing' && 'Billing overview'}
                      </Drawer.Title>
                      <Drawer.Description className="text-xs leading-relaxed">
                        {view === 'menu' &&
                          'Choose what you’d like to do next. Each option slides into place without drama.'}
                        {view === 'profile' &&
                          'Adjust how you appear to others. We keep the motion gentle so the settings stay readable.'}
                        {view === 'billing' &&
                          'Review your plan and invoices in a calm, condensed layout.'}
                      </Drawer.Description>
                    </motion.div>
                  </AnimatePresence>

                  {/* Height-animating content area */}
                  {/*<motion.div
                    layout="size"
                    transition={{ layout: { duration: 2.66, ease: EASE_OUT } }}
                    className="mt-3"
                  >*/}
                  <AnimatePresence mode="popLayout">
                    {view === 'menu' && (
                      <motion.div
                        key="menu"
                        layout
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="initial"
                        className="flex flex-col gap-2.5"
                      >
                        <motion.button
                          layout
                          variants={itemVariants}
                          type="button"
                          onClick={() => handleSelect('profile')}
                          className="group flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3.5 py-3 text-left shadow-sm transition-colors hover:border-border hover:bg-muted/60"
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px]">
                            🔒
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              View private details
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Profile, presence, and identity.
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          layout
                          variants={itemVariants}
                          type="button"
                          onClick={() => handleSelect('billing')}
                          className="group flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3.5 py-3 text-left shadow-sm transition-colors hover:border-border hover:bg-muted/60"
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px]">
                            ☐
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              View billing
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Plan, usage, and invoices.
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          layout
                          variants={itemVariants}
                          type="button"
                          onClick={handleCancel}
                          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/5 px-3.5 py-3 text-left text-xs text-red-500 transition-colors hover:bg-red-500/10"
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-[11px]">
                            ⚠
                          </span>
                          <div className="flex-1">
                            <div className="text-xs font-medium">
                              Cancel / reset
                            </div>
                            <div className="text-[11px] text-red-400">
                              Returns to the initial menu.
                            </div>
                          </div>
                        </motion.button>
                      </motion.div>
                    )}

                    {view === 'profile' && (
                      <motion.div
                        key="profile"
                        layout
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="initial"
                        className="flex flex-col gap-3"
                      >
                        <motion.div
                          layout
                          variants={itemVariants}
                          className="rounded-xl border border-border/60 bg-background px-3.5 py-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium">
                                Display name
                              </span>
                              <span className="text-xs text-muted-foreground">
                                How your name appears across workspaces.
                              </span>
                            </div>
                            <motion.div
                              className="h-8 w-20 rounded-full bg-muted/80"
                              initial={{ opacity: 0.7, y: 1 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: EASE_OUT }}
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          layout
                          variants={itemVariants}
                          className="rounded-xl border border-border/60 bg-background px-3.5 py-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium">
                                Status
                              </span>
                              <span className="text-xs text-muted-foreground">
                                A small line that follows you around the
                                product.
                              </span>
                            </div>
                            <motion.div
                              className="h-7 w-16 rounded-full bg-muted/80"
                              initial={{ opacity: 0.7, y: 1 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                ease: EASE_OUT,
                                delay: 0.03,
                              }}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {view === 'billing' && (
                      <motion.div
                        key="billing"
                        layout
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="initial"
                        className="flex flex-col gap-3"
                      >
                        <motion.div
                          layout
                          variants={itemVariants}
                          className="rounded-xl border border-border/60 bg-background px-3.5 py-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium">
                                Current plan
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Pro · Billed yearly
                              </span>
                            </div>
                            <motion.span
                              className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.97 }}
                              transition={{ duration: 0.18, ease: EASE_OUT }}
                            >
                              Active
                            </motion.span>
                          </div>
                        </motion.div>

                        <motion.div
                          layout
                          variants={itemVariants}
                          className="rounded-xl border border-dashed border-border/60 bg-background/80 px-3.5 py-3 text-xs text-muted-foreground"
                        >
                          Invoices, credits, and tax details live here. The
                          layout height shifts with you, but the motion stays
                          quiet.
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/*</motion.div>*/}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between gap-2 py-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <Drawer.Close asChild>
                      <Button type="button" size="sm" className="text-xs">
                        Done
                      </Button>
                    </Drawer.Close>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
