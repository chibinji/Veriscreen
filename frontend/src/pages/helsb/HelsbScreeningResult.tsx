import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { helsbService } from '../../services/helsbService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AlertMessage from '../../components/common/AlertMessage';
import { formatDateTime } from '../../utils';

const HelsbScreeningResult: React.FC = () => {
  const { data: application, isLoading: appLoading, isError: appError } = useQuery({
    queryKey: ['my-application'],
    queryFn: helsbService.getMyApplication,
    retry: false,
  });

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['screening-result', application?.id],
    queryFn: () => helsbService.getScreeningResult(application!.id),
    enabled: !!application,
    retry: false,
  });

  return (
    <div>
      <PageHeader
        title="Screening Result"
        subtitle="View the outcome of your HELSB application screening."
        breadcrumbs={[{ label: 'HELSB', path: '/helsb/dashboard' }, { label: 'Screening Result' }]}
      />

      {appError && <AlertMessage type="danger" message="Unable to load your application." />}
      {(appLoading || isLoading) && <LoadingSpinner text="Loading screening result…" />}

      {!appLoading && !application && !appError && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon="bi-clipboard2-x"
              title="No application found"
              description="No HELSB application is linked to this account yet."
            />
          </div>
        </div>
      )}

      {application && isError && (
        <AlertMessage type="danger" message="Unable to load the screening result." />
      )}

      {application && !isLoading && !isError && !result && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon="bi-hourglass-split"
              title="Screening not completed"
              description="Your application is still being reviewed. Check back later."
            />
          </div>
        </div>
      )}

      {result && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className={`card-header text-white text-center py-4 border-0 ${result.passed ? 'bg-success' : 'bg-danger'}`}>
                <i className={`bi ${result.passed ? 'bi-trophy-fill' : 'bi-x-circle-fill'} fs-1 d-block mb-2`} />
                <h4 className="fw-bold mb-0">{result.passed ? 'Application Approved' : 'Application Not Approved'}</h4>
                <p className="mb-0 opacity-75 small mt-1">
                  {result.passed ? 'Congratulations! You qualify for HELSB support.' : 'Unfortunately, your application did not meet the criteria.'}
                </p>
              </div>
              <div className="card-body p-4">
                {result.score !== undefined && (
                  <div className="text-center mb-4">
                    <p className="text-muted small mb-1">Screening Score</p>
                    <div className="display-4 fw-bold text-primary">{result.score}<span className="fs-4 text-muted">/100</span></div>
                    <div className="progress mt-2" style={{ height: 8 }}>
                      <div
                        className={`progress-bar ${result.passed ? 'bg-success' : 'bg-danger'}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="row g-2 mb-3">
                  {[
                    { label: 'Result', value: result.passed ? 'PASSED' : 'FAILED' },
                    { label: 'Screened By', value: result.screenedBy },
                    { label: 'Screened On', value: formatDateTime(result.screenedAt) },
                  ].map((item) => (
                    <div key={item.label} className="col-sm-6">
                      <div className="bg-light rounded-2 p-2">
                        <p className="text-muted small mb-1">{item.label}</p>
                        <p className="fw-semibold mb-0 small">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-secondary small">
                  <i className="bi bi-chat-quote me-2" />
                  <strong>Remarks:</strong> {result.remarks}
                </div>

                {result.passed && (
                  <a href="/helsb/contract" className="btn btn-success w-100">
                    <i className="bi bi-file-earmark-ruled me-2" />Download Contract
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelsbScreeningResult;
