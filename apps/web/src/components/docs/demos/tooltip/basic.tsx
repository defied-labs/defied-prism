import { Button } from "@/components/ui/Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";

export default function TooltipBasic() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Publish</Button>
      </TooltipTrigger>
      <TooltipContent>Makes the page visible to everyone</TooltipContent>
    </Tooltip>
  );
}
