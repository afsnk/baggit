import type { LinkItemType, MainNavItemType } from '#/components/sheard'
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
        icon: <Wallet />,
      },
      {
        label: 'Buy USDT',
        href: '/buy/usdt',
      },
      {
        label: 'Buy USDC',
        href: '/buy/usdc',
      },
      {
        label: 'Buy BTC',
        href: '/buy/btc',
      },
      {
        label: 'Buy cNGN',
        href: '/buy/cngn',
      },
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
      },
      {
        label: 'Sell USDC',
        href: '/sell/usdc',
      },
      {
        label: 'Sell BTC',
        href: '/sell/btc',
      },
      {
        label: 'Sell cNGN',
        href: '/sell/cngn',
      },
    ],
  },
]
