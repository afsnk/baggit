import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { Input } from './ui/input'
import { useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useMutation } from '@tanstack/react-query'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'

interface ICreateOrgModal {}

const CreateOrgModal = NiceModal.create((_: ICreateOrgModal) => {
  const modal = useModal()
  const [name, setName] = useState<string>('')
  const createOrg = useMutation({
    mutationKey: ['createOrg'],
    mutationFn: async (values: { orgName: string; orgSlug: string }) => {
      const { data, error } = await authClient.organization.checkSlug({
        slug: values.orgSlug, // required
      })

      if (error) {
        console.log(`Error creating org`, { error })
        throw error
      }

      if (data.status) {
        // Create organization
        const { data: createOrgData, error: createOrgError } =
          await authClient.organization.create({
            name: values.orgName,
            slug: values.orgSlug,
            keepCurrentActiveOrganization: false,
          })

        if (createOrgError) {
          console.log(`Error creating org`, { createOrgError })
          throw createOrgError
        }

        return createOrgData
      }
    },
    onSuccess: () => {
      toast.success(`Organization created`)
      modal.hide()
    },
    onError(error) {
      toast.error(error.message, {
        description: error.stack,
      })
    },
  })

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => (open ? modal.show() : modal.hide())}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your organization</DialogTitle>
          <DialogDescription>
            To get started collecting payments, onboarding users, subscriptions
            and widgets, create your organization
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full max-w-sm items-center">
          <Input
            placeholder="Enter organization name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
          <Button
            onClick={async () =>
              createOrg.mutate({
                orgName: name,
                orgSlug: `${name.toLowerCase().split(' ').join('-')}-org`,
              })
            }
            disabled={createOrg.isPending}
          >
            {createOrg.isPending ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" /> Creating...
              </div>
            ) : (
              'Create organization'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

export const showCreateOrgModal = () => NiceModal.show(CreateOrgModal)
