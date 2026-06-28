import { Input } from '#/components/ui/input'
import type React from 'react'
import { DynamicVaulDrawer } from './dynamic-vaul-drawer'
import { AnimatePresence, motion } from 'motion/react'
import { Drawer } from 'vaul'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import { IdCard, UserCircle } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

interface KYCModal {
  children: React.ReactNode
}
const steps = [0, 1, 2]
export function KYCModal({ children }: KYCModal) {
  // Global and all state management
  const [step, setSteps] = useState(steps)

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
            {/* Animated title + description */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`kyc-step-0`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'linear' }}
                className="mt-2 space-y-1"
              >
                <Drawer.Title className="text-base font-semibold tracking-tight">
                  KYC Identity
                </Drawer.Title>
                <Drawer.Description className="text-sm leading-relaxed mb-3 text-muted-foreground">
                  Takes only 2 minute to complete and continue trading
                </Drawer.Description>
              </motion.div>
            </AnimatePresence>

            {/* Height-animating content area */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key="entry"
                layout
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className="flex flex-col gap-2.5"
              >
                <ItemGroup className="gap-2">
                  <Item variant="muted">
                    <ItemMedia variant="icon">
                      <UserCircle />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Bio data</ItemTitle>
                      <ItemDescription>
                        Enter basic bio data: DOB, Nationality, etc.
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                  <Item variant="muted">
                    <ItemMedia variant="icon">
                      <IdCard />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Select government issueed ID</ItemTitle>
                      <ItemDescription>
                        Input valid government ID number
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </ItemGroup>
              </motion.div>
            </AnimatePresence>

            <Tooltip>
              <TooltipTrigger className="w-full">
                <Button
                  className="text-blue-500 w-full items-center my-3"
                  variant="link"
                >
                  Continue as Anonymous
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="max-w-xs text-balance text-center">
                  Choosing to carry on as anonymous user will lock your maximum
                  amount to only $1000/transaction
                </p>
              </TooltipContent>
            </Tooltip>

            <motion.div
              className="w-full mt-4"
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.96 }}
            >
              <Button size="lg" className="w-full">
                Continue
              </Button>
            </motion.div>
          </div>
        )
      }}
    >
      {children}
    </DynamicVaulDrawer>
  )
}
