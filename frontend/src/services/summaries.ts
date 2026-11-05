import { api } from "./api";
import { Activity } from "@/types/domain";
import { ActivityDTO, mapActivity } from "./activities";

export type MonthlySummary = {
  year: number;
  month: number;
  realizedEntries: number;
  realizedExits: number;
  realizedResult: number;
  plannedEntries: number;
  plannedExits: number;
  projection: number;
  goalValue: number | null;
  distanceToGoal: number | null;
  realizedPercentage: number | null;
  projectionPartial: boolean;
  activitiesWithoutKnownPlannedValue: number;
  activitiesWithoutKnownRealizedValue: number;
  activities: Activity[];
};

type SummaryDTO = Omit<MonthlySummary, "activities"> & {
  realizedEntries: number | string;
  realizedExits: number | string;
  realizedResult: number | string;
  plannedEntries: number | string;
  plannedExits: number | string;
  projection: number | string;
  goalValue: number | string | null;
  distanceToGoal: number | string | null;
  realizedPercentage: number | string | null;
  activities: ActivityDTO[];
};

function mapSummary(dto: SummaryDTO): MonthlySummary {
  return {
    ...dto,
    realizedEntries: Number(dto.realizedEntries),
    realizedExits: Number(dto.realizedExits),
    realizedResult: Number(dto.realizedResult),
    plannedEntries: Number(dto.plannedEntries),
    plannedExits: Number(dto.plannedExits),
    projection: Number(dto.projection),
    goalValue: dto.goalValue == null ? null : Number(dto.goalValue),
    distanceToGoal: dto.distanceToGoal == null ? null : Number(dto.distanceToGoal),
    realizedPercentage: dto.realizedPercentage == null ? null : Number(dto.realizedPercentage),
    activities: dto.activities.map(mapActivity),
  };
}

export const summariesService = {
  async history(year: number): Promise<MonthlySummary[]> {
    const data = await api<SummaryDTO[]>(`/api/monthly-summary/history?year=${year}`);
    return data.map(mapSummary);
  },
  async get(year: number, month: number): Promise<MonthlySummary> {
    const data = await api<SummaryDTO>(`/api/monthly-summary?year=${year}&month=${month}`);
    return mapSummary(data);
  },
  async saveGoal(year: number, month: number, value: number) {
    return api<{ id: string; year: number; month: number; value: number | string }>("/api/goals", {
      method: "PUT",
      body: JSON.stringify({ year, month, value }),
    });
  },
};
