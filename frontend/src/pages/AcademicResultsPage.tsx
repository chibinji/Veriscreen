import { useCallback } from 'react';
import { fetchAcademicResults } from '../api/student';
import AsyncPanel from '../components/AsyncPanel';
import PageHeader from '../components/PageHeader';
import type { AcademicResult } from '../types';

export default function AcademicResultsPage() {
  const load = useCallback(() => fetchAcademicResults(), []);

  return (
    <div className="page">
      <PageHeader
        title="Academic results"
        description="Course grades and credits from your academic record."
      />

      <AsyncPanel<AcademicResult[]>
        title="Course results"
        load={load}
        render={(rows) => (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course code</th>
                  <th>Grade</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.courseCode}</td>
                    <td><strong>{row.grade}</strong></td>
                    <td>{row.credits}</td>
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
