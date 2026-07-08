import { FolderOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { showCreateOrgModal } from './create-org-modal'

export function EmptyOrg() {
  return (
    <Empty className="h-full bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>No Existing Organization</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          Create a new organization to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={showCreateOrgModal}>
          Create organization
        </Button>
      </EmptyContent>
    </Empty>
  )
}
