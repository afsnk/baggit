import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Drawer } from 'vaul'
import { Input } from '#/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { cn } from '#/lib/utils'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { DynamicVaulDrawer } from './dynamic-vaul-drawer'
import { AnimatePresence, motion } from 'motion/react'
import {
  renderAsset,
  type IAsset,
  type IAssetsRender,
  type INetwork,
} from './asset-toggle'
import { useReducer, useState, type ChangeEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'

const assets: IAssetsRender[] = [
  {
    name: 'USD Tether',
    symbol: 'usdt',
    icon: `/assets/token/usdt.svg`,
    networks: [
      {
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        description: 'Layer 1 Chain for the Binance CEX',
      },
      {
        name: 'Base',
        symbol: 'BASE',
        description: 'Layer 2 Ethereum chain for fast settlement times',
      },
    ],
  },
  {
    name: 'USDC (Circle)',
    symbol: 'usdc',
    icon: `assets/token/usdc.png`,
    networks: [
      {
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        description: 'Layer 1 Chain for the Binance CEX',
      },
      {
        name: 'Base',
        symbol: 'BASE',
        description: 'Layer 2 Ethereum chain for fast settlement times',
      },
    ],
  },
]

export default function ExchangeCard({
  defaultMode = 'buy',
  layout = 'compact',
}: {
  defaultMode: 'buy' | 'sell'
  layout: 'compact' | 'full'
}) {
  return (
    <div className="grid w-full">
      <AssetConfig mode={defaultMode} layout={layout} />
    </div>
  )
}
const defaultInputStyle = `md:text-4xl text-6xl border-none outline-0 focus-visible:border-none focus-visible:ring-0 p-2 focus:bg-white/30 darK:bg-transparent h-auto`

function AssetConfig({
  mode,
  layout,
}: {
  mode: 'sell' | 'buy'
  layout: 'compact' | 'full'
}) {
  const navigate = useNavigate({ from: `/${mode}` })
  const [sellAmount, setSellAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')

  const handleSellAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, '')

    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      let formatted = inputValue

      if (inputValue && inputValue !== '.') {
        const [integerPart, decimalPart] = inputValue.split('.')
        const formattedInteger = parseInt(integerPart || '0').toLocaleString()
        formatted =
          decimalPart !== undefined
            ? `${formattedInteger}.${decimalPart}`
            : formattedInteger
      }

      setSellAmount(formatted)
    }
  }

  const handleBuyAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, '')

    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      let formatted = inputValue

      if (inputValue && inputValue !== '.') {
        const [integerPart, decimalPart] = inputValue.split('.')
        const formattedInteger = parseInt(integerPart || '0').toLocaleString()
        formatted =
          decimalPart !== undefined
            ? `${formattedInteger}.${decimalPart}`
            : formattedInteger
      }

      setBuyAmount(formatted)
    }
  }

  return (
    <Tabs
      defaultValue={mode}
      className="w-full"
      onValueChange={(tab) => {
        navigate({ to: `/${tab}` })
      }}
    >
      <div className="flex items-center justify-between w-full">
        <TabsList className={cn({ hidden: layout === 'compact' })}>
          <TabsTrigger value="sell">Sell</TabsTrigger>
          <TabsTrigger value="buy">Buy</TabsTrigger>
        </TabsList>
        <div>
          {/*Hidden settings button because of global menu button, replace with more relevant component*/}
          <Button size="icon-sm" className="hidden">
            <Settings className="size-4 text-primary-foreground" />
          </Button>
        </div>
      </div>
      <TabsContent value="sell">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="capitalize">{mode}</span> token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full flex gap-3">
              <Input
                type="text"
                inputMode="numeric"
                value={sellAmount}
                onChange={handleSellAmountChange}
                className={cn(
                  defaultInputStyle,
                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                )}
              />
              <AssetToggle mode={mode} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="buy">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="capitalize">{mode}</span> token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full flex gap-3">
              <Input
                type="text"
                inputMode="numeric"
                value={buyAmount}
                onChange={handleBuyAmountChange}
                className={cn(
                  defaultInputStyle,
                  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                )}
              />
              <AssetToggle mode={mode} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function AssetToggle({ mode }: { mode: 'buy' | 'sell' }) {
  const [state, dispatch] = useReducer(
    (
      state,
      action:
        | { type: 'SELECT_ASSET'; payload: IAsset }
        | { type: 'SELECT_NETWORK'; payload: INetwork },
    ) => {
      switch (action.type) {
        case 'SELECT_ASSET':
          return { ...state, asset: action.payload }
        case 'SELECT_NETWORK':
          return { ...state, network: action.payload }
        default:
          return state
      }
    },
    {
      asset: assets[0] as IAsset,
      network: assets[0].networks[0] as INetwork,
    },
  )

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
          <>
            {/* Animated title + description */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${mode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: 'linear' }}
                className="mt-2 space-y-1"
              >
                <Drawer.Title className="text-base font-semibold tracking-tight capitalize">
                  {!state.asset && 'Pick asset'}
                  {state.asset &&
                    state.network &&
                    `${mode} ${state.asset.name} on ${state.network.name}`}
                </Drawer.Title>
                <Drawer.Description className="text-sm leading-relaxed mb-3 text-muted-foreground">
                  Select asset and network to trade on
                </Drawer.Description>
              </motion.div>
            </AnimatePresence>

            {/* Height-animating content area */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key="menu"
                layout
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className="flex flex-col gap-2.5"
              >
                {assets.map((asset) => renderAsset(asset, state, dispatch))}
                {/*(
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
                      <div className="text-sm font-medium">View billing</div>
                      <div className="text-xs text-muted-foreground">
                        Plan, usage, and invoices.
                      </div>
                    </div>
                  </motion.button>
              ))}*/}
              </motion.div>
            </AnimatePresence>
            {/*</motion.div>*/}

            {/* Footer actions */}
            {/*<div className="flex items-center justify-between gap-2 py-4">
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
          </div>*/}
          </>
        )
      }}
    >
      <Button
        size="icon-lg"
        className="aspect-square size-12 group"
        variant="outline"
      >
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          <ChevronUp className="absolute rotate-45 right-0 top-0 text-gray-600 group-hover:text-white transition-colors" />
          <img
            src={state.asset.icon}
            className="m-0! size-6 bg-cover object-contain rounded-full"
          />
          <ChevronDown className="absolute rotate-45 left-0 bottom-0 text-gray-600 group-hover:text-white transition-colors" />
        </div>
      </Button>
    </DynamicVaulDrawer>
  )
}

export const IconTransfer = ({ className }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      'icon icon-tabler icons-tabler-outline icon-tabler-transfer',
      className,
    )}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M20 10h-16l5.5 -6" />
    <path d="M4 14h16l-5.5 6" />
  </svg>
)
