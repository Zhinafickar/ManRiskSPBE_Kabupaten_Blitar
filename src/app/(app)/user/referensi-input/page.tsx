
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
        <ScrollArea className="h-[60vh]">
            <Accordion type="single" collapsible className="w-full">
            {RISK_EVENTS.map((event) => (
                <AccordionItem value={event.name} key={event.name}>
                <AccordionTrigger>
                    <span className="font-semibold text-left">{event.name}</span>
                </AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    {event.impactAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                    </ul>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
