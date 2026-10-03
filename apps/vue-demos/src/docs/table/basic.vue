<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

const invoices = [
  { id: "INV-001", status: "Paid", amount: "$250.00" },
  { id: "INV-002", status: "Pending", amount: "$150.00" },
  { id: "INV-003", status: "Overdue", amount: "$350.00" },
];
</script>

<template>
  <Table striped>
    <TableCaption>Recent invoices</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="invoice in invoices" :key="invoice.id">
        <TableHead scope="row">{{ invoice.id }}</TableHead>
        <TableCell>{{ invoice.status }}</TableCell>
        <TableCell>{{ invoice.amount }}</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableHead scope="row" colspan="2">Total</TableHead>
        <TableCell>$750.00</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
</template>
