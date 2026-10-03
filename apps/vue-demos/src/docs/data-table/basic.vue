<script setup lang="ts">
import { DataTable, type DataTableColumn } from "../../components/ui/data-table";

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: string;
}

const invoices: Invoice[] = [
  { id: "INV-001", customer: "Acme Corp", amount: 1250, status: "Paid" },
  { id: "INV-002", customer: "Globex", amount: 480, status: "Pending" },
  { id: "INV-003", customer: "Initech", amount: 3200, status: "Overdue" },
  { id: "INV-004", customer: "Umbrella", amount: 760, status: "Paid" },
];

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice", accessor: (row) => row.id, rowHeader: true },
  { id: "customer", header: "Customer", accessor: (row) => row.customer, sortable: true },
  { id: "amount", header: "Amount", accessor: (row) => row.amount, sortable: true },
  { id: "status", header: "Status", accessor: (row) => row.status },
];
</script>

<template>
  <DataTable caption="Recent invoices" :columns="columns" :data="invoices" :get-row-id="(row) => row.id">
    <template #cell-amount="{ value }">${{ (value as number).toLocaleString("en-US") }}</template>
  </DataTable>
</template>
