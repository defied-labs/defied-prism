"use client";

import { useState, type ComponentType } from "react";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "@/components/ui/Toast";

import type { DemoName } from "./vue-island";

/*
 * The React twins of apps/vue-demos/src/demos/*.vue: same components, same
 * content, same props, so the two frameworks can be compared side by side.
 */

export interface ButtonDemoProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  disabled?: boolean;
}

function ButtonDemo(props: ButtonDemoProps) {
  return <Button {...props}>Ship it</Button>;
}

function FieldDemo() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");
  return (
    <Field invalid={invalid}>
      <FieldLabel>Work email</FieldLabel>
      <Input
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <FieldDescription>We only use it for release notes.</FieldDescription>
      {invalid && <FieldError>That doesn&apos;t look like an email address.</FieldError>}
    </Field>
  );
}

function SelectDemo() {
  return (
    <Select defaultValue="react">
      <SelectTrigger aria-label="Framework">
        <SelectValue placeholder="Pick a framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Shipping today</SelectLabel>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="svelte" disabled>
          Svelte (not yet)
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger variant="outline">Open dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Rendered by React</DialogTitle>
        <DialogDescription>
          Focus is trapped, Escape closes it, and the rest of the page is hidden from screen readers.
        </DialogDescription>
        <DialogFooter>
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToastDemo() {
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({ title: "Deployed", description: "Sent from a React component.", status: "success" })
      }
    >
      Show toast
    </Button>
  );
}

function CalendarDemo() {
  return <Calendar aria-label="Release date" />;
}

interface Target {
  stack: string;
  styling: string;
  status: string;
}

const rows: Target[] = [
  { stack: "React", styling: "Tailwind", status: "Stable" },
  { stack: "React", styling: "CSS Modules", status: "Stable" },
  { stack: "Vue", styling: "Tailwind", status: "Stable" },
  { stack: "Vue", styling: "CSS Modules", status: "Stable" },
];
const columns: DataTableColumn<Target>[] = [
  { id: "stack", header: "Framework", accessor: (r) => r.stack, sortable: true, rowHeader: true },
  { id: "styling", header: "Styling", accessor: (r) => r.styling, sortable: true },
  { id: "status", header: "Status", accessor: (r) => r.status },
];

function DataTableDemo() {
  return <DataTable columns={columns} data={rows} caption="Generation targets" size="sm" />;
}

export const reactDemos: Record<DemoName, ComponentType<Record<string, unknown>>> = {
  button: ButtonDemo as ComponentType<Record<string, unknown>>,
  field: FieldDemo,
  select: SelectDemo,
  dialog: DialogDemo,
  toast: ToastDemo,
  calendar: CalendarDemo,
  "data-table": DataTableDemo,
};
