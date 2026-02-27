/**
 * Agriculture API Service
 * Handles communication with backend optimization endpoint
 */

import axios from 'axios';
import type { AgricultureInput, AgricultureResult } from '@/types/agriculture';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agricultureService = {
  /**
   * Optimize agriculture production planning
   */
  async optimize(data: AgricultureInput): Promise<AgricultureResult> {
    try {
      // Sanitize yield_changes: rebuild from the crops list so every crop has a valid float value.
      // JSON.stringify converts NaN → null and null fails FastAPI float validation.
      // Missing crop keys (crops added after scenarios were created) also default to 0.0.
      const cropNames = data.crops.map(c => c.name);
      const sanitized = {
        ...data,
        scenarios: data.scenarios.map(s => ({
          ...s,
          yield_changes: Object.fromEntries(
            cropNames.map(name => {
              const v = (s.yield_changes as Record<string, any>)[name];
              return [name, Number.isFinite(v) ? v : 0.0];
            })
          ),
        })),
      };
      const response = await api.post<AgricultureResult>('/api/agriculture/optimize', sanitized);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        let message: string;
        if (Array.isArray(detail)) {
          // FastAPI validation errors return detail as array of {loc, msg, type}
          message = detail.map((d: any) => `${d.loc?.join(' → ') ?? ''}: ${d.msg}`).join('; ');
        } else if (typeof detail === 'string') {
          message = detail;
        } else if (detail) {
          message = JSON.stringify(detail);
        } else {
          message = `Request failed with status ${error.response?.status ?? 'unknown'}`;
        }
        throw new Error(message);
      }
      throw error;
    }
  },

  /**
   * Health check for agriculture endpoint
   */
  async healthCheck(): Promise<{ status: string; module: string }> {
    const response = await api.get('/api/agriculture/health');
    return response.data;
  },
};

export default agricultureService;
