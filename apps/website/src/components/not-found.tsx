import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '#/components/ui/empty'
import { Link } from '@tanstack/react-router'
import { HomeIcon, CompassIcon } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
            404
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            The page you're looking for might have been <br />
            moved or doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Link href="/">
              <Button
                size="lg"
                variant="default"
                className="text-white dark:text-black"
              >
                <HomeIcon data-icon="inline-start" />
                Go Home
              </Button>
            </Link>

            <Link href="/buy">
              <Button variant="ghost" size="lg">
                <CompassIcon data-icon="inline-start" /> Buy Crypto
              </Button>
            </Link>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
