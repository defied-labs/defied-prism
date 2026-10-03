import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CardBasic() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team plan</CardTitle>
        <CardDescription>Billed monthly, cancel any time.</CardDescription>
      </CardHeader>
      <CardContent>5 seats, 100 GB storage and priority support.</CardContent>
      <CardFooter>
        <Button>Upgrade</Button>
      </CardFooter>
    </Card>
  );
}
