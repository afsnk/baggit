import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { ArrowRightIcon, PhoneCallIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden pt-4">
      {/* Shades */}
      <div
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-hidden"
      >
        <div
          className={cn(
            'absolute inset-0 isolate -z-10',
            'bg-[radial-gradient(20%_80%_at_20%_0%,--theme(--color-foreground/.1),transparent)]',
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-2">
        <div className="order-1 border border-cyan-200 p-16 h-8/12 md:h-auto"></div>
        <div className="order-2 relative z-10 flex flex-col gap-5 px-4">
          <Link
            className={cn(
              'group flex w-fit items-center gap-3 rounded-sm border bg-card p-1 shadow-xs',
              'fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out',
              'no-underline',
            )}
            to="/billing"
          >
            <div className="rounded-xs border bg-card px-1.5 py-0.5 shadow-sm">
              <p className="font-mono text-xs">NEW</p>
            </div>

            <span className="text-xs">Accept crypto payments with ease</span>
            <span className="block h-5 border-l" />

            <div className="pr-1">
              <ArrowRightIcon className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5" />
            </div>
          </Link>

          <h1
            className={cn(
              'text-balance font-medium text-4xl text-foreground leading-tight md:text-5xl',
              'fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out',
            )}
          >
            Interact better with crypto
          </h1>

          <p
            className={cn(
              'text-muted-foreground text-xs tracking-wider sm:text-lg md:text-xl',
              'fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out',
            )}
          >
            We help businesses scale to the global market, with easy buy/sell,
            billing and onboarding infra.
          </p>

          <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
            <Button variant="outline" asChild>
              <a
                href="https://cal.com/afullsnack/baggit-demo-onboarding"
                target="_blank"
                className="underline-0 no-underline"
              >
                <PhoneCallIcon data-icon="inline-start" /> Book a Call
              </a>
            </Button>
            <Button variant="default" asChild>
              <Link to="/onboarding" className="flex items-center">
                <span className="text-black">Get started</span>{' '}
                <ArrowRightIcon className="inline-end text-black" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            'absolute -inset-x-20 inset-y-0 -translate-y-1/3 scale-120 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,theme(--color-foreground/.1),transparent,transparent)]',
            'blur-[50px]',
          )}
        />
        {/*<div
          className={cn(
            'mask-b-from-60% relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20',
            'fade-in slide-in-from-bottom-5 animate-in fill-mode-backwards delay-100 duration-1000 ease-out',
            'border border-gray-600',
          )}
        >
        </div>*/}
      </div>
    </section>
  )
}
