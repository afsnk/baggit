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
import { Copy, Key, Loader2, LockIcon, PlusIcon } from 'lucide-react'
import { Input } from './ui/input'
import { useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
import {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'

interface ICreateKeysModal {}

const CreateKeysModal = NiceModal.create((_: ICreateKeysModal) => {
  const { data: session, isPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const modal = useModal()
  const [name, setName] = useState<string>('')
  const createKeys = useMutation({
    mutationKey: ['createKeys'],
    mutationFn: async (values: { keyName: string; expiresIn?: any }) => {
      const [publicResult, secretResult] = await Promise.all(
        ['public', 'secret'].map((configId) =>
          authClient.apiKey.create({
            configId,
            name: values.keyName,
            organizationId: session?.session.activeOrganizationId,
          }),
        ),
      )

      if (publicResult.error || secretResult.error) {
        console.log(`Failed to create keys`, {
          ...publicResult.error,
          ...secretResult.error,
        })
        throw publicResult.error || secretResult.error
      }

      return [publicResult.data, secretResult.data]
    },
    onSuccess: () => {
      toast.success(`API Keys created`)
      queryClient.invalidateQueries({ queryKey: ['getKeys'] })
      // modal.hide()
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
          <DialogTitle>Create your API Keys</DialogTitle>
          <DialogDescription>
            One step closer to accessing global payments. Copy keys and save
            securely as they won't show again
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full max-w-sm items-center">
          <Input
            placeholder="Enter API key name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {createKeys.data && (
          <ItemGroup className="max-w-sm animate-in">
            {createKeys.data.map((newKey, index) => (
              <Item key={newKey.id} variant="outline">
                <ItemMedia variant="icon">
                  {newKey.configId === 'public' ? <Key /> : <LockIcon />}
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{newKey.configId}</ItemTitle>
                  <ItemDescription className="text-ellipsis">
                    {newKey.key.slice(0, 16)}...
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      navigator.clipboard.writeText(newKey.key)
                    }}
                  >
                    <Copy />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
          <Button
            onClick={async () =>
              createKeys.mutate({
                keyName: name,
              })
            }
            disabled={createKeys.isPending || isPending}
          >
            {createKeys.isPending ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" /> Creating...
              </div>
            ) : (
              'Create keys'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

export const showCreateKeysModal = () => NiceModal.show(CreateKeysModal)
