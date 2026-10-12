import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api';
import { studentService } from '../../services/studentService';
import { useSessionQueryKey } from '../../hooks/useSessionQueryKey';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import EmptyState from '../../components/common/EmptyState';
import { getErrorMessage } from '../../utils';
import { groupResults } from './recordsFormat';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4, A: 4, 'A-': 3.7,
  'B+': 3.3, B: 3, 'B-': 2.7,
  'C+': 2.3, C: 2, 'C-': 1.7,
  'D+': 1.3, D: 1, F: 0,
};

function gradePoint(grade: string | undefined): number {
  return GRADE_POINTS[(grade || '').trim().toUpperCase()] ?? 0;
}

function average(rows: Array<{ grade?: string; credits?: number }>): number | null {
  const scored = rows.filter((row) => row.grade);
  if (!scored.length) return null;
  const credits = scored.reduce((sum, row) => sum + Number(row.credits || 0), 0);
  if (credits > 0) {
    const total = scored.reduce((sum, row) => sum + gradePoint(row.grade) * Number(row.credits || 0), 0);
    return total / credits;
  }
  const total = scored.reduce((sum, row) => sum + gradePoint(row.grade), 0);
  return total / scored.length;
}

function formatAverage(value: number | null): string {
  return value == null ? '—' : value.toFixed(2);
}

const AcademicResultsRecordPage: React.FC = () => {
  const profileQuery = useQuery({ queryKey: useSessionQueryKey('student-profile'), queryFn: studentService.getProfile });
  const resultsQuery = useQuery({ queryKey: useSessionQueryKey('academic-results'), queryFn: () => usersApi.getAcademicResults() });

  const results = resultsQuery.data || [];
  const groups = groupResults(results, profileQuery.data);
  const years = [...new Set(results.map((row) => row.academicYear).filter(Boolean))].sort();
  const latestYear = years[years.length - 1];
  const gpa = average(latestYear ? results.filter((row) => row.academicYear === latestYear) : results);
  const cgpa = average(results);

  return (
    <div className="sis-page">
      <Link to="/student/records" className="sis-back">
        <i className="bi bi-arrow-left me-1" />
        Academic Records
      </Link>

      {(profileQuery.isError || resultsQuery.isError) && (
        <AlertMessage type="danger" message={getErrorMessage(profileQuery.error || resultsQuery.error)} />
      )}

      {resultsQuery.isLoading ? (
        <LoadingSpinner text="Loading academic results…" />
      ) : (
        <>
          <div className="studio-kpis">
            <article className="studio-tile studio-tile--gold">
              <p>GPA</p>
              <strong>{formatAverage(gpa)}</strong>
              <span>{latestYear ? `Latest year · ${latestYear}` : 'All published results'}</span>
            </article>
            <article className="studio-tile studio-tile--ink">
              <p>CGPA</p>
              <strong>{formatAverage(cgpa)}</strong>
              <span>Cumulative across published results</span>
            </article>
          </div>
          <div className="sis-sheet">
          <div className="table-responsive">
            {!groups.length ? (
              <EmptyState title="No results yet" icon="bi-journal-x" />
            ) : (
              <table className="sis-results">
                <thead>
                  <tr>
                    <th>Academic Year</th>
                    <th>Programme</th>
                    <th>Year of Study</th>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) =>
                    group.courses.map((course, index) => (
                      <tr key={course.id} className={index === 0 ? 'sis-year-start' : undefined}>
                        <td>{index === 0 ? group.session : ''}</td>
                        <td>{index === 0 ? group.programme : ''}</td>
                        <td>{index === 0 ? group.yearOfStudy : ''}</td>
                        <td>
                          {course.courseCode}
                          {course.courseName ? ` - ${course.courseName}` : ''}
                        </td>
                        <td className="sis-grade">{course.grade || '***'}</td>
                        <td className="sis-comment">{index === 0 ? group.comment : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default AcademicResultsRecordPage;
