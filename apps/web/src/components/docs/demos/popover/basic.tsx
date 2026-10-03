import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

export default function PopoverBasic() {
  return (
    <Popover>
      <PopoverTrigger>Share</PopoverTrigger>
      <PopoverContent>
        <p>Anyone with the link can view this page.</p>
        <label>
          Link <input readOnly defaultValue="https://example.com/p/42" />
        </label>
        <PopoverClose>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
