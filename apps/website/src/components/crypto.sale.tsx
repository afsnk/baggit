import { ArrowUpRight } from 'lucide-react'
import MarketStats, { StatCard, StatsDisplay } from './market.stats'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from './ui/item'

interface CryptoSaleProps {
  token: string
  symbol: string
  icon: string
  action: 'buy' | 'sell'
}
export default function CryptoSale({
  token,
  symbol,
  icon,
  action,
}: CryptoSaleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3">
      <div className="flex flex-col items-start space-y-5">
        <Badge className="space-x-3 bg-primary max-h-10">
          <img
            className="size-5"
            src={icon}
            alt="token-icon"
            data-icon="inline-start"
          />
          {token}
          {symbol}
        </Badge>
        <h1 className="md:text-3xl text-balance line-clamp-2 font-bold font-sans">
          {action === 'buy' ? 'Buying' : 'Selling'} {token} made simple
        </h1>
        <p className="text-sm font-medium">
          Baggit.link offers a fast and easy way to {action} {token} ({symbol})
          with a credit or debit card, bank transfer, Apple Pay, Google Pay, and
          more.
        </p>
        <div className="w-full">
          <h3 className="font-medium text-sm">
            How to {action} {token} in 3 simple steps
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Card className="relative pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>
                  Enter how much {token} you want to {action}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>Pay</CardTitle>
                <CardDescription>
                  Pay using one of 40+ payment methods.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative pt-0">
              <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
              <img
                src="https://avatar.vercel.sh/shadcn1"
                alt="Event cover"
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
              />
              <CardHeader>
                <CardTitle>Receive</CardTitle>
                <CardDescription>
                  Receive the Bitcoin in your wallet.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        <div className="w-full">
          <h3 className="font-medium text-sm">Payment methods in Denmark</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Card',
              'PayPal',
              'Bank transfer',
              'Apple Pay',
              'Google Pay',
              'Revolut Pay',
              'Rapid Transfer',
              '2+ More',
            ].map((item) => (
              <Badge asChild key={item}>
                <Button size="xs">{item}</Button>
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p>
            Have you ever wondered what this magic internet money called Bitcoin
            is? As an asset worth over 1 trillion dollars and the most popular
            cryptocurrency, it’s worth considering as an alternative to gold for
            storing your wealth and unlocking the world of financial freedom.
          </p>{' '}
          <h3>What is Bitcoin?</h3>{' '}
          <p>
            Bitcoin is the first-ever cryptocurrency to be created by an unknown
            entity under the pseudonym of Satoshi Nakamoto. There is no clear
            evidence supporting the thesis whether it’s an individual or a group
            of people. The Bitcoin whitepaper, explaining the basic principles
            under which the network would operate, was released in the middle of
            the financial crisis of 2008. Then, the first block, known as the
            Genesis Block, was mined by Satoshi at the beginning of 2009. The
            block contained a message about a bailout for banks, which
            highlighted the antisystemic approach.
          </p>{' '}
          <p>
            Nowadays, Bitcoin is used by millions of people and is considered a
            scarce commodity. To get there it had to survive many events in its
            early days, which put the network to a test, such as the hack of a
            Japanese crypto exchange, Mt. Gox.
          </p>{' '}
          <h3>Why use Bitcoin?</h3>{' '}
          <p>
            Bitcoin at first was made to be a peer-to-peer decentralized
            currency, but its status changed to a store of value due to its
            inability to adapt without the help of layer 2 solutions like the
            Lightning Network. As of now, it serves more as a store of value
            than money used for transactions.
          </p>{' '}
          <p>
            Bitcoin is unique due to its limited supply, which consists of 21
            million units, each divided into 100 million satoshis. The inflation
            rate decreases every 4 years thanks to events known as halvings,
            which slash the production of new Bitcoins by half. The entire
            supply is expected to be mined by the year of 2140.
          </p>{' '}
          <p>
            The entire network is decentralized and permissionless. There is no
            need for any intermediary, and you don’t need anyone’s
            permission—you are in control of your money. You can send small and
            large amounts of money and get the transaction confirmed within 10
            minutes in exchange for a couple of dollars. Bitcoin is borderless,
            so you can send and receive money from anyone around the world. The
            best part? Nobody can stop that.
          </p>{' '}
          <h3>How Bitcoin works.</h3>{' '}
          <p>
            Bitcoin was built on top of blockchain technology. As a result, the
            Bitcoin network is a public distributed ledger, which is transparent
            by design. The blockchain is pseudoanonymous—the addresses that are
            used to transact don’t reveal any personal information unless they
            are linked to your identity, in which case the transactions are
            traceable.
          </p>{' '}
          <p>
            In order for a transaction to be confirmed and included in a block,
            it has to be added to a queue also referred to as a mempool.
            Transactions with a higher fee are in front of the ones with a lower
            fee. The next block is being filled with transactions until it runs
            out of space (around 4MB). Then the process of miners competing to
            find the solution to the complex cryptographic problem unique to
            each block starts. The entity to solve it first gets the block
            reward, which at the time of speaking is 3.125 coins, and has the
            right to add the block to the record.
          </p>{' '}
          <h3>Bitcoin's timeline</h3>{' '}
          <p>
            From an experiment, Bitcoin has grown into a renowned asset. The
            concept of a decentralized network was published in 2008, and the
            network launched in the following year. Soon, the first real-world
            transaction took place, when someone bought 2 pizzas for 10,000 BTC.
            Since then Bitcoin has experienced successes and failures. It has
            continued to appreciate as an asset but has experienced events like
            the hack of Mt. Gox and China's ban on crypto. Institutions started
            to catch up, and Microstrategy became the most talked about to
            implement a Bitcoin treasury, thus making its stock more valuable.
            In 2021 El Salvador became the first country to ever adopt Bitcoin
            as a legal tender. As of now, multiple Bitcoin ETFs are tradeable on
            the NYSE, and many institutions are considering adopting the Bitcoin
            standard.
          </p>{' '}
          <h3>The risks of Bitcoin</h3>{' '}
          <p>
            Despite all the advantages it possesses, there are some drawbacks
            involved. It has been around for some time—it's the oldest
            cryptocurrency, after all. However, compared to other more
            traditional assets, it seems risky, is relatively new, and many
            argue that we can’t be sure how the price reacts when the recession
            materializes. There are no doubts this statement is justified since
            Bitcoin was created after the financial crisis and has only been in
            a period of quantitative easing.
          </p>{' '}
          <h3>Why Bitcoin matters</h3>{' '}
          <p>
            Bitcoin is an important breakthrough as it takes away control from
            banks and makes them less relevant. In contrast, it empowers
            individuals by giving them sound money they can really own—the kind
            of money that holds its value, is scarce so everybody wants it, and
            enables individuals to transact freely. This is why it’s important,
            because it’s a revolution in the way we think about money and
            storing value. It resembles gold, but is digital and easily
            divisible.
          </p>
        </div>
        <MarketStats
          symbol={symbol}
          title="USDT (USDT) market stats"
          description="USDT is priced at 76,601.30 EUR, up 0.37% in the last 24 hours, with a trading volume of 97.44B EUR. As the #1 cryptocurrency by market cap, USDT's total valuation stands at 1.78T EUR (57.84% dominance), based on a circulating supply of 19.95M."
        >
          <StatsDisplay columns={2}>
            <StatCard label="Price" value="76,601.30 EUR" variant="highlight" />
            <StatCard
              label="Market cap"
              value="1.78T EUR"
              variant="highlight"
            />
            <StatCard
              label="Volume (24h)"
              value="97.44B EUR"
              variant="highlight"
            />
            <StatCard label="Circulation" value="19.95M" variant="highlight" />
          </StatsDisplay>
        </MarketStats>
        <MarketStats
          symbol={symbol}
          title="USDT (USDT) price, charts and statistics"
          description="Check the current USDT price, detailed charts, and key market statistics. Stay updated with real-time data to track USDT's performance and market trends."
        >
          <div className="flex">
            <Button asChild variant="link">
              <a href={`#`} className="no-undeline">
                Explorer
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="link">
              <a href={`#`}>
                Sell {symbol} <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </MarketStats>
        <MarketStats
          symbol={symbol}
          title="Relevant resources for USDT"
          description="Access relevant resources such as USDT's website or whitepaper to help you better understand its purpose and shed some light on the future of the project."
        >
          <div className="flex">
            <Button asChild variant="link">
              <a href={`#`} className="no-undeline">
                Website
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="link">
              <a href={`#`}>
                whitepaper <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </MarketStats>
      </div>
      <div className="sticky top-18 self-start flex flex-col">
        <Card className="w-full max-w-sm py-2">
          <CardContent className="px-2">
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Basic Item</ItemTitle>
                <ItemDescription>
                  A simple item with title and description.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm">
                  Action
                </Button>
              </ItemActions>
            </Item>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Continue
            </Button>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
