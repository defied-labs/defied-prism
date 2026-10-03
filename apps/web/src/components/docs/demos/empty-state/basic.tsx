import { Button } from "@/components/ui/Button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/EmptyState";

export default function EmptyStateBasic() {
  return (
    <EmptyState>
      <EmptyStateIcon>📭</EmptyStateIcon>
      <EmptyStateTitle>No invoices yet</EmptyStateTitle>
      <EmptyStateDescription>Invoices you send will show up here.</EmptyStateDescription>
      <EmptyStateActions>
        <Button>Create invoice</Button>
        <Button variant="ghost">Import</Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
