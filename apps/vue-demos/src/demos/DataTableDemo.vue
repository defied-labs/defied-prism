<script setup lang="ts">
import { DataTable, type DataTableColumn } from "../components/ui/data-table";

interface Target { stack: string; styling: string; status: string }

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
</script>

<template>
  <DataTable :columns="columns" :data="rows" caption="Generation targets" size="sm" />
</template>
