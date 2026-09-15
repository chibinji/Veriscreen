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

const AcademicResultsRecordPage: React.FC = () => {
  const profileQuery = useQuery({ queryKey: useSessionQueryKey('student-profile'), queryFn: studentService.getProfile });
  const resultsQuery = useQuery({ queryKey: useSessionQueryKey('academic-results'), queryFn: () => usersApi.getAcademicResults() });

  const groups = groupResults(resultsQuery.data || [], profileQuery.data);

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
      )}
    </div>
  );
};

export default AcademicResultsRecordPage;
