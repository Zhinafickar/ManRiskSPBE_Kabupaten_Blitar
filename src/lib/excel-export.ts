'use client';

import * as XLSX from 'xlsx';
import type { Survey } from '@/types/survey';

// Corresponds to the colors used in RiskIndicatorBadge
const riskLevelColors: { [key: string]: string } = {
    'Bahaya': 'DC2626',   // red-600
    'Sedang': 'EAB308',   // yellow-500
    'Rendah': '16A34A',   // green-600
    'Minor':  '2563EB',   // blue-600
};

export const exportToExcel = (surveys: Survey[], fileName: string) => {
    if (!surveys || surveys.length === 0) {
        console.log("No data to export.");
        return;
    }

    // Prepare data with selected fields for the worksheet
    const dataForSheet = surveys.map(survey => ({
        'Peran Pengguna': survey.userRole,
        'Kategori Risiko': survey.riskEvent,
        'Risiko': survey.impactArea,
        'Area Dampak': survey.areaDampak || 'N/A',
        'Waktu Kejadian': survey.eventDate ? new Date(survey.eventDate).toLocaleDateString('id-ID') : 'N/A',
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

    // Create a new worksheet from JSON
    const ws = XLSX.utils.json_to_sheet(dataForSheet);

    // Apply styles to the 'Tingkat Risiko' column
    const riskLevelColIndex = 'J'; // Corresponds to 'Tingkat Risiko'
    dataForSheet.forEach((row, index) => {
        const riskLevel = row['Tingkat Risiko'];
        if (riskLevel && riskLevelColors[riskLevel]) {
            const cellAddress = `${riskLevelColIndex}${index + 2}`; // +2 because of header row and 1-based indexing
            if (ws[cellAddress]) {
                ws[cellAddress].s = {
                    fill: {
                        fgColor: { rgb: riskLevelColors[riskLevel] }
                    },
                    font: {
                        // Use black text for yellow background for better readability
                        color: { rgb: riskLevel === 'Sedang' ? "000000" : "FFFFFF" }
                    }
                };
            }
        }
    });

    // Auto-fit columns for better readability
    const colWidths = Object.keys(dataForSheet[0]).map(key => {
        let maxLength = key.length; // Start with header length
        dataForSheet.forEach(row => {
            const value = (row as any)[key];
            const valueLength = value ? value.toString().length : 0;
            if (valueLength > maxLength) {
                maxLength = valueLength;
            }
        });
        return { wch: Math.min(maxLength + 2, 80) }; // Set max width to 80 chars
    });
    ws['!cols'] = colWidths;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Survei');

    // Write the workbook and trigger download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};
