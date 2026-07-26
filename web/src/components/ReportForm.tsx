import { useRef, useState } from 'react';
import type { FieldError, Report } from '../types';
import { CATEGORY_LABELS } from '../types';

interface Props {
  onCreated: (report: Report) => void;
}

const EMPTY = { title: '', category: '', location: '', description: '' };

export function ReportForm({ onCreated }: Props) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;

  function set(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.status === 201) {
        setValues(EMPTY);
        setErrors([]);
        onCreated(await res.json());
      } else {
        const body = await res.json();
        setErrors(body.errors ?? [{ field: 'form', message: 'Something went wrong. Try again.' }]);
        // WCAG: move focus to the error summary so screen readers announce it
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    } catch {
      setErrors([{ field: 'form', message: 'Could not reach the server. Try again.' }]);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  function focusField(field: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      document.getElementById(field)?.focus();
    };
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.length > 0 && (
        <div
          className="error-summary"
          role="alert"
          aria-labelledby="error-summary-title"
          tabIndex={-1}
          ref={summaryRef}
        >
          <h2 id="error-summary-title">There is a problem</h2>
          <ul>
            {errors.map((err) => (
              <li key={err.field}>
                <a href={`#${err.field}`} onClick={focusField(err.field)}>
                  {err.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`field${errorFor('title') ? ' field--error' : ''}`}>
        <label htmlFor="title">Issue title</label>
        <p className="hint" id="title-hint">
          For example, "Broken street light outside number 12"
        </p>
        {errorFor('title') && (
          <p className="field-error" id="title-error">
            {errorFor('title')}
          </p>
        )}
        <input
          type="text"
          id="title"
          name="title"
          value={values.title}
          onChange={set('title')}
          aria-describedby={`title-hint${errorFor('title') ? ' title-error' : ''}`}
          aria-invalid={!!errorFor('title')}
        />
      </div>

      <div className={`field${errorFor('category') ? ' field--error' : ''}`}>
        <label htmlFor="category">Category</label>
        {errorFor('category') && (
          <p className="field-error" id="category-error">
            {errorFor('category')}
          </p>
        )}
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={set('category')}
          aria-describedby={errorFor('category') ? 'category-error' : undefined}
          aria-invalid={!!errorFor('category')}
        >
          <option value="">Choose a category</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={`field${errorFor('location') ? ' field--error' : ''}`}>
        <label htmlFor="location">Location</label>
        <p className="hint" id="location-hint">
          Street name and number, or a nearby landmark
        </p>
        {errorFor('location') && (
          <p className="field-error" id="location-error">
            {errorFor('location')}
          </p>
        )}
        <input
          type="text"
          id="location"
          name="location"
          value={values.location}
          onChange={set('location')}
          aria-describedby={`location-hint${errorFor('location') ? ' location-error' : ''}`}
          aria-invalid={!!errorFor('location')}
        />
      </div>

      <div className={`field${errorFor('description') ? ' field--error' : ''}`}>
        <label htmlFor="description">Description</label>
        {errorFor('description') && (
          <p className="field-error" id="description-error">
            {errorFor('description')}
          </p>
        )}
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={set('description')}
          aria-describedby={errorFor('description') ? 'description-error' : undefined}
          aria-invalid={!!errorFor('description')}
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit report'}
      </button>
    </form>
  );
}
