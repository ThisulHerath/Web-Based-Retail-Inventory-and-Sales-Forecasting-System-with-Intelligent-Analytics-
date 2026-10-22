import React from 'react';
import { RefreshCw, ArrowRight, Layers } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, info) {
        console.error('Uncaught application error:', error, info);
        this.setState({ error });
    }
    render() {
        if (!this.state.hasError) return this.props.children;
        return <main className="error-screen">
            <div className="error-card"><span className="error-symbol" aria-hidden="true"><Layers size={32} /></span><span className="eyebrow">LET’S GET YOU BACK ON TRACK</span><h1>A small pause.<br />We’ll get moving again.</h1><p>This page could not finish loading. Reload to try again, or head back to the storefront.</p>
                <div className="hero-actions"><button type="button" className="button-glow" onClick={() => window.location.reload()}><RefreshCw size={16} />Reload page</button><a className="button-glass" href="/">Go to storefront<ArrowRight size={16} /></a></div>
                {import.meta.env.DEV && this.state.error && <details><summary>Development details</summary><pre>{String(this.state.error)}</pre></details>}
            </div>
        </main>;
    }
}
export default ErrorBoundary;
