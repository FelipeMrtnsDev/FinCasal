import { LucideIcon } from "lucide-react";

export type SaleProduct = {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
};

export type Sale = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  date: string;
};

export type SalesStat = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "green" | "amber" | "neutral";
};
