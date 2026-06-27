export type CSVCell = string | number | boolean | null | undefined;
export type CSVRow = CSVCell[];
export type CSVObjectRow = Record<string, CSVCell>;

function escapeCSVCell(value: CSVCell) {
  if (value === null || value === undefined) {
    return '';
  }

  const text = String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function convertToCSV(rows: CSVRow[] | CSVObjectRow[]): string {
  if (rows.length === 0) {
    return '';
  }

  const firstRow = rows[0];

  if (Array.isArray(firstRow)) {
    return (rows as CSVRow[]).map((row) => row.map(escapeCSVCell).join(',')).join('\r\n');
  }

  const objectRows = rows as CSVObjectRow[];
  const headers = Object.keys(firstRow);
  const csvRows = [
    headers,
    ...objectRows.map((row) => headers.map((header) => row[header]))
  ];

  return csvRows.map((row) => row.map(escapeCSVCell).join(',')).join('\r\n');
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
