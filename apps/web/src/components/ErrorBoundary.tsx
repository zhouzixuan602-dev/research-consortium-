'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '24px',
            background: '#1a0000',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#fff',
          }}
        >
          <h3 style={{ color: '#ef4444', margin: '0 0 8px 0' }}>Something went wrong</h3>
          <p style={{ color: '#888', margin: 0 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#333',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
