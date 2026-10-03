import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/Breadcrumb";

const path = ["Home", "Acme", "Projects", "Website", "Assets"];

export default function BreadcrumbCollapsed() {
  return (
    <Breadcrumb maxItems={4} itemsAfterCollapse={2} separator="›">
      {path.map((label) => (
        <BreadcrumbItem key={label}>
          <BreadcrumbLink href="#">{label}</BreadcrumbLink>
        </BreadcrumbItem>
      ))}
      <BreadcrumbItem>
        <BreadcrumbPage>logo.svg</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
