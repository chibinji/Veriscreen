import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api';
import { studentService } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import { getErrorMessage } from '../../utils';
import { bachelorProgramme, fullName, gerSession, titleYear } from './recordsFormat';

const RegistrationRecordPage: React.FC = () => {
  const profileQuery = useQuery({ queryKey: ['student-profile'], queryFn: studentService.getProfile });
  const regsQuery = useQuery({ queryKey: ['registrations'], queryFn: () => usersApi.getRegistrations() });

  const profile = profileQuery.data;
  const latest = regsQuery.data?.[0];
  const registered = latest?.confirmationStatus === 'CONFIRMED' || profile?.registrationStatus === 'ACTIVE';
  const intakeYear = profile?.enrollmentDate ? profile.enrollmentDate.slice(0, 4) : '—';

  return (
    <div className="sis-page">
      <Link to="/student/records" className="sis-back">
        <i className="bi bi-arrow-left me-1" />
        Academic Records
      </Link>

      {(profileQuery.isError || regsQuery.isError) && (
        <AlertMessage type="danger" message={getErrorMessage(profileQuery.error || regsQuery.error)} />
      )}

      {profileQuery.isLoading ? (
        <LoadingSpinner text="Loading registration…" />
      ) : (
        <div className="sis-sheet">
          <div className="sis-banner">Student Course Registration</div>
          <div className="sis-grid">
            <div>
              <div className="sis-field"><span>Student ID:</span> {profile?.studentNumber || '—'}</div>
              <div className="sis-field"><span>Student Name:</span> {fullName(profile)}</div>
              <div className="sis-field"><span>Student NRC:</span> {profile?.nrc || '—'}</div>
              <div className="sis-field"><span>Category:</span> REGULAR</div>
              <div className="sis-field"><span>Sub-Category:</span> FULL-TIME</div>
            </div>
            <div>
              <div className="sis-field"><span>Program:</span> {bachelorProgramme(profile?.program)}</div>
              <div className="sis-field"><span>Major:</span> {(profile?.program || '—').toUpperCase()}</div>
              <div className="sis-field"><span>Intake Year:</span> {intakeYear}</div>
              <div className="sis-field">
                <span>Intake:</span> GER_{intakeYear}_4YR_TERM_QTA
              </div>
              <div className="sis-field">
                <span>current Period:</span> {gerSession(latest?.academicYear, latest?.semester)} Session
              </div>
              <div className="sis-field"><span>Study Year:</span> {titleYear(profile?.yearOfStudy)}</div>
              <div className="sis-field">
                <span>Registration Status:</span>
                <span className={`sis-status ${registered ? 'sis-status-registered' : 'sis-status-pending'}`}>
                  {registered ? 'REGISTERED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRecordPage;
