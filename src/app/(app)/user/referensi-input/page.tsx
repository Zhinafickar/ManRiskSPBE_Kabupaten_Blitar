
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RISK_EVENTS } from "@/constants/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListTree } from "lucide-react";

export default function ReferensiInputPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListTree className="h-6 w-6" />
            Referensi Data Inputan
        </CardTitle>
        <CardDescription>
          Gunakan halaman ini sebagai referensi untuk melihat semua kemungkinan Kategori Risiko dan Risiko spesifik yang dapat Anda laporkan dalam formulir survei.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                        <TableHead className="w-[30%]">Kategori Risiko</TableHead>
                        <TableHead>Risiko</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {RISK_EVENTS.flatMap((event, eventIndex) =>
                        event.impactAreas.map((area, areaIndex) => (
                            <TableRow key={`${event.name}-${areaIndex}`}>
                                {areaIndex === 0 && (
                                    <TableCell 
                                        rowSpan={event.impactAreas.length} 
                                        className="font-medium align-top bg-muted/50"
                                    >
                                        {event.name}
                                    </TableCell>
                                )}
                                <TableCell>{area}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
