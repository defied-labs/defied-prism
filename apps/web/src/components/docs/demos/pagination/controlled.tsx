import { useState } from "react";

import { Pagination } from "@/components/ui/Pagination";

const results = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India"];
const perPage = 3;

export default function PaginationControlled() {
  const [page, setPage] = useState(1);
  const shown = results.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <p>Results: {shown.join(", ")}</p>
      <Pagination
        count={Math.ceil(results.length / perPage)}
        page={page}
        onPageChange={setPage}
        aria-label="Results pages"
        previousContent="Previous"
        nextContent="Next"
      />
    </div>
  );
}
