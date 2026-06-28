import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Lightbulb,
  Target,
  Wallet
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { FinancialInsight } from '@features/insight/types/insight.types';

export type FriendlyInsightStatusTone = 'important' | 'check' | 'suggestion' | 'good';
export type FriendlyInsightGroup = 'priority' | 'other' | 'good';

export type FriendlyInsight = {
  id: string;
  title: string;
  message: string;
  statusLabel: 'Penting' | 'Perlu Dicek' | 'Saran' | 'Kabar Baik' | 'Sudah Baik';
  statusTone: FriendlyInsightStatusTone;
  group: FriendlyInsightGroup;
  icon: LucideIcon;
  actionLabel?: string;
  actionUrl?: string;
};

function appRoute(url?: string) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith('/app/')) {
    return url;
  }

  if (url === '/wallets') {
    return '/app/wallets';
  }

  if (url === '/debts') {
    return '/app/debts';
  }

  if (url === '/reports') {
    return '/app/reports';
  }

  if (url === '/budgets') {
    return '/app/budgets';
  }

  if (url === '/subscriptions') {
    return '/app/subscriptions';
  }

  if (url === '/goals') {
    return '/app/goals';
  }

  return url;
}

function fallbackStatus(insight: FinancialInsight): Pick<FriendlyInsight, 'group' | 'statusLabel' | 'statusTone'> {
  if (insight.type === 'positive') {
    return {
      group: 'good',
      statusLabel: 'Kabar Baik',
      statusTone: 'good'
    };
  }

  if (insight.type === 'danger' || insight.priority === 'high') {
    return {
      group: 'priority',
      statusLabel: 'Penting',
      statusTone: 'important'
    };
  }

  if (insight.type === 'warning' || insight.priority === 'medium') {
    return {
      group: 'other',
      statusLabel: 'Perlu Dicek',
      statusTone: 'check'
    };
  }

  return {
    group: 'other',
    statusLabel: 'Saran',
    statusTone: 'suggestion'
  };
}

