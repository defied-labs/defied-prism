import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Calendar, { "aria-label": "Due date", defaultValue: "2024-01-15", today: "2024-01-10", ...props })) satisfies VueFixture;
