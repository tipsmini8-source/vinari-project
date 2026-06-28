import type { BudgetWithProgress } from '@features/budget/types/budget.types';
import type { DebtWithProgress } from '@features/debt/types/debt.types';
import type { GoalWithProgress } from '@features/goal/types/goal.types';
import type { Subscription } from '@features/recurring/types/recurring.types';

export type StatusFilterValue = 'active' | 'all' | 'completed';
export type DisplayStatus = 'active' | 'completed';

export const statusFilterOptions: Array<{ label: string; value: StatusFilterValue }> = [
  { label: 'Aktif', value: 'active' },
  { label: 'Semua', value: 'all' },
  { label: 'Selesai', value: 'completed' }
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function getBudgetDisplayStatus(budget: BudgetWithProgress): DisplayStatus {
  if (!budget.is_active || budget.end_date < today()) {
    return 'completed';
  }

  return 'active';
}

export function getGoalDisplayStatus(goal: GoalWithProgress): DisplayStatus {
  if (
    goal.current_amount >= goal.target_amount ||
    goal.percentage >= 100 ||
    goal.status === 'achieved' ||
    goal.status === 'cancelled'
  ) {
    return 'completed';
  }

  return 'active';
}

export function getSubscriptionDisplayStatus(subscription: Subscription): DisplayStatus {
  if (!subscription.is_active) {
    return 'completed';
  }

  return 'active';
}

export function getDebtDisplayStatus(debt: DebtWithProgress): DisplayStatus {
  if (debt.remaining_amount <= 0 || debt.status === 'paid' || debt.status === 'cancelled') {
    return 'completed';
  }

  return 'active';
}

export function filterByStatus<TItem>(
  items: TItem[],
  filter: StatusFilterValue,
  resolver: (item: TItem) => DisplayStatus
) {
  if (filter === 'all') {
    return items;
  }

  return items.filter((item) => resolver(item) === filter);
}
