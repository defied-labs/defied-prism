import { Card, CardDescription, CardHeader, CardLink, CardTitle } from "@/components/ui/Card";

export default function CardInteractive() {
  return (
    <Card interactive>
      <CardHeader>
        <CardTitle>
          <CardLink href="#release-notes">Release notes 2.4</CardLink>
        </CardTitle>
        <CardDescription>Faster installs and a new Calendar component.</CardDescription>
      </CardHeader>
    </Card>
  );
}
