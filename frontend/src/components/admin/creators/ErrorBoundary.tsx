import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '600px',
          background: 'var(--bg-card)',
          border: '2px solid var(--status-danger)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            marginBottom: '1rem' 
          }}>
            Something went wrong
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              background: 'var(--bg-content)', 
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--text-primary)'
              }}>
                Error Details
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                margin: 0,
                fontSize: '0.8rem'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--vybez-primary)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
              aria-label="Try again"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/admin/retrieveposts'}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--bg-sidebar)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
              aria-label="Go to posts list"
            >
              Go to Posts
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;