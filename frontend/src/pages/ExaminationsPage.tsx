import { useCallback } from 'react';
import { fetchExaminations } from '../api/student';
import AsyncPanel from '../components/AsyncPanel';
import PageHeader from '../components/PageHeader';
import type { Examination } from '../types';

export default function ExaminationsPage() {
  const load = useCallback(() => fetchExaminations(), []);

  return (
    <div className="page">
      <PageHeader
        title="Examinations"
        description="Exam eligibility and sitting status by academic year."
      />

      <AsyncPanel<Examination[]>
        title="Examination records"
        load={load}
        render={(rows) => (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Academic year</th>
                  <th>Eligible</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.academicYear}</td>
                    <td>
                      <span className={row.eligible ? 'badge success' : 'badge danger'}>
                        {row.eligible ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </div>
  );
}
