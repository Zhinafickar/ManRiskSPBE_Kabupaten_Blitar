
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
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const opdName = userProfile?.role || 'N/A';
    const userName = userProfile?.fullName || 'N/A';

    const headerContent = [
        ["Laporan Manajemen Risiko"],
        ["Kabupaten Blitar"],
        [`Organisasi Perangkat Daerah (OPD): ${opdName}`],
        [], // Spacer row
        ['Nama Penginput:', userName],
        ['Tanggal Laporan:', today],
        [], // Spacer row
    ];

    const dataForSheet = data.map(row => {
        const newRow: { [key: string]: any } = {};
        headers.forEach(header => {
            const keyMap: { [key: string]: string[] } = {
                'Tanggal Laporan': ['createdAt'],
                'Peran Pengguna': ['userRole'],
                'Kategori Risiko': ['riskEvent'],
                'Risiko': ['impactArea', 'risiko'], // Check for both possible keys
                'Area Dampak': ['areaDampak'],
                'Penyebab': ['cause'],
                'Dampak': ['impact'],
                'Frekuensi': ['frequency'],
                'Besaran Dampak': ['impactMagnitude'],
                'Tingkat Risiko': ['riskLevel'],
                'Kontrol Organisasi': ['kontrolOrganisasi'],
                'Kontrol Orang': ['kontrolOrang'],
                'Kontrol Fisik': ['kontrolFisik'],
                'Kontrol Teknologi': ['kontrolTeknologi'],
                'Mitigasi': ['mitigasi'],
                'Aktivitas': ['aktivitas'],
                'Target Waktu': ['targetWaktu'],
                'PIC': ['pic'],
                'Sumberdaya': ['sumberdaya'],
                'RTO': ['rto'],
                'RPO': ['rpo'],
                'Tanggal Dibuat': ['createdAt'],
            };
            
            const possibleKeys = keyMap[header];
            if (possibleKeys) {
                // Find the first key that exists in the row object and has a value
                const key = possibleKeys.find(k => row[k] !== undefined && row[k] !== null);
                newRow[header] = key ? row[key] : '';
            } else {
                 newRow[header] = '';
            }
        });
        return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(dataForSheet, { header: headers, skipHeader: false });
    XLSX.utils.sheet_add_aoa(ws, headerContent, { origin: "A1" });

    // --- Styling and Formatting ---
    const colWidths = headers.map(header => {
        const headerLength = header.length;
        const dataLengths = dataForSheet.map(row => (row[header]?.toString() || "").length);
        const maxLength = Math.max(...dataLengths, headerLength);
        return { wch: Math.min(maxLength + 5, 60) };
    });
    ws['!cols'] = colWidths;

     ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    ];
    
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;

            if (!ws[cell_ref].s) ws[cell_ref].s = {};
            ws[cell_ref].s.alignment = { wrapText: true, vertical: 'top' };

            // Apply bold to header rows
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
