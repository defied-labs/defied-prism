import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.SkeletonGroup, props, () => [h(m.Skeleton), h(m.Skeleton)])) satisfies VueFixture;
