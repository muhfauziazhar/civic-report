import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportForm } from './ReportForm';

const validReport = {
  id: 1,
  title: 'Broken light',
  category: 'lighting',
  location: 'Jalan Sudirman 12',
  description: 'Out for a week',
  status: 'open',
  createdAt: '2026-07-26T00:00:00.000Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('ReportForm', () => {
  it('submits valid input and calls onCreated', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 201, json: async () => validReport }),
    );
    const onCreated = vi.fn();
    render(<ReportForm onCreated={onCreated} />);

    await userEvent.type(screen.getByLabelText('Issue title'), 'Broken light');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'lighting');
    await userEvent.type(screen.getByLabelText('Location'), 'Jalan Sudirman 12');
    await userEvent.type(screen.getByLabelText('Description'), 'Out for a week');
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(validReport));
  });

  it('shows an error summary with focus when the server rejects input', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({ errors: [{ field: 'title', message: 'Enter a short title for the issue' }] }),
      }),
    );
    render(<ReportForm onCreated={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent('There is a problem');
    await waitFor(() => expect(summary).toHaveFocus());

    // inline error linked to the field via aria-describedby + aria-invalid
    const title = screen.getByLabelText('Issue title');
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title.getAttribute('aria-describedby')).toContain('title-error');
  });

  it('error summary link moves focus to the field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({ errors: [{ field: 'title', message: 'Enter a short title for the issue' }] }),
      }),
    );
    render(<ReportForm onCreated={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    await userEvent.click(await screen.findByRole('link', { name: 'Enter a short title for the issue' }));
    expect(screen.getByLabelText('Issue title')).toHaveFocus();
  });

  it('shows a network error message when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<ReportForm onCreated={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the server');
  });
});
