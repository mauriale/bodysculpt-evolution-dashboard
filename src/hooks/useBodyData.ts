/**
 * useBodyData
 * Loads body tracking data preferring the live Excel file,
 * with instant display via the static bodyData.ts fallback.
 */
import { useState, useEffect } from 'react';
import {
  measurements as staticMeasurements,
  bodyCompositions as staticCompositions,
  nutritionData as staticNutrition,
  type Measurement,
  type BodyComposition,
  type NutritionEntry,
} from '@/data/bodyData';
import { loadBodyDataFromExcel } from '@/data/excelLoader';

export interface BodyDataState {
  measurements: Measurement[];
  bodyCompositions: BodyComposition[];
  nutritionData: NutritionEntry[];
  loading: boolean;
  lastUpdated: string | null;
  source: 'excel' | 'static';
}

export function useBodyData(): BodyDataState {
  const [state, setState] = useState<BodyDataState>({
    measurements:    staticMeasurements,
    bodyCompositions: staticCompositions,
    nutritionData:   staticNutrition,
    loading: true,
    lastUpdated: null,
    source: 'static',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadBodyDataFromExcel();
      if (cancelled) return;
      if (
        result &&
        result.measurements.length > 0 &&
        result.measurements.length >= staticMeasurements.length
      ) {
        // Excel has at least as many rows as static — use it
        setState({
          measurements:    result.measurements,
          bodyCompositions: result.bodyCompositions.length > 0
            ? result.bodyCompositions
            : staticCompositions,
          nutritionData:   result.nutritionData.length > 0
            ? result.nutritionData
            : staticNutrition,
          loading: false,
          lastUpdated: result.lastUpdated,
          source: 'excel',
        });
      } else {
        // Fallback: keep static data but stop loading spinner
        setState(prev => ({ ...prev, loading: false, source: 'static' }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
