
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

    const headerRows = [
        ['Laporan Manajemen Risiko'],
        ['Kabupaten Blitar'],
        [`Organisasi Perangkat Daerah (OPD): ${opdName}`],
        [], // Spacer row
        ['Nama Penginput:', userName],
        ['Tanggal Laporan:', today],
        [], // Spacer row
    ];

    const ws_data = [
      ...headerRows,
      headers,
      ...data.map(row => headers.map(header => {
            const key = Object.keys(data[0] || {}).find(k => k.toLowerCase() === header.toLowerCase().replace(/ /g, '')) || header;
            // A bit of a hack to map headers to keys, ideally keys would be consistent
             const keyMap: { [key: string]: string } = {
                'tanggallaporan': 'createdAt',
                'peranpengguna': 'userRole',
                'kategoririsiko': 'riskEvent',
                'risiko': 'risiko' in row ? row.risiko : row.impactArea,
                'areadampak': 'areaDampak',
                'penyebab': 'cause',
                'dampak': 'impact',
                'frekuensi': 'frequency',
                'besarandampak': 'impactMagnitude',
                'tingkatrisiko': 'riskLevel',
                'kontrolorganisasi': 'kontrolOrganisasi',
                'kontrolorang': 'kontrolOrang',
                'kontrolfisik': 'kontrolFisik',
                'kontrolteknologi': 'kontrolTeknologi',
                'mitigasi': 'mitigasi',
                'aktivitas': 'aktivitas',
                'targetwaktu': 'targetWaktu',
                'pic': 'pic',
                'sumberdaya': 'sumberdaya',
                'rto': 'rto',
                'rpo': 'rpo',
                'tanggaldibuat': 'createdAt',
            };
            const dataKey = keyMap[header.toLowerCase().replace(/ /g, '')];
            return (row as any)[dataKey] || '';
      }))
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // --- Styling and Formatting ---
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
    ];

    const colWidths = headers.map((header, i) => {
        const keyName = Object.keys(data[0] || {})[i] || '';
        const headerLength = header.length;
        const dataLengths = data.map(row => {
            const value = (row as any)[keyName];
            if (typeof value === 'string' && value.includes('\n')) {
                return Math.max(...value.split('\n').map(line => line.length));
            }
            return (value?.toString() || "").length;
        });

        return {
            wch: Math.min(Math.max(...dataLengths, headerLength, 15) + 5, 60)
        };
    });
    ws['!cols'] = colWidths;

    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (ws[cell_ref]) {
                if (!ws[cell_ref].s) ws[cell_ref].s = {};
                // Apply word wrap and top alignment to all cells
                ws[cell_ref].s.alignment = { ...ws[cell_ref].s.alignment, wrapText: true, vertical: 'top' };
                
                // Apply bold to header rows (first 3), spacer rows (4,6), info rows(5,7), and table header (8)
                if (R < 8) { // This now covers all header content and the table header row
                     if (!ws[cell_ref].s.font) ws[cell_ref].s.font = {};
                     ws[cell_ref].s.font.bold = true;
                }
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
