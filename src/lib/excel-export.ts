
'use client';

import * as XLSX from 'xlsx';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import type { UserProfile } from '@/types/user';

interface ExportParams {
    surveys: Survey[];
    continuityPlans: ContinuityPlan[];
    fileName: string;
    userProfile: UserProfile | null;
}

interface CsvExportParams {
    data: any[];
    fileName: string;
}

const createSheetWithHeader = (
    workbook: XLSX.WorkBook,
    sheetName: string,
    data: any[],
    userProfile: UserProfile | null
) => {
    if (!data || data.length === 0) {
        return;
    }

    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const opdName = userProfile?.role || 'N/A';
    const userName = userProfile?.fullName || 'N/A';
    const isAdminOrSuperAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

    const reportHeader: (string | Date | number)[][] = [
        ["Laporan Manajemen Risiko"],
        ["Kabupaten Blitar"],
    ];
    
    if (!isAdminOrSuperAdmin) {
        reportHeader.push([`Organisasi Perangkat Daerah (OPD): ${opdName}`]);
    }

    reportHeader.push(
        [], // Empty row for spacing
        ['pemilik laporan:', userName],
        ['Tanggal Laporan:', today],
        []  // Empty row for spacing
    );

    const dataHeaders = Object.keys(data[0]);
    const dataRows = data.map(row => dataHeaders.map(header => row[header]));

    const finalSheetData = [...reportHeader, dataHeaders, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(finalSheetData);

    const colWidths = dataHeaders.map((header: string) => {
        const headerLength = header ? header.length : 10;
        const dataLengths = data.map(row => {
            const value = row[header];
            return value ? String(value).length : 0;
        });
        const maxLength = Math.max(headerLength, ...dataLengths, 10);
        return { wch: Math.min(Math.max(maxLength, 10) + 2, 60) };
    });
    ws['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(ws['!ref']!);
    const headerRowCount = reportHeader.length;

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;
            if (!ws[cell_ref].s) ws[cell_ref].s = {};

            const isTitleHeaderRow = R < headerRowCount - 1;
            const isDataHeaderRow = R === headerRowCount - 1;
            const isDataRow = R >= headerRowCount;

            // Alignment and Wrapping
            if (isDataRow) {
                ws[cell_ref].s.alignment = { wrapText: true, vertical: 'top' };
            }

            // Bold styling
            if (isTitleHeaderRow || isDataHeaderRow) {
                 if (!ws[cell_ref].s.font) ws[cell_ref].s.font = {};
                 ws[cell_ref].s.font.bold = true;
            }
        }
    }
     if (dataHeaders.length > 1) {
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: dataHeaders.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: dataHeaders.length - 1 } },
            ...(!isAdminOrSuperAdmin ? [{ s: { r: 2, c: 0 }, e: { r: 2, c: dataHeaders.length - 1 } }] : [])
        ];
    }
    
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
};

export const exportToExcel = ({ surveys, continuityPlans, fileName, userProfile }: ExportParams) => {
    const wb = XLSX.utils.book_new();
    const isAdminOrSuperAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

    if (surveys && surveys.length > 0) {
        const surveyDataForSheet = surveys.map(survey => ({
            'Tanggal Laporan': survey.createdAt ? new Date(survey.createdAt).toLocaleDateString('id-ID') : 'N/A',
            ...(isAdminOrSuperAdmin ? { 'Peran Pengguna': survey.userRole } : {}),
            'Kategori Risiko': survey.riskEvent,
            'Risiko': survey.impactArea,
            'Area Dampak': survey.areaDampak || 'N/A',
            'Penyebab': survey.cause || 'N/A',
            'Dampak': survey.impact || 'N/A',
            'Frekuensi': survey.frequency,
            'Besaran Dampak': survey.impactMagnitude,
            'Tingkat Risiko': survey.riskLevel || 'N/A',
            'Kontrol Organisasi': survey.kontrolOrganisasi?.join('\n') || 'N/A',
            'Kontrol Orang': survey.kontrolOrang?.join('\n') || 'N/A',
            'Kontrol Fisik': survey.kontrolFisik?.join('\n') || 'N/A',
            'Kontrol Teknologi': survey.kontrolTeknologi?.join('\n') || 'N/A',
            'Mitigasi': survey.mitigasi || 'N/A',
        }));
        createSheetWithHeader(wb, 'Hasil Survei', surveyDataForSheet, userProfile);
    }

    if (continuityPlans && continuityPlans.length > 0) {
        const planDataForSheet = continuityPlans.map(plan => ({
            ...(isAdminOrSuperAdmin ? { 'Peran Pengguna': plan.userRole } : {}),
            'Risiko': plan.risiko,
            'Aktivitas': plan.aktivitas,
            'Target Waktu': plan.targetWaktu,
            'PIC': plan.pic, 
            'Sumberdaya': plan.sumberdaya,
            'RTO': plan.rto,
            'RPO': plan.rpo,
            'Tanggal Dibuat': new Date(plan.createdAt).toLocaleString('id-ID'),
        }));
        createSheetWithHeader(wb, 'Rencana Kontinuitas', planDataForSheet, userProfile);
    }
    
    if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    }
};

export const exportToCsv = ({ data, fileName }: CsvExportParams) => {
    if (!data || data.length === 0) return;

    // Use { skipHeader: true } to export only the data without the header row.
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    const csvString = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
