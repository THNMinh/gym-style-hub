import type { SizeGuideRow } from "@/entities/catalog/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SizeGuideDialog({ rows }: { rows: SizeGuideRow[] }) {
  return (
    <Dialog>
      <DialogTrigger className="text-xs font-semibold underline underline-offset-4">
        Bảng size
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bảng size (cm)</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Ngực</TableHead>
              <TableHead>Eo</TableHead>
              <TableHead>Hông</TableHead>
              <TableHead>Chiều cao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.guideId}>
                <TableCell className="font-semibold">{row.size}</TableCell>
                <TableCell>{row.chestCm}</TableCell>
                <TableCell>{row.waistCm}</TableCell>
                <TableCell>{row.hipsCm}</TableCell>
                <TableCell>{row.heightRangeCm}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
