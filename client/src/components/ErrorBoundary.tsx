import React, { type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 text-center mb-4">
                We encountered an unexpected error. Please try again or return to the home page.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-3 bg-gray-100 rounded text-sm font-mono text-gray-700 overflow-auto">
                  <p className="font-bold mb-2">Error Details:</p>
                  <p>{this.state.error.message}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  onClick={this.handleReset}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex-1"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
