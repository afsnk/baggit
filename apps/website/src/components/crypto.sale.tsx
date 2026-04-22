import { ArrowUpRight } from 'lucide-react'
import MarketStats, { StatCard, StatsDisplay } from '#/components/market.stats'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter } from './ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from './ui/item'
import { FaqsSection } from './faqs-section'
import { useLoaderData } from '@tanstack/react-router'
import { formatNumber } from '#/lib/utils'
import type { Asset } from '#/lib/types'

interface CryptoSaleProps {
  token: string
  symbol: Exclude<Asset, 'bitcoin' | 'solana'>
  action: 'buy' | 'sell'
  icon?: string
}

const buySteps: Array<{ title: string; description: string; url: string }> = [
  {
    title: 'Select Asset',
    description: 'Pick crypto asset and enter how much',
    url: '/assets/steps/buy/select-asset-step.svg',
  },
  {
    title: 'Pay Your Way',
    description: 'Pay using one of the many payment methods',
    url: '/assets/steps/buy/pay-asset-step.png',
  },
  {
    title: 'Receive to your address',
    description: 'Receive the crypto asset in your wallet',
    url: '/assets/steps/buy/receive-asset-step.svg',
  },
]
const sellSteps: Array<{ title: string; description: string; url: string }> = [
  {
    title: 'Select Currency',
    description: 'Choose which currency you want to receive and how much.',
    url: '/assets/steps/sell/sellect-currency-step.png',
  },
  {
    title: 'Send Asset',
    description: 'Send the crypto asset to the provided deposit address',
    url: '/assets/steps/sell/send-crypto-step.png',
  },
  {
    title: 'Receive funds',
    description: 'Receive the money in your bank account',
    url: '/assets/steps/sell/receive-fund-step.png',
  },
]

const steps = {
  buy: buySteps,
  sell: sellSteps,
}

