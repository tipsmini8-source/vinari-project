export type InsightType = 'positive' | 'warning' | 'danger' | 'info';
export type InsightPriority = 'high' | 'medium' | 'low';

export type FinancialInsight = {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
  priority: InsightPriority;
};
