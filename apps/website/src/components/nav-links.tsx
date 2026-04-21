import type { LinkItemType, MainNavItemType } from '#/components/sheard'
import {
  IconBasketDollar,
  IconWallet,
  IconWalletOff,
} from '@tabler/icons-react'
import {
  GlobeIcon,
  LayersIcon,
  UserPlusIcon,
  BarChart3Icon,
  PlugIcon,
  CodeIcon,
  UsersIcon,
  StarIcon,
  HandshakeIcon,
  FileTextIcon,
  ShieldIcon,
  RotateCcwIcon,
  LeafIcon,
  HelpCircleIcon,
  Wallet,
} from 'lucide-react'

export const productLinks: LinkItemType[] = [
  {
    label: 'Website Builder',
    href: '/sell',
    description: 'Create responsive websites with ease',
    icon: <GlobeIcon />,
  },
  {
    label: 'Cloud Platform',
    href: '#',
    description: 'Deploy and scale apps in the cloud',
    icon: <LayersIcon />,
  },
  {
    label: 'Team Collaboration',
    href: '#',
    description: 'Tools to help your teams work better together',
    icon: <UserPlusIcon />,
  },
  {
    label: 'Analytics',
    href: '#',
    description: 'Track and analyze your website traffic',
    icon: <BarChart3Icon />,
  },
  {
    label: 'Integrations',
    href: '#',
    description: 'Connect your apps and services',
    icon: <PlugIcon />,
  },
  {
    label: 'API',
    href: '#',
    description: 'Build custom integrations with our API',
    icon: <CodeIcon />,
  },
]

export const companyLinks: LinkItemType[] = [
  {
    label: 'About Us',
    href: '#',
    description: 'Learn more about our story and team',
    icon: <UsersIcon />,
  },
  {
    label: 'Customer Stories',
    href: '#',
    description: "See how we've helped our clients succeed",
    icon: <StarIcon />,
  },
  {
    label: 'Partnerships',
    href: '#',
    icon: <HandshakeIcon />,
    description: 'Collaborate with us for mutual growth',
  },
]

export const companyLinks2: LinkItemType[] = [
  {
    label: 'Terms of Service',
    href: '#',
    icon: <FileTextIcon />,
  },
  {
    label: 'Privacy Policy',
    href: '#',
    icon: <ShieldIcon />,
  },
  {
    label: 'Refund Policy',
    href: '#',
    icon: <RotateCcwIcon />,
  },
  {
    label: 'Blog',
    href: '#',
    icon: <LeafIcon />,
  },
  {
    label: 'Help Center',
    href: '#',
    icon: <HelpCircleIcon />,
  },
]

export const mainNavLinks: MainNavItemType[] = [
  {
    label: 'Buy crypto',
    subItems: [
      {
        label: 'Buy crypto',
        href: '/buy',
        description:
          'Buy crypto easily with bank transfer and other payment methods coming soon',
        icon: <IconBasketDollar />,
      },
      {
        label: 'Buy USDT',
        href: '/buy/usdt',
        icon: <img src="/assets/token/usdt.svg" className="size-4" />,
      },
      {
        label: 'Buy USDC',
        href: '/buy/usdc',
        icon: <img src="/assets/token/usdc.png" className="size-4" />,
      },
      // {
      //   label: 'Buy BTC',
      //   href: '/buy/btc',
      //   icon: <img src="/assets/token/bitcoin.svg" className="size-4" />,
      // },
      // {
      //   label: 'Buy Solana',
      //   href: '/buy/solana',
      //   icon: <img src="/assets/token/solana.svg" className="size-4" />,
      // },
    ],
  },
  {
    label: 'Sell crypto',
    subItems: [
      {
        label: 'Sell crypto',
        href: '/sell',
        description:
          'Sell crypto easily with competitive rates, instantly receive funds',
        icon: <Wallet />,
      },
      {
        label: 'Sell USDT',
        href: '/sell/usdt',
        icon: <img src="/assets/token/usdt.svg" className="size-4" />,
      },
      {
        label: 'Sell USDC',
        href: '/sell/usdc',
        icon: <img src="/assets/token/usdc.png" className="size-4" />,
      },
      // {
      //   label: 'Sell BTC',
      //   href: '/sell/btc',
      //   icon: <img src="/assets/token/bitcoin.svg" className="size-4" />,
      // },
      // {
      //   label: 'Sell solana',
      //   href: '/sell/solana',
      //   icon: <img src="/assets/token/solana.svg" className="size-4" />,
      // },
    ],
  },
]
