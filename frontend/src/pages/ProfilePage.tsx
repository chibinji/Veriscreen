import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="page">
      <PageHeader
        title="Profile"
        description="Your authenticated student profile from the university database."
      />

      <section className="panel">
        <dl className="detail-grid">
          <div>
            <dt>Student ID</dt>
            <dd>{profile.id}</dd>
          </div>
          <div>
            <dt>Full name</dt>
            <dd>{profile.name}</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>{profile.program}</dd>
          </div>
          <div>
            <dt>Enrollment year</dt>
            <dd>{profile.enrollmentYear}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
