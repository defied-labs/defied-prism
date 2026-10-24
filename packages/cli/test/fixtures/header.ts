import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Header,
    props,
    h(m.HeaderBrand, { href: "/" }, "Defied"),
    h(
      m.HeaderNav,
      { defaultValue: "products" },
      h(
        m.HeaderMenu,
        { value: "products" },
        h(m.HeaderMenuTrigger, {}, "Products"),
        h(
          m.HeaderMenuContent,
          { columns: 2 },
          h(m.HeaderLink, { href: "/prism", description: "Pick your stack." }, "Prism"),
          h(m.HeaderLink, { href: "/configs" }, "Web Configs"),
        ),
      ),
      h(m.HeaderItem, {}, h(m.HeaderLink, { href: "/blog", active: true }, "Blog")),
    ),
    h(m.HeaderActions, {}, h("a", { href: "/sign-in" }, "Sign in")),
    h(m.HeaderToggle),
  )) satisfies Fixture;
