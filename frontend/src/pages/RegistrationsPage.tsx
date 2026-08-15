import { useCallback } from 'react';
import { fetchRegistrations } from '../api/student';
import AsyncPanel from '../components/AsyncPanel';
import PageHeader from '../components/PageHeader';
import type { Registration } from '../types';

export default function RegistrationsPage() {
  const load = useCallback(() => fetchRegistrations(), []);

  return (
    <div className="page">
      <PageHeader
        title="Registrations"
        description="Course registration history and confirmation status."
      />

      <AsyncPanel<Registration[]>
        title="Registration records"
        load={load}
        render={(rows) => (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Academic year</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Registration date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.academicYear}</td>
                    <td>{row.semester}</td>
                    <td>
                      <span className={row.confirmed ? 'badge success' : 'badge warning'}>
                        {row.confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                    <td>{row.registrationDate}</td>
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
