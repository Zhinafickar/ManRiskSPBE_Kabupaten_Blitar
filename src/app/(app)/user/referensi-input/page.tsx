
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
import { 
    RISK_EVENTS,
    ORGANIZATIONAL_CONTROLS,
    PEOPLE_CONTROLS,
    PHYSICAL_CONTROLS,
    TECHNOLOGICAL_CONTROLS
} from "@/constants/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListTree, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function ReferensiInputPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <ListTree className="h-6 w-6" />
              Referensi Risiko
          </CardTitle>
          <CardDescription>
            Gunakan tabel ini sebagai referensi untuk melihat semua kemungkinan Kategori Risiko dan Risiko spesifik yang dapat Anda laporkan.
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

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" />
                Referensi Kontrol Kendali (ISO 27001)
            </CardTitle>
            <CardDescription>
                Daftar semua opsi kontrol kendali yang tersedia untuk dipilih dalam formulir survei, dikelompokkan berdasarkan kategori.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="organisasi">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="organisasi">Organisasi</TabsTrigger>
                    <TabsTrigger value="orang">Orang</TabsTrigger>
                    <TabsTrigger value="fisik">Fisik</TabsTrigger>
                    <TabsTrigger value="teknologi">Teknologi</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[60vh] mt-4 border rounded-md">
                    <TabsContent value="organisasi" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted z-10"><TableRow><TableHead>Kontrol Organisasi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {ORGANIZATIONAL_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="orang" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted z-10"><TableRow><TableHead>Kontrol Orang</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {PEOPLE_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="fisik" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted z-10"><TableRow><TableHead>Kontrol Fisik</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {PHYSICAL_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="teknologi" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted z-10"><TableRow><TableHead>Kontrol Teknologi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {TECHNOLOGICAL_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
