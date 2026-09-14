import React from 'react';
import AlertMessage from '../common/AlertMessage';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: string | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error: error.message || 'Something went wrong.' };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container py-5">
          <AlertMessage
            type="danger"
            message={this.state.error}
            onDismiss={() => this.setState({ error: null })}
          />
          <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>
            Reload application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
