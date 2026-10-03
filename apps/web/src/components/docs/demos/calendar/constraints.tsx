import { Calendar } from "@/components/ui/Calendar";

const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T00:00:00`).getDay());

export default function CalendarConstraints() {
  return (
    <Calendar
      defaultMonth="2026-11-01"
      min="2026-11-02"
      max="2026-11-27"
      isDateDisabled={isWeekend}
      weekStartsOn={1}
      aria-label="Delivery date"
    />
  );
}
