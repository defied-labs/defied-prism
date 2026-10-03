import { h } from "vue";
import type { VueFixture } from "../support/fixture-vue";

export default ((m, props) =>
  h(m.Breadcrumb, props, () => [
    h(m.BreadcrumbItem, {}, () => h(m.BreadcrumbLink, { href: "/" }, () => "Home")),
    h(m.BreadcrumbItem, {}, () => h(m.BreadcrumbLink, { href: "/docs" }, () => "Docs")),
    h(m.BreadcrumbItem, {}, () => h(m.BreadcrumbPage, {}, () => "Breadcrumb")),
  ])) satisfies VueFixture;
