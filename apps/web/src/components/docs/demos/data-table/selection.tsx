import { useState } from "react";

import { DataTable, type DataTableColumn, type RowKey } from "@/components/ui/DataTable";

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

export default function DataTableSelection() {
  const [selected, setSelected] = useState<RowKey[]>([]);
  return (
    <div>
      <DataTable
        caption="Team members"
        columns={columns}
        data={members}
        getRowId={(row) => row.email}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        isRowSelectable={(row) => row.role !== "Owner"}
        getRowLabel={(row) => `Select ${row.name}`}
      />
      <p>{selected.length} selected</p>
    </div>
  );
}
