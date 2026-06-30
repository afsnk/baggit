import { DrawerDescription, DrawerTitle } from '#/components/DynamicDrawer'
import { DynamicVaulDrawer } from './dynamic-vaul-drawer'
import { AnimatePresence, motion } from 'motion/react'
import { Drawer } from 'vaul'

interface ProviderModalProps {
  children: React.ReactNode
}

export function ProviderModal({ children }: ProviderModalProps) {
  return (
    <DynamicVaulDrawer
      renderContent={() => {
        const containerVariants = {
          initial: {},
          animate: {
            transition: {
              staggerChildren: 0.02,
              delayChildren: 0.06,
            },
          },
        }

        const EASE_OUT = [0.23, 1, 0.32, 1] as const
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

        return (
          <div className="w-full">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`provider-header`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'linear' }}
                className="mt-2 space-y-1"
              >
                <DrawerTitle>Pick transaction route</DrawerTitle>
                <DrawerDescription>
                  Enter details to start processing the transaction
                </DrawerDescription>
              </motion.div>
            </AnimatePresence>
          </div>
        )
      }}
    >
      {children}
    </DynamicVaulDrawer>
  )
}
