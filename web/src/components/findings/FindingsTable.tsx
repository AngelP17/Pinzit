import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { FindingRow } from '../../types/pinzit';

export function FindingsTable({ rows, onOpen }: { rows: FindingRow[]; onOpen: (id: FindingRow['id']) => void }) {
  const columns: ColumnDef<FindingRow>[] = [
    { accessorKey: 'severity', header: 'Severity' },
    { accessorKey: 'id', header: 'Constraint' },
    { accessorKey: 'keyMetric', header: 'Key Metric' },
    { accessorKey: 'evidenceCount', header: 'Evidence Count' },
    { accessorKey: 'verdict', header: 'Verdict' },
  ];

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="panel overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-700">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{flexRender(h.column.columnDef.header, h.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="cursor-pointer border-t border-surface-600 text-zinc-200 transition-colors hover:bg-surface-700/40" onClick={() => onOpen(row.original.id)}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
