import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
              <div className='mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4'>
                <AlertTriangle className='w-6 h-6 text-red-600 dark:text-red-400' />
              </div>
              <CardTitle className='text-xl text-red-900 dark:text-red-100'>
                오류가 발생했습니다
              </CardTitle>
              <CardDescription>
                예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className='p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-32'>
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <pre className='mt-2 whitespace-pre-wrap text-xs'>
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
              <div className='flex gap-2'>
                <Button
                  onClick={this.handleReset}
                  variant='outline'
                  className='flex-1'
                >
                  다시 시도
                </Button>
                <Button onClick={this.handleReload} className='flex-1'>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  페이지 새로고침
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