export default function CryptoSale({
  token,
  symbol,
  icon,
  action,
}: CryptoSaleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-3">
      <div className="flex flex-col items-start space-y-5 p-4 md:p-0!">
        {icon && (
          <Badge className="flex items-center justify-center gap-2 bg-primary max-h-10 animate-in">
            <img
              className="size-5 rounded-full overflow-hidden"
              src={icon}
              alt="token-icon"
              data-icon="inline-start"
            />
            {token}
            <span className="text-muted">{symbol.toUpperCase()}</span>
          </Badge>
        )}
        <h1 className="md:text-3xl text-balance line-clamp-2 font-bold font-sans">
          {action === 'buy' ? 'Buying' : 'Selling'} {token} made simple
        </h1>
        <p className="text-sm font-medium">
          Baggit.link offers a fast and easy way to {action} {token} ({symbol})
          with a credit or debit card, bank transfer, and more.
        </p>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="md:hidden flex my-3 capitalize"
        >
          <a href={`#buy-frame`}>
            {action} {token} <ArrowUpRight className="size-4" />
          </a>
        </Button>
        <div className="w-full">
          <h3 className="font-semibold md:font-medium text-xl md:text-sm">
            How to {action} {token} in 3 simple steps
          </h3>
          <ItemGroup className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {steps[action].map((step) => (
              <Item className="relative pt-0" key={step.title} variant="muted">
                <ItemHeader>
                  <img
                    src={step.url}
                    alt={step.title}
                    className="relative z-20 aspect-video w-full object-contain invert brightness-60 dark:brightness-40"
                  />
                </ItemHeader>
                <ItemContent>
                  <ItemTitle>{step.title}</ItemTitle>
                  <ItemDescription>{step.description}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
        <div className="w-full">
          <h3 className="font-semibold md:font-medium text-xl md:text-sm">
            Payment methods
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Card', 'Bank transfer', 'Rapid Transfer', 'More soon'].map(
              (item) => (
                <Badge asChild key={item}>
                  <Button size="xs">{item}</Button>
                </Badge>
              ),
            )}
          </div>
        </div>
        {tokenContent[symbol]({ symbol, action })}
      </div>
      <div className="sticky top-18 self-start flex flex-col" id="buy-frame">
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

const tokenContent = {
  crypto: () => (
    <>
      <div>
        <p>
          With the origins of Bitcoin, the world witnessed a new paradigm shift.
          Banking isn’t the only option now—a new type of money has emerged. An
          alternative providing decentralization, peer-to-peer transactions, and
          transparency. It was created for the people—especially those affected
          by the financial crisis of ‘08. Let’s see why and how this new asset
          class reshapes the world as we know it.
        </p>{' '}
        <h3>What is cryptocurrency?</h3>
        <p>
          The concept of cryptocurrency can’t be explained without diving into
          the origins of money. At first, when money as we know it didn’t exist,
          people used to exchange one good for another—this was called barter
          trade. The cons could be easily seen, which is why coinage was
          introduced. When transacting, you either received or gave coins in
          exchange for a good or service. Carrying all the money wasn’t safe and
          convenient at all—this is when paper money enters the circulation.
          Originally, gold coins were held in a bank, and a customer could
          deposit or withdraw them with paper money as proof of ownership. It
          worked for a while, but when governments needed money to fund wars,
          they opted to print more paper money instead of increasing taxes,
          thereby diluting its value. In 1971, we officially entered the era of
          fiat money that incentivized you to spend. If you tried to save over a
          long period of time, you were screwed because of inflation. In 2008
          everything changed when Satoshi released the Bitcoin whitepaper.
        </p>
        <p>
          A cryptocurrency is a digital currency that uses cryptography and
          blockchain technology to facilitate and verify transactions. The
          purpose of a cryptocurrency is very simple—just like any traditional
          currency, it aims to serve as a medium of exchange while fixing all
          the predecessors’ flaws.
        </p>
        <h3>Why use cryptocurrencies?</h3>
        <p>
          Cryptocurrencies enable individuals around the world to be a part of
          the decentralized revolution. Blockchain networks are permissionless,
          so you don’t need to ask when sending money—you are in control of your
          assets. Most established cryptocurrencies like Bitcoin have limited
          supply, which makes them ideal for saving money in the long term.{' '}
        </p>
        <p>
          People in impoverished countries don’t have access to banking because
          of different reasons. In contrast, cryptocurrencies work everywhere
          because they are decentralized. Also, banks operate 5 days a week, but
          crypto is here 24/7. In essence, crypto is the very definition of
          freedom, but with it comes enormous responsibility.
        </p>
        <h3>How cryptocurrencies work</h3>
        <p>
          Cryptocurrencies were built on top of blockchain technology. As a
          result, a crypto network is a public distributed ledger, which is
          transparent by design. There are different types of consensus
          mechanisms across different crypto assets, but they all operate in a
          similar manner.
        </p>
        <p>
          To have access to your crypto wallet, you need a private key. It is a
          string of characters that lets you control your money. Every time you
          try to perform a transaction, you need to sign it with this key.
        </p>
        <p>
          To send crypto, enter the amount, a crypto address, and confirm. Once
          broadcasted, the transaction is added to the queue, and based on the
          fee, it will have a higher or lower priority. Miners or validators
          then add it to a block and confirm it. Bear in mind that blockchain
          cannot be altered, so every transaction is permanent and irreversible.
        </p>
        <h3>Timeline of cryptocurrencies</h3>
        <p>
          Bitcoin has paved the way for other cryptocurrencies after the Genesis
          Block in 2009. Since then, numerous coins have emerged, with Ethereum
          standing out in particular. It was an innovation enabling developers
          to build and users to experience new applications, trade tokens, and
          more. Nowadays, most cryptocurrencies leverage Ethereum’s technology
          but target different audiences. In conclusion, Bitcoin was a
          revolution, Ethereum was an evolution, and most altcoins are merely
          minor updates.
        </p>
        <h3>The risks of cryptocurrencies</h3>
        <p>
          Cryptocurrencies are a new and innovative asset class, but they
          involve many risks. While Bitcoin and Ethereum are established, many
          cryptocurrencies can vanish overnight. Although progress has been made
          towards more clarity and regulation, cryptocurrencies are much riskier
          than stocks and will probably always be. Crypto is relatively new—it
          has never experienced a recession, and it is unlikely to go up during
          bad times. On the contrary, with the introduction of spot ETFs,
          cryptocurrencies are finally available on many brokerage accounts.
          This milestone increases exposure and signifies ties between digital
          assets and traditional markets.
        </p>
        <h3>Why cryptocurrencies matter</h3>
        <p>
          Crypto isn’t without its issues, but it empowers individuals to take
          back control of their money and manage it in an intelligent way. It is
          the next form of money that is widely recognized, and assets such as
          Bitcoin will continue to appreciate provided market conditions are
          favorable.
        </p>
      </div>
      <FaqsSection
        title="FAQ's about cryptocurrencies"
        items={[
          {
            question: 'Why should I buy crypto?',
            answer:
              "Deciding whether to buy crypto is a personal choice, and it’s essential to understand that investing in any cryptocurrency comes with risks. Many people consider factors such as crypto's price, market cap, and supply, alongside their own risk tolerance, before making a decision. Swapped.com cannot provide investment advice or guarantee the value of any cryptocurrency. Always do your own research before making any purchase to ensure it aligns with your financial goals.",
            id: 'item-1',
          },
          {
            question: 'How can I buy crypto with a credit card?',
            answer:
              'Baggit.link accepts most major credit and debit cards, including VISA and MasterCard. To buy crypto, simply enter the amount you wish to purchase in crypto or your local currency, and then provide your crypto wallet address. Once that’s done, you’re ready to buy crypto with your card or preferred payment method- all securely and conveniently!',
            id: 'item-2',
          },
          {
            question: 'Can I buy crypto today and sell tomorrow?',
            answer:
              'Absolutely! You can purchase crypto today and sell it whenever you’re ready. Swapped.com offers a seamless process for buying crypto and converting it back into fiat currencies like USD or EUR.\nWhen selling, the price is locked in after your transaction has 1 confirmation on the blockchain. That usually never takes more than 30 minutes.',
            id: 'item-3',
          },
        ]}
      />
    </>
  ),
  usdt: ({ symbol, action }: { symbol: string; action: string }) => {
    const data = useLoaderData({ from: `/${action}/$asset` as any })

    return (
      <>
        <div>
          <p>
            In the cryptocurrency markets, where prices change drastically in a
            matter of minutes, a safe haven is needed to preserve the value of
            your assets. And the answer you may just be looking for is USDT—the
            first-ever stablecoin, issued by Tether Limited, which is closely
            associated with Bitfinex, a crypto exchange.
          </p>{' '}
          <h3>What is USDT?</h3>{' '}
          <p>
            USDT is classified as a stablecoin, which is a cryptocurrency
            designed to minimize and ultimately get disposed of price volatility
            by being pegged to an asset like a fiat currency, which in most
            cases is the US dollar. It plays a pivotal role in crypto by being a
            medium of exchange and a short-term store of value. Unlike
            cryptocurrencies such as Bitcoin or Ethereum, its value is mostly
            constant.
          </p>{' '}
          <p>
            Tether claims to be backed by a combination of fiat currencies, cash
            equivalents, and other assets like Bitcoin, which, in the bigger
            picture, are just a small allocation of the entire portfolio. To
            maintain its peg with the US dollar, USDT should hold a
            corresponding amount of dollars to the tokens issued.
          </p>{' '}
          <p>
            The subject of Tether has been discussed by the crypto community
            many times. That’s mainly because Tether doesn’t conduct any
            third-party audits, making it nearly impossible to estimate how much
            in assets they hold.
          </p>
          <h3>Why use USDT?</h3>{' '}
          <p>
            With all this uncertainty, you may wonder if it’s a good idea to use
            Tether. There’s a full selection of stablecoins available after all.
            Despite all these concerns, Tether is the most recognized
            stablecoin, with much more liquidity than others, and has been in
            the market longer than any other. If you’re into trading, the pair
            is mostly denominated in USDT, so there’s no way to get around it
            unless you particularly want to limit yourself to a great extent.
          </p>{' '}
          <p>
            USDT, just like USDC, is available on many platforms, including
            Ethereum and Solana. Depending on the network of your choice,
            transactions may be swift or quite slow. USDT can act as a hedging
            tool to prevent large drawdowns of your portfolio during times when
            the market goes down. It’s also programmable money, which has its
            bright and dark sides, as your address can be easily blacklisted and
            your assets frozen.
          </p>{' '}
          <h3>How USDT works.</h3>{' '}
          <p>
            USDT operates on multiple blockchain networks, each supporting smart
            contracts. USDT holds the 1:1 peg with the US dollar most of the
            time; however, deviations occur and allow market participants to get
            the most out of these arbitrage opportunites.
          </p>{' '}
          <p>
            The issuance and redemption process is very straightforward. A party
            deposits a portion of its cash reserves with Tether Limited, and
            once the deposit is verified, a corresponding amount is issued to
            the user’s wallet address. Similarly, the redemption follows similar
            steps, during which USDT tokens are burned and a bank transfer is
            made.
          </p>{' '}
          <p>
            In order to transfer your USDT between wallets, you should initiate
            the transaction in your wallet. The transaction is then broadcasted
            to the network and confirmed after some time. After a few blockchain
            confirmations, the USDT will appear in the recipient’s wallet or
            exchange.
          </p>
          <h3>USDT's timeline</h3>{' '}
          <p>
            Tether was launched in 2014 by Brock Pierce, Reeve Collins, and
            Craig Sellars. The goal was to create a digital dollar, which would
            exist on the blockchain. In 2015 it gained traction because of the
            integration with Bitfinex. In 2017 it expanded to networks like
            Ethereum or the Omni Layer. In 2018, both Tether and Bitfinex faced
            criticism and regulatory scrutiny due to not following best
            practices and lack of transparency. Since then there have been some
            efforts made to reassure users and provide transparent details, but
            to this day not enough progress has been made.
          </p>{' '}
          <h3>The risks of USDT</h3>{' '}
          <p>
            When compared to USDC, USDT is a much riskier asset. Tether
            Limited’s transparency is unacceptable and based mostly on trust.
            This behavior may only encourage fraudulent activities, which can
            ultimately lead to the collapse of the peg.
          </p>{' '}
          <p>
            Tether is extremely prone to regulatory risks and stricter rules as
            well as fines, which may follow in a not-so-distant future. Because
            of all the controversies surrounding the entity behind USDT, it
            becomes very easy to manipulate the price, causing the token to
            depeg by a few cents.
          </p>
          <p>
            It’s also remarkable for a company with so few employees to generate
            a revenue of $6.2 billion in 2023, which either highlights great
            management and product or shady activities taking place behind
            closed doors.
          </p>
          <h3>Why USDT matters</h3>{' '}
          <p>
            USDT serves as a fundamental stablecoin every crypto user should be
            aware of. It provides access to huge liquidity and allows traders to
            trade and investors to store value. As the most popular stablecoin,
            it’s integrated into a wide range of dApps, and despite being
            considered shady, it’s used by the majority of cryptocurrency users.
            Will USDT give in to regulators or continue to operate in these
            murky waters in a few years from now?
          </p>
        </div>
        <MarketStats
          symbol={symbol}
          title="USDT (USDT) market stats"
          description="USDT is priced at 76,601.30 EUR, up 0.37% in the last 24 hours, with a trading volume of 97.44B EUR. As the #1 cryptocurrency by market cap, USDT's total valuation stands at 1.78T EUR (57.84% dominance), based on a circulating supply of 19.95M."
        >
          <StatsDisplay columns={2}>
            <StatCard
              label="Price"
              value={`${formatNumber(data[0].quote[0].price)} ${data[0].quote[0].symbol}`}
              variant="highlight"
            />
            <StatCard
              label="Market cap"
              value={`${formatNumber(data[0].quote[0].market_cap)} ${data[0].quote[0].symbol}`}
              variant="highlight"
            />
            <StatCard
              label="Volume (24h)"
              value={`${formatNumber(data[0].quote[0].volume_24h)} ${data[0].quote[0].symbol}`}
              variant="highlight"
            />
            <StatCard
              label="Circulation"
              value={`${formatNumber(data[0].circulating_supply)}`}
              variant="highlight"
            />
          </StatsDisplay>
        </MarketStats>
        <MarketStats
          symbol={symbol}
          title="USDT (USDT) price, charts and statistics"
          description="Check the current USDT price, detailed charts, and key market statistics. Stay updated with real-time data to track USDT's performance and market trends."
        >
          <div className="flex">
            <Button asChild variant="link">
              <a href={`/${action === 'buy' ? 'sell' : 'buy'}/${symbol}`}>
                {action === 'buy' ? 'Sell' : 'Buy'} {symbol.toUpperCase()}{' '}
                <ArrowUpRight className="size-4" />
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
              <a
                href={`https://tether.to/`}
                className="no-undeline"
                target="_blank"
              >
                Website
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="link">
              <a href={`https://tether.to/en/whitepaper/`} target="_blank">
                Whitepaper <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </MarketStats>
      </>
    )
  },
  usdc: ({ symbol, action }: { symbol: string; action: string }) => {
    const data = useLoaderData({ from: `/${action}/$asset` as any })

    return (
      <>
        <div>
          <p>
            In the cryptocurrency markets, where prices change drastically in a
            matter of minutes, a safe haven is needed to preserve the value of
            your assets. That’s why stablecoins are here to save you. USDC
            particularly stands out—a product of collaboration between Circle
            and Coinbase. It has become the foundation of DeFi on every chain.
          </p>{' '}
          <h3>What is USDC?</h3>{' '}
          <p>
            USDC is a type of cryptocurrency known as a stablecoin. Its purpose?
            To maintain a 1:1 ratio with the US dollar. It's different from many
            cryptocurrencies you may know, such as Bitcoin or Ethereum. Its
            value doesn’t change, which makes it ideal for savings and also as a
            hedge against market volatility.
          </p>{' '}
          <p>
            What makes it different? It's the strong emphasis on regulatory
            compliance. USDC is perceived as the most regulated stablecoin, thus
            making it a preferable choice for whales and institutions. USDC is
            fully backed by US dollars and their equivalents, such as Treasury
            bills. This means that for every unit of stablecoin, there’s a
            dollar bill held in custody.
          </p>{' '}
          <h3>Why use USDC?</h3>{' '}
          <p>
            The primary advantage of USDC is its stability. Compared to other
            currencies, it doesn’t fluctuate and offers a safe harbor during
            market crashes.
          </p>{' '}
          <p>
            USDC is available on multiple chains, either as an official or a
            bridged version, which offers easy accessibility no matter the
            chain. Depending on the network, USDC transactions may be cheap and
            fast or expensive and slow, so make a wise choice. USDC is heavily
            integrated into nearly every DeFi protocol you can name, which makes
            it perfect for any type of interaction—from lending and borrowing to
            trading. Due to its stability, payments and everyday transactions
            are where USDC can also be used.
          </p>{' '}
          <h3>How USDC works.</h3>{' '}
          <p>
            USDC leverages blockchain technology for transparency while at the
            same time modernizing the US dollar and creating a better, digital
            version of it. The use of blockchain allows for the integration of
            USDC into different dApps.
          </p>{' '}
          <p>
            The issuance and redemption process is very straightforward. A party
            deposits a portion of its cash reserves with a regulated financial
            institution, and once the deposit is verified, a corresponding
            amount is issued to the user’s wallet address. Similarly, the
            redemption follows similar steps, during which USDC tokens are
            burned and a bank transfer is made.
          </p>{' '}
          <p>
            Thanks to being a regulated entity, regular third-party audits take
            place to verify the reserves of USDC. Additionally, information
            regarding the reserves is available to the public with a variety of
            reports. You can also find the value of Circle’s government bonds
            held with BlackRock on the web.
          </p>
          <h3>USDC's timeline</h3>{' '}
          <p>
            USDC was launched by Circle and Coinbase in 2018. In 2019 it first
            appeared on Ethereum and then expanded to multiple networks. In 2020
            it was integrated with multiple crypto exchanges and DeFi platforms
            for easier access and increased liquidity. In 2021, USDC became
            available on Solana and partnered with Visa. Since then it’s been
            integrated into multiple payment processors, significantly growing
            in market cap, and cooperating with regulators to obtain licenses
            and make it as compliant as possible.
          </p>{' '}
          <h3>The risks of USDC</h3>{' '}
          <p>
            USDC is reliant on Circle and Coinbase to maintain an appropriate
            ratio of reserves. Although these are heavily regulated
            institutions, any mismanagement or security breach could paralyze
            the token and potentially collapse it. There’s obviously regulatory
            risk, to which USDC is also subject but to a lesser extent because
            of its ties with the banking system.
          </p>{' '}
          <p>
            Blockchain technology is not entirely researched, and
            vulnerabilities in smart contracts may occur. USDC, however, is
            prepared for this possibility with the range of networks it
            supports, thus diversifying the risk.
          </p>
          <p>
            Competitors never sleep and will do anything to increase their
            market share. If USDC wants to stay in the lead, it needs to be
            viewed as the best by the general public and stay ahead of the
            competition by offering better deals, utilizing marketing
            strategies, or closely working with financial institutions.
          </p>
          <h3>Why USDC matters</h3>{' '}
          <p>
            USDC has opened the door to increased liquidity in the crypto market
            as well as its transparency. By working closely with regulatory
            authorities, it started to be perceived as the safest and most
            reliable. As the crypto market continues to mature, we will observe
            whether USDC remains or another, perhaps new, stablecoin takes its
            place.
          </p>
        </div>
        <MarketStats
          symbol={symbol}
          title="USDT (USDC) market stats"
          description={`USDC is priced at ${formatNumber(data[0].quote[0].price)} ${data[0].quote[0].symbol}, up ${data[0].quote[0].percent_change_24h}% in the last 24 hours, with a trading volume of ${formatNumber(data[0].quote[0].volume_24h)} ${data[0].quote[0].symbol}. As the #1 cryptocurrency by market cap.`}
        >
          <StatsDisplay columns={2}>
            <StatCard
              label="Price"
              value={`${formatNumber(data[0].quote[0].price)} ${data[0].quote[0].symbol}`}
              variant="highlight"
            />
            <StatCard
              label="Market cap"
              value={`${formatNumber(data[0].quote[0].market_cap)} ${data[0].quote[0].symbol}`}
              variant="highlight"
            />
            <StatCard
              label="Volume (24h)"
              value={`${formatNumber(data[0].quote[0].volume_24h)} ${data[0].quote[0].symbol}`}
              variant="highlight"
            />
            <StatCard
              label="Circulation"
              value={`${formatNumber(data[0].circulating_supply)}`}
              variant="highlight"
            />
          </StatsDisplay>
        </MarketStats>
        <MarketStats
          symbol={symbol}
          title="USDC price, charts and statistics"
          description="Check the current USDC price, detailed charts, and key market statistics. Stay updated with real-time data to track USDC's performance and market trends."
        >
          <div className="flex">
            <Button asChild variant="link">
              <a href={`/${action === 'buy' ? 'sell' : 'buy'}/${symbol}`}>
                {action === 'buy' ? 'Sell' : 'Buy'} {symbol.toUpperCase()}{' '}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </MarketStats>
        <MarketStats
          symbol={symbol}
          title="Relevant resources for USDC"
          description="Access relevant resources such as USDC's website or whitepaper to help you better understand its purpose and shed some light on the future of the project."
        >
          <div className="flex">
            <Button asChild variant="link">
              <a
                href={`https://www.circle.com/en/usdc`}
                target="_blank"
                className="no-undeline"
              >
                Website
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="link">
              <a
                href={`https://www.circle.com/legal/mica-usdc-whitepaper`}
                target="_blank"
              >
                Whitepaper <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        </MarketStats>
      </>
    )
  },
}
