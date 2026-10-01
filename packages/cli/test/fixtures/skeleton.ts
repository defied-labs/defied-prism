import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(m.SkeletonGroup, props, h(m.Skeleton, {}), h(m.Skeleton, {}))) satisfies Fixture;
