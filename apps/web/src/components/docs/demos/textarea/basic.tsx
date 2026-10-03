import { Textarea } from "@/components/ui/Textarea";

export default function TextareaBasic() {
  return (
    <label style={{ display: "grid", gap: "0.5rem" }}>
      Feedback
      <Textarea name="feedback" rows={3} placeholder="What could we do better?" fullWidth />
    </label>
  );
}
