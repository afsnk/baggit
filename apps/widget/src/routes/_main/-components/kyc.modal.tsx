import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '#/components/ui/credenza'
import { Input } from '#/components/ui/input'
import type React from 'react'

interface KYCModal {
  children: React.ReactNode
}
export function KYCModal(props: KYCModal) {
  return (
    <Credenza>
      <CredenzaTrigger asChild>{props.children}</CredenzaTrigger>
      <CredenzaContent>
        <div className="mx-auto w-full max-w-sm mb-10">
          <CredenzaHeader>
            <CredenzaTitle>
              {/*Header components with steps navigation controls*/}
              Verify your account to coninue
            </CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody>
            <Input type="text" placeholder="Enter email address" />
          </CredenzaBody>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
