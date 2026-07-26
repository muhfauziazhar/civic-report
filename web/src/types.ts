export type Category = 'roads' | 'lighting' | 'waste' | 'water' | 'other';
export type Status = 'open' | 'in_progress' | 'resolved';

export interface Report {
  id: number;
  title: string;
  category: Category;
  location: string;
  description: string;
  status: Status;
  createdAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  roads: 'Roads and pavements',
  lighting: 'Street lighting',
  waste: 'Waste and recycling',
  water: 'Water and drainage',
  other: 'Something else',
};

export const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};
