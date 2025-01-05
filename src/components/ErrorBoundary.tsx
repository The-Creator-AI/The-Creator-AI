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
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to an error tracking service (optional)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // You can integrate with an error tracking service here, e.g., Sentry, Rollbar

        this.setState({ hasError: true, error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div>
                    <h2>Something went wrong.</h2>
                    <p>{this.state.error?.message}</p>
                    {/* You can display more detailed error information here if needed */}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
