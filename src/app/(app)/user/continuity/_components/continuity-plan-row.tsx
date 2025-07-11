
'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

interface ContinuityPlanRowProps {
  index: number;
  remove: (index: number) => void;
}

export function ContinuityPlanRow({ index, remove }: ContinuityPlanRowProps) {
  const { control } = useFormContext();

  return (
    <TableRow>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`plans.${index}.aktivitas`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Textarea placeholder="Aktivitas pemulihan..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`plans.${index}.targetWaktu`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Input placeholder="Contoh: 24 Jam" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`plans.${index}.pic`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Input placeholder="Departemen/Jabatan" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`plans.${index}.sumberdaya`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Textarea placeholder="Sumber daya dibutuhkan..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`plans.${index}.rto`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Input placeholder="Contoh: 4 Jam" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell className="align-top">
        <FormField
          control={control}
          name={`plans.${index}.rpo`}
          render={({ field }) => (
            <FormItem>
              <FormControl><Input placeholder="Contoh: 1 Jam" {...field} /></FormControl>
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
          className="text-destructive hover:text-destructive"
          onClick={() => remove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
