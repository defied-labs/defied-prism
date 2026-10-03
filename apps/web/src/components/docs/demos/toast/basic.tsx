import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export default function ToastBasic() {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Changes saved",
            description: "Your profile is up to date.",
            status: "success",
          })
        }
      >
        Save
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Message archived",
            action: { label: "Undo", onClick: () => toast({ title: "Message restored" }) },
          })
        }
      >
        Archive
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Upload failed",
            description: "The file is larger than 10 MB.",
            status: "danger",
            duration: Infinity,
          })
        }
      >
        Upload
      </Button>
    </div>
  );
}
