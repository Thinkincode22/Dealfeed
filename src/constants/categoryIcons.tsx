import { Cpu, Shirt, Home, Dumbbell, Gamepad2, BookOpen, Blocks, UtensilsCrossed, HeartPulse, Car, Package } from 'lucide-react';
import type { Category } from './categories';

export const CATEGORY_ICONS: Record<Category, React.ComponentType<{ size?: number; className?: string }>> = {
    'Electronics': Cpu,
    'Fashion': Shirt,
    'Home & Garden': Home,
    'Sports': Dumbbell,
    'Gaming': Gamepad2,
    'Books': BookOpen,
    'Toys & Games': Blocks,
    'Food & Grocery': UtensilsCrossed,
    'Beauty & Health': HeartPulse,
    'Automotive': Car,
    'Other': Package,
};
