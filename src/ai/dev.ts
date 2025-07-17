import { config } from 'dotenv';
config();

import '@/ai/flows/risk-trend-analysis.ts';
import '@/ai/flows/suggest-continuity-plan.ts';
import '@/ai/flows/suggest-cause-impact.ts';
import '@/ai/flows/determine-risk-sentiment.ts';
import '@/ai/flows/summarize-risks-and-plans.ts';
import '@/ai/flows/sort-relevant-controls.ts';
