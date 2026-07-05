import type React from 'react'
import { Drawer } from 'vaul'

export const DrawerTitle = ({
  children,
}: {
  children: React.ReactNode | string
}) =>
  typeof children === 'string' ? (
    <Drawer.Title className="text-base font-semibold tracking-tight">
      {children}
    </Drawer.Title>
  ) : (
    children
  )

export const DrawerDescription = ({
  children,
}: {
  children: React.ReactNode | string
}) =>
  typeof children === 'string' ? (
    <Drawer.Description className="text-sm leading-relaxed mb-3 text-muted-foreground">
      {children}
    </Drawer.Description>
  ) : (
    children
  )
