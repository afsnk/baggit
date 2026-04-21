import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { ArrowBigUp, ArrowUpRight } from 'lucide-react'

type LogoType = {
  src: string
  alt: string
  isInvertable?: boolean
}

type TileData = {
  row: number
  col: number
  logo?: LogoType
}

export function Integrations() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 p-4 md:grid-cols-2 md:items-center">
      {/* Left Content */}
      <div className="max-w-xl space-y-5">
        <h2 className="font-medium text-3xl text-foreground tracking-tight sm:text-4xl md:text-5xl">
          Seamless Integration
        </h2>
        <p className="text-lg text-muted-foreground leading-6">
          With multiple blockchain, stablecoin support start invoicing in crypto
          today.
        </p>
        <Button size="lg" asChild variant="outline" className="mt-4">
          <Link to="/docs" className="block ">
            Explore integration <ArrowUpRight />
          </Link>
        </Button>
      </div>

      {/* Right Content - Visual */}
      <div className="place-items-end">
        <div className="mask-[radial-gradient(ellipse_at_center,black,black,transparent)] relative size-90">
          {tiles.map((tile) => (
            <IntegrationCard key={`${tile.row}_${tile.col}`} {...tile} />
          ))}
        </div>
      </div>
    </div>
  )
}

function IntegrationCard({ row, col, logo }: TileData) {
  return (
    <div
      className={cn(
        'absolute flex size-18 items-center justify-center rounded-md border',
        logo
          ? 'bg-card shadow-xs dark:bg-card/60'
          : 'bg-secondary/30 dark:bg-background', // Styling for empty tiles
      )}
      style={{
        left: col * 72, // 72px cell
        top: row * 72,
      }}
    >
      {logo && (
        <img
          alt={logo.alt}
          className={cn(
            'pointer-events-none size-8 select-none object-contain p-1',
            logo.isInvertable && 'dark:invert',
          )}
          height={40}
          src={logo.src}
          width={40}
        />
      )}
    </div>
  )
}

// Coordinate mapping to approximate the "scattered" look in the image.
// Grid 5x5.
const tiles: TileData[] = [
  // Row 0
  {
    row: 0,
    col: 1,
  },
  {
    row: 0,
    col: 3,
    logo: {
      src: '/assets/blockchain/arbitrium.jpeg',
      alt: 'Arbitrium blockchain Logo',
    },
  },

  // Row 1
  { row: 1, col: 0 }, // Empty
  {
    row: 1,
    col: 2,
    logo: {
      src: '/assets/blockchain/optimism.svg',
      alt: 'Optimism blockchain Logo',
      isInvertable: true,
    },
  },
  {
    row: 1,
    col: 4,
    logo: {
      src: '/assets/token/bitcoin.svg',
      alt: 'Bitcoin Logo',
      isInvertable: false,
    },
  },

  // Row 2
  {
    row: 2,
    col: 1,
    logo: {
      src: '/assets/blockchain/base.jpeg',
      alt: 'Base blockchain Logo',
      isInvertable: false,
    },
  },
  {
    row: 2,
    col: 3,
    logo: {
      src: '/assets/token/usdc.png',
      alt: 'USDC Logo',
    },
  }, // Empty

  // Row 3

  { row: 3, col: 0 }, // Empty
  {
    row: 3,
    col: 2,
    logo: {
      src: '/assets/token/usdt.svg',
      alt: 'USD Tether Logo',
    },
  },
  {
    row: 3,
    col: 4,
    logo: {
      src: '/assets/blockchain/binance.svg',
      alt: 'Binance exchange Logo',
    },
  },

  // Row 4
  {
    row: 4,
    col: 1,
    logo: {
      src: '/assets/token/solana.svg',
      alt: 'Solana Logo',
    },
  },
  {
    row: 4,
    col: 3,
    logo: {
      src: '/assets/blockchain/ethereum.svg',
      alt: 'Ethereum blockchain Logo',
      isInvertable: true,
    },
  },
]
