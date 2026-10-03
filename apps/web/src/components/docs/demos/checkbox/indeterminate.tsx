import { useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";

const toppings = ["Mushrooms", "Olives", "Peppers"];

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<string[]>(["Olives"]);
  const all = selected.length === toppings.length;
  const some = selected.length > 0 && !all;
  return (
    <div>
      <Checkbox checked={all} indeterminate={some} onCheckedChange={(checked) => setSelected(checked ? toppings : [])}>
        All toppings
      </Checkbox>
      {toppings.map((topping) => (
        <Checkbox
          key={topping}
          checked={selected.includes(topping)}
          onCheckedChange={(checked) =>
            setSelected(checked ? [...selected, topping] : selected.filter((t) => t !== topping))
          }
        >
          {topping}
        </Checkbox>
      ))}
    </div>
  );
}
