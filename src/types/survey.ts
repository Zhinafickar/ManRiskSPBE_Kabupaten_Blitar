export interface Survey {
    id: string;
    userId: string;
    userRole: string;
    riskEvent: string;
    impactArea: string;
    cause: string;
    impact: string;
    frequency: string;
    impactMagnitude: string;
    surveyType: 1 | 2;
    createdAt: string;
    eventDate: any;
    riskLevel?: string;
    kontrolOrganisasi?: string;
    kontrolOrang?: string;
    kontrolFisik?: string;
    kontrolTeknologi?: string;
    mitigasi?: string;
}
