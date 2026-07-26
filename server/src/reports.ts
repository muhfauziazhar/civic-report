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

export interface ReportInput {
  title: string;
  category: Category;
  location: string;
  description: string;
}

export const CATEGORIES: Category[] = ['roads', 'lighting', 'waste', 'water', 'other'];
const STATUSES: Status[] = ['open', 'in_progress', 'resolved'];

export interface FieldError {
  field: string;
  message: string;
}

export function validateReportInput(body: unknown): { input?: ReportInput; errors: FieldError[] } {
  const errors: FieldError[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  const location = typeof b.location === 'string' ? b.location.trim() : '';
  const description = typeof b.description === 'string' ? b.description.trim() : '';
  const category = b.category as Category;

  if (!title) errors.push({ field: 'title', message: 'Enter a short title for the issue' });
  else if (title.length > 100) errors.push({ field: 'title', message: 'Title must be 100 characters or fewer' });

  if (!CATEGORIES.includes(category)) errors.push({ field: 'category', message: 'Select a category' });

  if (!location) errors.push({ field: 'location', message: 'Enter the location of the issue' });

  if (!description) errors.push({ field: 'description', message: 'Describe the issue' });
  else if (description.length > 1000) errors.push({ field: 'description', message: 'Description must be 1000 characters or fewer' });

  if (errors.length) return { errors };
  return { input: { title, category, location, description }, errors: [] };
}

export function isValidStatus(s: unknown): s is Status {
  return STATUSES.includes(s as Status);
}

// ponytail: in-memory store — swap for a DB repo when persistence is needed
export class ReportStore {
  private reports = new Map<number, Report>();
  private nextId = 1;

  create(input: ReportInput): Report {
    const report: Report = {
      id: this.nextId++,
      ...input,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.reports.set(report.id, report);
    return report;
  }

  list(filter?: { category?: Category; status?: Status }): Report[] {
    let all = [...this.reports.values()];
    if (filter?.category) all = all.filter((r) => r.category === filter.category);
    if (filter?.status) all = all.filter((r) => r.status === filter.status);
    return all.sort((a, b) => b.id - a.id);
  }

  get(id: number): Report | undefined {
    return this.reports.get(id);
  }

  updateStatus(id: number, status: Status): Report | undefined {
    const report = this.reports.get(id);
    if (!report) return undefined;
    report.status = status;
    return report;
  }
}
