import { useState } from "react";

import { Calendar } from "@/components/ui/Calendar";

export default function CalendarBasic() {
  const [date, setDate] = useState<string | null>(null);
  return (
    <div>
      <Calendar value={date} onValueChange={setDate} aria-label="Appointment date" />
      <p>Selected: {date ?? "none"}</p>
    </div>
  );
}
