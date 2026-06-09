// app/components/DynamicVaulDrawer.tsx
'use client'

import * as React from 'react'
import { Drawer } from 'vaul'
import { motion } from 'motion/react'
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

interface IDrawer {
  children: React.ReactNode
  renderContent: () => React.ReactNode
}
export function DynamicVaulDrawer({ children, renderContent }: IDrawer) {
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
        <Drawer.Trigger asChild>{children}</Drawer.Trigger>

        <Drawer.Portal>
          {/* Subtle overlay so content behind is still visible */}
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />

          <Drawer.Content asChild>
            {/* Outer positioner, not animated in height (just placement) */}
            <motion.div
              className="fixed inset-x-4 bottom-0 z-50 flex justify-center max-w-md min-w-md mx-auto outline-none md:w-full pointer-events-none"
              // initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 1.62, ease: EASE_OUT }}
              style={
                {
                  '--initial-transform': 'calc(100% + 8px)',
                } as React.CSSProperties
              }
            >
              {/* This is the "sheet" we animate with layout, with rounded edges + max-w-lg */}
              <motion.div
                layout="size"
                layoutAnchor={{ x: 0.5, y: 1 }}
                layoutRoot
                transition={{ layout: { duration: 2.12, ease: EASE_OUT } }}
                className="pointer-events-auto h-full min-w-md mb-4 rounded-2xl overflow-hidden border border-border/60 bg-background/95 shadow-lg shadow-black/40 backdrop-blur-md"
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

                  {renderContent()}
                </div>
              </motion.div>
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
