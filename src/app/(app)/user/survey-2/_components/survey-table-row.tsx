'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FREQUENCY_LEVELS, IMPACT_MAGNITUDES, ORGANIZATIONAL_CONTROLS, PEOPLE_CONTROLS, PHYSICAL_CONTROLS, TECHNOLOGICAL_CONTROLS, MITIGATION_OPTIONS, AREA_DAMPAK_OPTIONS } from '@/constants/data';
import { getRiskLevel } from '@/lib/risk-matrix';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';

const singleSurveySchema = z.object({
  riskEvent: z.string(),
  impactArea: z.string().optional(),
  areaDampak: z.string().optional(),
  eventDate: z.date().optional(),
  frequency: z.string().optional(),
  impactMagnitude: z.string().optional(),
  cause: z.string().optional(),
  impact: z.string().optional(),
  kontrolOrganisasi: z.array(z.string()).optional(),
  kontrolOrang: z.array(z.string()).optional(),
  kontrolFisik: z.array(z.string()).optional(),
  kontrolTeknologi: z.array(z.string()).optional(),
  mitigasi: z.string().optional(),
});

type RiskEvent = {
    name: string;
    impactAreas: string[];
}

interface SurveyTableRowProps {
  index: number;
  riskEvent: RiskEvent;
  handleClearRow: (index: number) => void;
}

export function SurveyTableRow({ index, riskEvent, handleClearRow }: SurveyTableRowProps) {
  const { control, setValue } = useFormContext();

  const [frequency, impactMagnitude] = useWatch({
    control,
    name: [`surveys.${index}.frequency`, `surveys.${index}.impactMagnitude`],
  });
  
  const { level, color } = getRiskLevel(frequency, impactMagnitude);

  const [openImpactAreaPopover, setOpenImpactAreaPopover] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openKontrolOrganisasiPopover, setOpenKontrolOrganisasiPopover] = useState(false);
  const [openKontrolOrangPopover, setOpenKontrolOrangPopover] = useState(false);
  const [openKontrolFisikPopover, setOpenKontrolFisikPopover] = useState(false);
  const [openKontrolTeknologiPopover, setOpenKontrolTeknologiPopover] = useState(false);

  const renderMultiSelect = (
    fieldName: keyof z.infer<typeof singleSurveySchema>,
    options: readonly string[],
    placeholder: string,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
  ) => {
    const fieldNameStr = `surveys.${index}.${fieldName}` as const;
    
    return (
      <FormField
        control={control}
        name={fieldNameStr}
        render={({ field }) => (
          <FormItem>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                    <span className="truncate">{field.value && field.value.length > 0 ? `${field.value.length} terpilih` : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari..." />
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {options.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() => {
                            const value = (field.value as string[] | undefined) || [];
                            const newValue = value.includes(item)
                              ? value.filter((i) => i !== item)
                              : [...value, item];
                            setValue(fieldNameStr, newValue, { shouldDirty: true });
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", (field.value as string[] | undefined)?.includes(item) ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1 truncate">{item}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />
    );
  };

  return (
    <TableRow>
      <TableCell className="font-medium align-top sticky left-0 bg-background z-10">
          <p className="whitespace-normal break-words">{riskEvent.name}</p>
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.impactArea`}
          render={({ field }) => (
            <FormItem>
              <Popover open={openImpactAreaPopover} onOpenChange={setOpenImpactAreaPopover}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between text-left h-auto min-h-10", !field.value && "text-muted-foreground")}>
                      <span className="whitespace-normal break-words flex-1 pr-2">{field.value ? field.value : "Pilih risiko..."}</span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Cari risiko..." />
                    <CommandEmpty>Risiko tidak ditemukan.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {riskEvent.impactAreas.map((area) => (
                          <CommandItem
                            key={area}
                            value={area}
                            onSelect={() => {
                              setValue(`surveys.${index}.impactArea`, area, { shouldDirty: true });
                              setOpenImpactAreaPopover(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", area === field.value ? "opacity-100" : "opacity-0")} />
                            <span className="flex-1 whitespace-normal break-words">{area}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
       <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.areaDampak`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Pilih area" /></SelectTrigger></FormControl>
                <SelectContent>
                  {AREA_DAMPAK_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.eventDate`}
          render={({ field }) => (
            <FormItem>
              <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar 
                    mode="single" 
                    selected={field.value} 
                    onSelect={(date) => {
                        if (date) {
                            field.onChange(date);
                            setOpenDatePicker(false);
                        }
                    }} 
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.cause`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Textarea placeholder="Jelaskan penyebab..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.impact`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Textarea placeholder="Jelaskan dampak..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.frequency`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Pilih frekuensi" /></SelectTrigger></FormControl>
                <SelectContent>{FREQUENCY_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.impactMagnitude`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl><SelectTrigger><SelectValue placeholder="Pilih besaran" /></SelectTrigger></FormControl>
                <SelectContent>{IMPACT_MAGNITUDES.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="text-center align-middle">
        {level ? <Badge className={cn("text-base", color)}>{level}</Badge> : <span className="text-xs text-muted-foreground">-</span>}
      </TableCell>
      <TableCell className="align-top">
        {renderMultiSelect('kontrolOrganisasi', ORGANIZATIONAL_CONTROLS, "Pilih kontrol...", openKontrolOrganisasiPopover, setOpenKontrolOrganisasiPopover)}
      </TableCell>
      <TableCell className="align-top">
        {renderMultiSelect('kontrolOrang', PEOPLE_CONTROLS, "Pilih kontrol...", openKontrolOrangPopover, setOpenKontrolOrangPopover)}
      </TableCell>
      <TableCell className="align-top">
        {renderMultiSelect('kontrolFisik', PHYSICAL_CONTROLS, "Pilih kontrol...", openKontrolFisikPopover, setOpenKontrolFisikPopover)}
      </TableCell>
      <TableCell className="align-top">
        {renderMultiSelect('kontrolTeknologi', TECHNOLOGICAL_CONTROLS, "Pilih kontrol...", openKontrolTeknologiPopover, setOpenKontrolTeknologiPopover)}
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`surveys.${index}.mitigasi`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mitigasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MITIGATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="text-center align-middle">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleClearRow(index)}
          title="Bersihkan baris"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Bersihkan baris</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}
