export const recurringMoneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

export const recurringDateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

export function formatRecurringMoney(value: number) {
  return recurringMoneyFormatter.format(value);
}

export function formatRecurringDate(value: string) {
  return recurringDateFormatter.format(new Date(value));
}
