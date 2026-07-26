import type { Report } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types';

export function ReportList({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return <p>No reports yet. Be the first to report an issue.</p>;
  }
  return (
    <table>
      <caption>Submitted reports</caption>
      <thead>
        <tr>
          <th scope="col">Ref</th>
          <th scope="col">Title</th>
          <th scope="col">Category</th>
          <th scope="col">Location</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td>#{r.id}</td>
            <td>{r.title}</td>
            <td>{CATEGORY_LABELS[r.category]}</td>
            <td>{r.location}</td>
            <td>
              <span className={`tag tag--${r.status}`}>{STATUS_LABELS[r.status]}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
