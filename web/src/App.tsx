import { useEffect, useState } from 'react';
import { ReportForm } from './components/ReportForm';
import { ReportList } from './components/ReportList';
import type { Report } from './types';

export function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [created, setCreated] = useState<Report | null>(null);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setReports([]));
  }, []);

  function handleCreated(report: Report) {
    setCreated(report);
    setReports((prev) => [report, ...prev]);
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="site">
        <strong>CivicReport</strong> — report a public issue
      </header>
      <main id="main">
        <h1>Report a problem in your area</h1>

        {created && (
          <div className="success-banner" role="status">
            Report #{created.id} submitted. Your reference is #{created.id}.
          </div>
        )}

        <ReportForm onCreated={handleCreated} />

        <h2>Recent reports</h2>
        <ReportList reports={reports} />
      </main>
    </>
  );
}
