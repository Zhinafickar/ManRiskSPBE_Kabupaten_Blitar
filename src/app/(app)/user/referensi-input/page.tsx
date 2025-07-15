
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
                  <TableHeader className="sticky top-0 bg-primary z-10">
                      <TableRow className="border-b-primary/20 hover:bg-primary/90">
                          <TableHead className="w-[30%] text-primary-foreground">Kategori Risiko</TableHead>
                          <TableHead className="text-primary-foreground">Risiko</TableHead>
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
                <TabsList className="grid w-full grid-cols-4 bg-primary text-primary-foreground/70">
                    <TabsTrigger value="organisasi" className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">Organisasi</TabsTrigger>
                    <TabsTrigger value="orang" className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">Orang</TabsTrigger>
                    <TabsTrigger value="fisik" className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">Fisik</TabsTrigger>
                    <TabsTrigger value="teknologi" className="data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">Teknologi</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[60vh] mt-4 border rounded-md">
                    <TabsContent value="organisasi" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-primary z-10"><TableRow className="border-b-primary/20 hover:bg-primary/90"><TableHead className="text-primary-foreground">Kontrol Organisasi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {ORGANIZATIONAL_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="orang" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-primary z-10"><TableRow className="border-b-primary/20 hover:bg-primary/90"><TableHead className="text-primary-foreground">Kontrol Orang</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {PEOPLE_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="fisik" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-primary z-10"><TableRow className="border-b-primary/20 hover:bg-primary/90"><TableHead className="text-primary-foreground">Kontrol Fisik</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {PHYSICAL_CONTROLS.map(control => (<TableRow key={control}><TableCell>{control}</TableCell></TableRow>))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="teknologi" className="m-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-primary z-10"><TableRow className="border-b-primary/20 hover:bg-primary/90"><TableHead className="text-primary-foreground">Kontrol Teknologi</TableHead></TableRow></TableHeader>
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
