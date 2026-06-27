import { useMutation, useQuery } from '@tanstack/react-query';

import { DecisionSimulatorService } from '@features/decision-simulator/services/decision-simulator.service';
import type {
  DebtSimulationInput,
  ExpenseSimulationInput,
  GoalSavingSimulationInput,
  SimulatorSnapshot
} from '@features/decision-simulator/types/decision-simulator.types';

export const decisionSimulatorKeys = {
  snapshot: (workspaceId: string | undefined) => ['decision-simulator-snapshot', workspaceId] as const
};

export function useDecisionSimulatorSnapshot(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: decisionSimulatorKeys.snapshot(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DecisionSimulatorService.getSnapshot(workspaceId);
    }
  });
}

export function useSimulateExpense(snapshot: SimulatorSnapshot | undefined) {
  return useMutation({
    mutationFn: (input: ExpenseSimulationInput) => {
      if (!snapshot) {
        throw new Error('Data simulator belum siap.');
      }

      return Promise.resolve(DecisionSimulatorService.simulateExpense(snapshot, input));
    }
  });
}

export function useSimulateDebt(snapshot: SimulatorSnapshot | undefined) {
  return useMutation({
    mutationFn: (input: DebtSimulationInput) => {
      if (!snapshot) {
        throw new Error('Data simulator belum siap.');
      }

      return Promise.resolve(DecisionSimulatorService.simulateDebt(snapshot, input));
    }
  });
}

export function useSimulateGoalSaving(snapshot: SimulatorSnapshot | undefined) {
  return useMutation({
    mutationFn: (input: GoalSavingSimulationInput) => {
      if (!snapshot) {
        throw new Error('Data simulator belum siap.');
      }

      return Promise.resolve(DecisionSimulatorService.simulateGoalSaving(snapshot, input));
    }
  });
}
