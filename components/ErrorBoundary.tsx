import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryComponent extends Component<Props & WithTranslation, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4">
                    <div className="bg-gray-900 border-2 border-red-500 p-8 rounded-lg max-w-2xl text-center">
                        <h1 className="text-4xl font-bold text-red-500 mb-4 tracking-wider">
                            ⚠️ SYSTEM ERROR ⚠️
                        </h1>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {this.props.t('errorBoundary.subtitle')}
                        </h2>
                        <p className="text-gray-400 mb-2">
                            {this.props.t('errorBoundary.errorDetails')}
                        </p>
                        {this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 mb-2">
                                    Technical Details
                                </summary>
                                <pre className="bg-black p-4 rounded text-red-400 text-sm overflow-auto max-h-64">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-8 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all"
                            >
                                {this.props.t('errorBoundary.restartGame')}
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-8 py-3 border border-gray-500 text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
                            >
                                {this.props.t('errorBoundary.returnToMenu')}
                            </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-6">
                            {this.props.t('errorBoundary.helpText')}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);
