import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = this.state.error?.toString() || 'An unexpected error occurred';
      const shouldShowDetails = isDev || this.state.errorCount > 2;

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              We encountered an unexpected error. Your work is safe, but please try refreshing or going back.
            </p>

            {shouldShowDetails && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <pre className="error-stack">
                  <code>
                    {errorMessage}
                    {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                  </code>
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button 
                className="error-btn error-retry"
                onClick={this.handleRetry}
                aria-label="Retry the operation"
              >
                ↻ Try Again
              </button>
              <button 
                className="error-btn error-reload"
                onClick={this.handleReload}
                aria-label="Reload the page"
              >
                ⟳ Reload Page
              </button>
              <a 
                href="/"
                className="error-btn error-home"
                aria-label="Go back to home"
              >
                ← Go Home
              </a>
            </div>

            <div className="error-support">
              <p>If the problem persists, try:</p>
              <ul>
                <li>Clearing your browser cache</li>
                <li>Using a different browser</li>
                <li>Checking your internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
