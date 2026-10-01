import { createElement as h } from "react";
import type { Fixture } from "../support/fixture";

export default ((m, props) =>
  h(
    m.Breadcrumb,
    props,
    h(m.BreadcrumbItem, {}, h(m.BreadcrumbLink, { href: "/" }, "Home")),
    h(m.BreadcrumbItem, {}, h(m.BreadcrumbLink, { href: "/docs" }, "Docs")),
    h(m.BreadcrumbItem, {}, h(m.BreadcrumbPage, {}, "Breadcrumb")),
  )) satisfies Fixture;
