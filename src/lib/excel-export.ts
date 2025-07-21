
'use client';

import * as XLSX from 'xlsx';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';

// Corresponds to the colors used in RiskIndicatorBadge
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
}

export const exportToExcel = ({ surveys, continuityPlans, fileName }: ExportParams) => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // --- Create Survey Sheet ---
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
            'Kontrol Organisasi': survey.kontrolOrganisasi?.join('; ') || 'N/A',
            'Kontrol Orang': survey.kontrolOrang?.join('; ') || 'N/A',
            'Kontrol Fisik': survey.kontrolFisik?.join('; ') || 'N/A',
            'Kontrol Teknologi': survey.kontrolTeknologi?.join('; ') || 'N/A',
            'Mitigasi': survey.mitigasi || 'N/A',
        }));

        const wsSurveys = XLSX.utils.json_to_sheet(surveyDataForSheet);

        // Apply styles to the 'Tingkat Risiko' column
        const riskLevelColIndex = 'J'; // Corresponds to 'Tingkat Risiko'
        surveyDataForSheet.forEach((row, index) => {
            const riskLevel = row['Tingkat Risiko'];
            if (riskLevel && riskLevelColors[riskLevel]) {
                const cellAddress = `${riskLevelColIndex}${index + 2}`; // +2 because of header row and 1-based indexing
                if (wsSurveys[cellAddress]) {
                    wsSurveys[cellAddress].s = {
                        fill: { fgColor: { rgb: riskLevelColors[riskLevel] } },
                        font: { color: { rgb: riskLevel === 'Sedang' ? "000000" : "FFFFFF" } }
                    };
                }
            }
        });

        // Auto-fit columns for survey sheet
        const surveyColWidths = Object.keys(surveyDataForSheet[0]).map(key => ({
            wch: Math.min(Math.max(...surveyDataForSheet.map(row => ((row as any)[key]?.toString() || "").length), key.length) + 2, 80)
        }));
        wsSurveys['!cols'] = surveyColWidths;

        XLSX.utils.book_append_sheet(wb, wsSurveys, 'Hasil Survei');
    }

    // --- Create Continuity Plan Sheet ---
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

        const wsPlans = XLSX.utils.json_to_sheet(planDataForSheet);

        // Auto-fit columns for continuity plan sheet
        const planColWidths = Object.keys(planDataForSheet[0]).map(key => ({
            wch: Math.min(Math.max(...planDataForSheet.map(row => ((row as any)[key]?.toString() || "").length), key.length) + 2, 80)
        }));
        wsPlans['!cols'] = planColWidths;

        XLSX.utils.book_append_sheet(wb, wsPlans, 'Rencana Kontinuitas');
    }
    
    // Write the workbook and trigger download only if there's at least one sheet
    if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
        console.log("No data available to export.");
    }
};
