
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

const createSheetWithHeader = (
    workbook: XLSX.WorkBook,
    sheetName: string,
    data: any[],
    userProfile: UserProfile | null
) => {
    if (!data || data.length === 0) {
        // If there's no data, don't create the sheet.
        return;
    }

    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const opdName = userProfile?.role || 'N/A';
    const userName = userProfile?.fullName || 'N/A';

    const reportHeader = [
        ["Laporan Manajemen Risiko"],
        ["Kabupaten Blitar"],
        [`Organisasi Perangkat Daerah (OPD): ${opdName}`],
        [], // Spacer
        ['Nama Penginput:', userName],
        ['Tanggal Laporan:', today],
        [], // Spacer
    ];

    const dataHeaders = Object.keys(data[0]);

    // Create worksheet with custom header first, then add data
    const ws = XLSX.utils.aoa_to_sheet(reportHeader);
    XLSX.utils.sheet_add_json(ws, data, {
        origin: 'A8', // Start data from row 8
        header: dataHeaders,
        skipHeader: false, // We include headers from the JSON itself
    });

    // --- Styling and Formatting ---
    const colWidths = dataHeaders.map((header: string) => {
        const headerLength = header ? header.length : 10;
        const dataLengths = data.map(row => {
            const value = row[header];
            return value ? String(value).length : 0;
        });
        const maxLength = Math.max(headerLength, ...dataLengths);
        return { wch: Math.min(maxLength + 5, 60) };
    });
    ws['!cols'] = colWidths;

    // Merge header cells
    if (dataHeaders.length > 1) {
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: dataHeaders.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: dataHeaders.length - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: dataHeaders.length - 1 } },
        ];
    }

    // Apply alignment and bolding to all cells
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;

            if (!ws[cell_ref].s) ws[cell_ref].s = {};
            
            // Default alignment
            ws[cell_ref].s.alignment = { wrapText: true, vertical: 'top' };

            // Apply bold to header rows (Report header + Table header)
            if (R < 7 || R === 7) { 
                 if (!ws[cell_ref].s.font) ws[cell_ref].s.font = {};
                 ws[cell_ref].s.font.bold = true;
            }
        }
    }
    
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
};

export const exportToExcel = ({ surveys, continuityPlans, fileName, userProfile }: ExportParams) => {
    const wb = XLSX.utils.book_new();

    if (surveys && surveys.length > 0) {
        const surveyDataForSheet = surveys.map(survey => ({
            'Tanggal Laporan': survey.createdAt ? new Date(survey.createdAt).toLocaleDateString('id-ID') : 'N/A',
            'Peran Pengguna': survey.userRole,
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
            'Peran Pengguna': plan.userRole,
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
