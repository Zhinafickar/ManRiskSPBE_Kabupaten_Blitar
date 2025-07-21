
'use client';

import * as XLSX from 'xlsx';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import type { UserProfile } from '@/types/user';

const riskLevelColors: { [key: string]: string } = {
    'Bahaya': 'DC2626',   // red-600
    'Sedang': 'EAB308',   // yellow-500
    'Rendah': '16A34A',   // green-600
    'Minor':  '2563EB',   // blue-600
};

interface ExportParams {
    surveys: Survey[];
    continuityPlans: ContinuityPlan[];
    fileName: string;
    userProfile: UserProfile | null;
}

export const exportToExcel = ({ surveys, continuityPlans, fileName, userProfile }: ExportParams) => {
    const wb = XLSX.utils.book_new();

    const addSheetWithHeader = (
        workbook: XLSX.WorkBook,
        sheetName: string,
        data: any[],
        headers: string[]
    ) => {
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
        
        XLSX.utils.sheet_add_aoa(ws, headerRows, { origin: 'A1' });

        // Merge cells for main titles
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } },
        ];

        // Apply bold style to headers
        for (let i = 1; i <= 6; i++) {
            const cellA = ws[`A${i}`];
            if (cellA) {
                cellA.s = { font: { bold: true } };
            }
            if (i <= 3) {
                 if (cellA) cellA.s.alignment = { horizontal: 'center' };
            }
        }
        
        // --- Data Section ---
        XLSX.utils.sheet_add_json(ws, data, { origin: 'A8', skipHeader: true });
        
        // Set column widths and styles
        const colWidths = headers.map((key, i) => {
             const keyName = Object.keys(data[0] || {})[i] || '';
             const headerLength = key.length;
             const dataLengths = data.map(row => {
                const value = (row as any)[keyName];
                if (typeof value === 'string' && value.includes('\n')) {
                    // For multiline strings, get the length of the longest line
                    return Math.max(...value.split('\n').map(line => line.length));
                }
                return (value?.toString() || "").length;
             });

            return {
                wch: Math.min(Math.max(...dataLengths, headerLength) + 2, 80)
            };
        });
        ws['!cols'] = colWidths;
        
        // Wrap text for all cells
        for (let R = 0; R < (ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).e.r : 0) + 1; ++R) {
             for (let C = 0; C < (ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).e.c : 0) + 1; ++C) {
                const cell_address = {c:C, r:R};
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (ws[cell_ref]) {
                    ws[cell_ref].s = { ...ws[cell_ref].s, alignment: { wrapText: true, vertical: 'top' } };
                }
            }
        }
        
        XLSX.utils.book_append_sheet(workbook, ws, sheetName);
        return ws;
    };


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

        const wsSurveys = addSheetWithHeader(wb, 'Hasil Survei', surveyDataForSheet, surveyHeaders);

        const riskLevelColIndex = 9; // 'J' corresponds to Tingkat Risiko
        surveyDataForSheet.forEach((row, index) => {
            const riskLevel = row.riskLevel;
            if (riskLevel && riskLevelColors[riskLevel]) {
                const cellAddress = XLSX.utils.encode_cell({c: riskLevelColIndex, r: index + 7});
                if (wsSurveys[cellAddress]) {
                    wsSurveys[cellAddress].s = {
                        ...wsSurveys[cellAddress].s,
                        fill: { fgColor: { rgb: riskLevelColors[riskLevel] } },
                        font: { color: { rgb: riskLevel === 'Sedang' ? "000000" : "FFFFFF" } }
                    };
                }
            }
        });
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
        
        addSheetWithHeader(wb, 'Rencana Kontinuitas', planDataForSheet, planHeaders);
    }
    
    if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        console.log("No data available to export.");
    }
};
