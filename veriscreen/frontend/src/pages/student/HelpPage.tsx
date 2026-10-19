import React from 'react';
import { Link } from 'react-router-dom';

const TOPICS = [
  {
    title: 'Signing in',
    body: 'Use your computer number and the password issued for this demo. Every seeded student uses password123.',
  },
  {
    title: 'Documents and the QR code',
    body: 'Open Documents, then preview or download a PDF. The QR code includes the time the document was issued. Scanning it opens a green page when the document is genuine.',
  },
  {
    title: 'HELSB tracker',
    body: 'The dashboard tracker moves from Submitted through Disbursement as an officer updates the application. The screening sentence appears when screening runs.',
  },
  {
    title: 'Dark mode',
    body: 'Open Settings and turn Dark mode on or off. The choice stays on this browser.',
  },
];

const HelpPage: React.FC = () => (
  <div className="studio-settings">
    <h1>Help</h1>
    <p className="studio-settings__lead">How to use VeriScreen on this account.</p>
    {TOPICS.map((topic) => (
      <section key={topic.title} className="studio-settings__card">
        <h2>{topic.title}</h2>
        <p>{topic.body}</p>
      </section>
    ))}
    <Link className="studio-apply" to="/student/settings">Open settings</Link>
  </div>
);

export default HelpPage;
