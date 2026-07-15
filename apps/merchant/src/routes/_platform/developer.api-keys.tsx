import APIKeyTable from '#/components/api-table'
import { showCreateKeysModal } from '#/components/create-key-modal'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertAction,
} from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_platform/developer/api-keys')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session } = authClient.useSession()
  const { data: apiKeys, error: _apiKeysError } = useQuery({
    gcTime: 30_000,
    enabled: !!session,
    queryKey: ['getKeys'],
    queryFn: async () => {
      const { data, error } = await authClient.apiKey.list({
        query: {
          organizationId: session?.session.activeOrganizationId || '',
        },
      })

      if (error) {
        console.log(`Error getting keys`, { error })
        throw error
      }

      return data
    },
  })
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between w-full">
        <Alert className="bg-muted/30">
          <AlertTitle>Manage API keys</AlertTitle>
          <AlertDescription>
            Keep these keys secret — they grant full API access. Rotate any key
            suspected of being exposed.
          </AlertDescription>
          <AlertAction>
            <Button
              size="default"
              variant="default"
              onClick={showCreateKeysModal}
            >
              Create keys
            </Button>
          </AlertAction>
        </Alert>
      </div>
      <APIKeyTable data={apiKeys?.apiKeys || []} />
    </div>
  )
}
