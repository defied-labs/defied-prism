import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "@/components/ui/EmptyState";

export default function EmptyStateSmall() {
  return (
    <EmptyState size="sm" headingLevel={4}>
      <EmptyStateTitle>No results for “invoce”</EmptyStateTitle>
      <EmptyStateDescription>Check the spelling or try a broader search.</EmptyStateDescription>
    </EmptyState>
  );
}
