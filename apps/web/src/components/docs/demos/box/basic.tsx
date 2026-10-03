import { Box } from "@/components/ui/Box";

export default function BoxBasic() {
  return (
    <Box as="section" padding="lg" background="subtle" aria-label="Storage">
      <strong>Storage</strong>
      <p>4.2 GB of 10 GB used.</p>
      <Box padding="sm" background="muted">
        Backups run nightly at 03:00.
      </Box>
    </Box>
  );
}
