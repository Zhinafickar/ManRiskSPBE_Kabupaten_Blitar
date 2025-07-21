
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
    headers: string[],
    userProfile: UserProfile | null
) => {
    // Create an empty worksheet with just the data headers to establish columns
    const ws = XLSX.utils.json_to_sheet([], { header: headers });

    // --- Header Section ---
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const opdName = userProfile?.role || 'N/A';
    const userName = userProfile?.fullName || 'N/A';

    const headerRows = [
        ['Laporan Manajemen Risiko'],
        ['Kabupaten Blitar'],
        [`Organisasi Perangkat Daerah (OPD): ${opdName}`],
        [], // Spacer row
        ['Nama Penginput:', userName],
        ['Tanggal Laporan:', today]
    ];
    
    // Add the header rows to the worksheet starting from cell A1
    XLSX.utils.sheet_add_aoa(ws, headerRows, { origin: 'A1' });

    // Merge cells for the main titles to make them span across the table width
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    ];
    
    // --- Data Section ---
    // Add the actual JSON data to the sheet, starting after the header block (at row 8, which is A8)
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A8', skipHeader: true });

    // --- Styling and Formatting ---
    const colWidths = headers.map((header, i) => {
        const keyName = Object.keys(data[0] || {})[i] || '';
        const headerLength = header.length;
        const dataLengths = data.map(row => {
            const value = (row as any)[keyName];
            if (typeof value === 'string' && value.includes('\n')) {
                // For multiline strings, get the length of the longest line
                return Math.max(...value.split('\n').map(line => line.length));
            }
            return (value?.toString() || "").length;
        });

        return {
            wch: Math.min(Math.max(...dataLengths, headerLength) + 2, 80) // Set a max width of 80
        };
    });
    ws['!cols'] = colWidths;

    // Iterate over all cells to apply word wrap
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (ws[cell_ref]) {
                ws[cell_ref].s = { ...ws[cell_ref].s, alignment: { wrapText: true, vertical: 'top' } };
            }
        }
    }
    
    // Append the finished worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    return ws; // Return worksheet for further modification if needed
};


export const exportToExcel = ({ surveys, continuityPlans, fileName, userProfile }: ExportParams) => {
    const wb = XLSX.utils.book_new();

    if (surveys && surveys.length > 0) {
        const surveyHeaders = [
            'Tanggal Laporan', 'Peran Pengguna', 'Kategori Risiko', 'Risiko',
            'Area Dampak', 'Penyebab', 'Dampak', 'Frekuensi', 'Besaran Dampak',
            'Tingkat Risiko', 'Kontrol Organisasi', 'Kontrol Orang', 'Kontrol Fisik',
            'Kontrol Teknologi', 'Mitigasi'
        ];
        const surveyDataForSheet = surveys.map(survey => ({
            createdAt: survey.createdAt ? new Date(survey.createdAt).toLocaleDateString('id-ID') : 'N/A',
            userRole: survey.userRole,
            riskEvent: survey.riskEvent,
            impactArea: survey.impactArea,
            areaDampak: survey.areaDampak || 'N/A',
            cause: survey.cause || 'N/A',
            impact: survey.impact || 'N/A',
            frequency: survey.frequency,
            impactMagnitude: survey.impactMagnitude,
            riskLevel: survey.riskLevel || 'N/A',
            kontrolOrganisasi: survey.kontrolOrganisasi?.join('\n') || 'N/A',
            kontrolOrang: survey.kontrolOrang?.join('\n') || 'N/A',
            kontrolFisik: survey.kontrolFisik?.join('\n') || 'N/A',
            kontrolTeknologi: survey.kontrolTeknologi?.join('\n') || 'N/A',
            mitigasi: survey.mitigasi || 'N/A',
        }));

        createSheetWithHeader(wb, 'Hasil Survei', surveyDataForSheet, surveyHeaders, userProfile);
    }

    if (continuityPlans && continuityPlans.length > 0) {
        const planHeaders = [
            'Peran Pengguna', 'Risiko', 'Aktivitas', 'Target Waktu', 'PIC', 
            'Sumberdaya', 'RTO', 'RPO', 'Tanggal Dibuat'
        ];
        const planDataForSheet = continuityPlans.map(plan => ({
            userRole: plan.userRole,
            risiko: plan.risiko,
            aktivitas: plan.aktivitas,
            targetWaktu: plan.targetWaktu,
            pic: plan.pic,
            sumberdaya: plan.sumberdaya,
            rto: plan.rto,
            rpo: plan.rpo,
            createdAt: new Date(plan.createdAt).toLocaleString('id-ID'),
        }));
        
        createSheetWithHeader(wb, 'Rencana Kontinuitas', planDataForSheet, planHeaders, userProfile);
    }
    
    if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        console.log("No data available to export.");
    }
};