export function mapInsightToUserFriendlyInsight(insight: FinancialInsight): FriendlyInsight {
  const base = fallbackStatus(insight);
  const fallback: FriendlyInsight = {
    ...base,
    actionLabel: insight.action_label ? localizeActionLabel(insight.action_label) : undefined,
    actionUrl: appRoute(insight.action_url),
    icon: Lightbulb,
    id: insight.id,
    message: insight.message,
    title: insight.title
  };

  const mappings: Record<string, Partial<FriendlyInsight>> = {
    'budget-over': {
      actionLabel: 'Cek Batas',
      actionUrl: '/app/budgets',
      group: 'priority',
      icon: AlertTriangle,
      message: 'Ada pengeluaran yang sudah melewati batas. Cek lagi agar tidak kebablasan.',
      statusLabel: 'Penting',
      statusTone: 'important',
      title: 'Batas pengeluaran terlewati'
    },
    'budget-warning': {
      actionLabel: 'Cek Batas',
      actionUrl: '/app/budgets',
      group: 'other',
      icon: AlertTriangle,
      message: 'Beberapa batas pengeluaran hampir habis. Lebih hati-hati untuk sisa periode ini.',
      statusLabel: 'Perlu Dicek',
      statusTone: 'check',
      title: 'Pengeluaran hampir melewati batas'
    },
    'cashflow-even': {
      actionLabel: 'Lihat Ringkasan',
      actionUrl: '/app/reports',
      group: 'other',
      icon: CircleDollarSign,
      message: 'Uang masuk dan uang keluar sedang cukup seimbang. Tetap pantau agar tidak mulai berkurang.',
      statusLabel: 'Saran',
      statusTone: 'suggestion',
      title: 'Uang masih seimbang'
    },
    'cashflow-negative': {
      actionLabel: 'Lihat Ringkasan',
      actionUrl: '/app/reports',
      group: 'priority',
      icon: CircleDollarSign,
      message: 'Periode ini uang keluar lebih besar daripada uang masuk. Coba kurangi pengeluaran yang tidak penting.',
      statusLabel: 'Penting',
      statusTone: 'important',
      title: 'Uang keluar lebih besar'
    },
    'cashflow-positive': {
      actionLabel: 'Lihat Ringkasan',
      actionUrl: '/app/reports',
      group: 'good',
      icon: CheckCircle2,
      message: 'Uang masuk masih lebih besar daripada uang keluar. Pertahankan kebiasaan baik ini.',
      statusLabel: 'Kabar Baik',
      statusTone: 'good',
      title: 'Uang masuk masih lebih besar'
    },
    'debt-active': {
      actionLabel: 'Lihat Hutang',
      actionUrl: '/app/debts',
      group: 'other',
      icon: Landmark,
      message: 'Masih ada cicilan aktif yang perlu dipantau. Cek jadwal agar pembayaran tetap rapi.',
      statusLabel: 'Perlu Dicek',
      statusTone: 'check',
      title: 'Cicilan aktif perlu dipantau'
    },
    'debt-high-ratio': {
      actionLabel: 'Lihat Hutang',
      actionUrl: '/app/debts',
      group: 'priority',
      icon: Landmark,
      message: 'Cicilan kamu mulai besar dibanding pemasukan. Coba prioritaskan pembayaran yang paling dekat jatuh tempo.',
      statusLabel: 'Penting',
      statusTone: 'important',
      title: 'Cicilan mulai terlalu besar'
    },
    'debt-none': {
      actionLabel: 'Lihat Hutang',
      actionUrl: '/app/debts',
      group: 'good',
      icon: CheckCircle2,
      message: 'Belum ada hutang aktif yang perlu dibayar saat ini. Kondisi ini bagus untuk ruang bernapas.',
      statusLabel: 'Kabar Baik',
      statusTone: 'good',
      title: 'Tidak ada cicilan aktif'
    },
    'emergency-fund-low': {
      actionLabel: 'Cek Dompet',
      actionUrl: '/app/wallets',
      group: 'priority',
      icon: Wallet,
      message: 'Saldo kamu belum cukup untuk menutup pengeluaran rutin selama 1 bulan. Mulai sisihkan sedikit demi sedikit.',
      statusLabel: 'Penting',
      statusTone: 'important',
      title: 'Dana darurat masih rendah'
    },
    'emergency-fund-progress': {
      actionLabel: 'Cek Dompet',
      actionUrl: '/app/wallets',
      group: 'other',
      icon: Wallet,
      message: 'Saldo sudah mulai membantu menutup kebutuhan rutin, tapi masih bisa diperkuat lagi.',
      statusLabel: 'Saran',
      statusTone: 'suggestion',
      title: 'Dana cadangan mulai terbentuk'
    },
    'emergency-fund-strong': {
      actionLabel: 'Lihat Ringkasan',
      actionUrl: '/app/reports',
      group: 'good',
      icon: CheckCircle2,
      message: 'Saldo kamu mulai cukup untuk menghadapi kebutuhan mendadak. Pertahankan ritme ini.',
      statusLabel: 'Sudah Baik',
      statusTone: 'good',
      title: 'Dana cadangan mulai kuat'
    },
    'expense-top-category': {
      actionLabel: 'Lihat Ringkasan',
      actionUrl: '/app/reports',
      group: insight.type === 'warning' ? 'other' : 'other',
      icon: CreditCard,
      message:
        insight.type === 'warning'
          ? 'Ada satu kategori yang cukup mendominasi pengeluaran periode ini. Cek apakah masih sesuai kebutuhan.'
          : 'Ada kategori pengeluaran yang paling besar periode ini. Cek untuk tahu pola belanja kamu.',
      statusLabel: insight.type === 'warning' ? 'Perlu Dicek' : 'Saran',
      statusTone: insight.type === 'warning' ? 'check' : 'suggestion',
      title: 'Pengeluaran terbesar perlu dilihat'
    },
    'goal-active': {
      actionLabel: 'Lihat Target',
      actionUrl: '/app/goals',
      group: 'good',
      icon: Target,
      message: 'Target tabungan sudah berjalan. Tambahkan sedikit demi sedikit agar progres tetap terasa.',
      statusLabel: 'Kabar Baik',
      statusTone: 'good',
      title: 'Target tabungan sudah berjalan'
    },
    'goal-nearly-achieved': {
      actionLabel: 'Lihat Target',
      actionUrl: '/app/goals',
      group: 'good',
      icon: Target,
      message: 'Ada target yang sudah dekat tercapai. Sedikit lagi, teruskan langkah baik ini.',
      statusLabel: 'Kabar Baik',
      statusTone: 'good',
      title: 'Target hampir tercapai'
    },
    'goal-none': {
      actionLabel: 'Lihat Target',
      actionUrl: '/app/goals',
      group: 'other',
      icon: Target,
      message: 'Kamu belum punya target tabungan aktif. Mulai dari target kecil agar lebih mudah konsisten.',
      statusLabel: 'Saran',
      statusTone: 'suggestion',
      title: 'Belum ada target tabungan'
    }
  };

  return {
    ...fallback,
    ...mappings[insight.id]
  };
}

function localizeActionLabel(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes('wallet') || normalized.includes('dompet')) {
    return 'Cek Dompet';
  }

  if (normalized.includes('debt') || normalized.includes('hutang')) {
    return 'Lihat Hutang';
  }

  if (normalized.includes('budget')) {
    return 'Cek Batas';
  }

  if (normalized.includes('goal') || normalized.includes('target')) {
    return 'Lihat Target';
  }

  if (normalized.includes('report') || normalized.includes('laporan')) {
    return 'Lihat Ringkasan';
  }

  if (normalized.includes('transaction') || normalized.includes('transaksi')) {
    return 'Lihat Catatan';
  }

  return label;
}
