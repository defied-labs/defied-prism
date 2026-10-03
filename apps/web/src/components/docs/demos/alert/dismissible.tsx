import { useState } from "react";

import { Alert, AlertAction, AlertContent, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function AlertDismissible() {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return (
      <Button variant="outline" onClick={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }
  return (
    <Alert status="danger" urgent onDismiss={() => setVisible(false)}>
      <AlertContent>
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined. Update it to keep your plan active.</AlertDescription>
      </AlertContent>
      <AlertAction>
        <Button size="sm" variant="outline">
          Update card
        </Button>
      </AlertAction>
    </Alert>
  );
}
