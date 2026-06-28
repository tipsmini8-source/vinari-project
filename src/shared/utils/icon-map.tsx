import {
  Baby,
  Banknote,
  BookOpen,
  Car,
  CircleDollarSign,
  CreditCard,
  Dog,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Hospital,
  Plane,
  Receipt,
  Shield,
  Shirt,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon
} from 'lucide-react';

export const categoryIconMap = {
  baby: Baby,
  banknote: Banknote,
  'book-open': BookOpen,
  car: Car,
  'circle-dollar-sign': CircleDollarSign,
  'credit-card': CreditCard,
  dog: Dog,
  'gamepad-2': Gamepad2,
  gift: Gift,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  home: Home,
  hospital: Hospital,
  plane: Plane,
  receipt: Receipt,
  shield: Shield,
  shirt: Shirt,
  'shopping-bag': ShoppingBag,
  smartphone: Smartphone,
  utensils: Utensils,
  wallet: Wallet,
  wifi: Wifi,
  zap: Zap
} satisfies Record<string, LucideIcon>;

export const categoryIconOptions = Object.keys(categoryIconMap);

export function getCategoryIcon(iconName?: string | null) {
  if (!iconName) {
    return CircleDollarSign;
  }

  return categoryIconMap[iconName.trim().toLowerCase() as keyof typeof categoryIconMap] ?? CircleDollarSign;
}
