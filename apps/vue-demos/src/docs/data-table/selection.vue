<script setup lang="ts">
import { ref } from "vue";
import { DataTable, type DataTableColumn, type RowKey } from "../../components/ui/data-table";

interface Member {
  email: string;
  name: string;
  role: string;
}

const members: Member[] = [
  { email: "ada@example.com", name: "Ada Lovelace", role: "Owner" },
  { email: "grace@example.com", name: "Grace Hopper", role: "Admin" },
  { email: "alan@example.com", name: "Alan Turing", role: "Member" },
];

const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name, rowHeader: true },
  { id: "email", header: "Email", accessor: (row) => row.email },
  { id: "role", header: "Role", accessor: (row) => row.role },
];

const selected = ref<RowKey[]>([]);
</script>

<template>
  <div>
    <DataTable
      v-model:selected="selected"
      caption="Team members"
      :columns="columns"
      :data="members"
      :get-row-id="(row) => row.email"
      selectable
      :is-row-selectable="(row) => row.role !== 'Owner'"
      :get-row-label="(row) => `Select ${row.name}`"
    />
    <p>{{ selected.length }} selected</p>
  </div>
</template>
