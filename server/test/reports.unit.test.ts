import { describe, expect, it } from 'vitest';
import { ReportStore, validateReportInput } from '../src/reports.js';

const valid = {
  title: 'Broken street light',
  category: 'lighting',
  location: 'Jalan Sudirman 12',
  description: 'Light has been out for a week',
};

describe('validateReportInput', () => {
  it('accepts valid input and trims whitespace', () => {
    const { input, errors } = validateReportInput({ ...valid, title: '  Broken street light  ' });
    expect(errors).toEqual([]);
    expect(input?.title).toBe('Broken street light');
  });

  it('rejects missing fields with one error per field', () => {
    const { input, errors } = validateReportInput({});
    expect(input).toBeUndefined();
    expect(errors.map((e) => e.field).sort()).toEqual(['category', 'description', 'location', 'title']);
  });

  it('rejects unknown category', () => {
    const { errors } = validateReportInput({ ...valid, category: 'ufo' });
    expect(errors).toEqual([{ field: 'category', message: 'Select a category' }]);
  });

  it('rejects title over 100 chars', () => {
    const { errors } = validateReportInput({ ...valid, title: 'x'.repeat(101) });
    expect(errors[0].field).toBe('title');
  });

  it('rejects description over 1000 chars', () => {
    const { errors } = validateReportInput({ ...valid, description: 'x'.repeat(1001) });
    expect(errors[0].field).toBe('description');
  });

  it('rejects non-string values', () => {
    const { errors } = validateReportInput({ ...valid, title: 42 });
    expect(errors[0].field).toBe('title');
  });
});

describe('ReportStore', () => {
  it('creates reports with incrementing ids and open status', () => {
    const store = new ReportStore();
    const a = store.create(valid as never);
    const b = store.create(valid as never);
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(a.status).toBe('open');
  });

  it('lists newest first and filters by category and status', () => {
    const store = new ReportStore();
    store.create(valid as never);
    const b = store.create({ ...valid, category: 'roads' } as never);
    store.updateStatus(b.id, 'resolved');

    expect(store.list().map((r) => r.id)).toEqual([2, 1]);
    expect(store.list({ category: 'roads' })).toHaveLength(1);
    expect(store.list({ status: 'resolved' }).map((r) => r.id)).toEqual([2]);
    expect(store.list({ category: 'roads', status: 'open' })).toHaveLength(0);
  });

  it('updateStatus returns undefined for unknown id', () => {
    expect(new ReportStore().updateStatus(99, 'resolved')).toBeUndefined();
  });
});
