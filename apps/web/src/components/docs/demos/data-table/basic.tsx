import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";

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
  {
    id: "amount",
    header: "Amount",
    accessor: (row) => row.amount,
    cell: (_row, value) => `$${(value as number).toLocaleString("en-US")}`,
    sortable: true,
  },
  { id: "status", header: "Status", accessor: (row) => row.status },
];

export default function DataTableBasic() {
  return <DataTable caption="Recent invoices" columns={columns} data={invoices} getRowId={(row) => row.id} />;
}
