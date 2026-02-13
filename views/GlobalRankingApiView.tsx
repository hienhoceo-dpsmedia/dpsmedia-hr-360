import React from 'react';
import { useParams } from 'react-router-dom';
import { AggregatedMetrics } from '../types';

interface GlobalRankingApiViewProps {
    metrics: AggregatedMetrics[];
}

const GlobalRankingApiView: React.FC<GlobalRankingApiViewProps> = ({ metrics }) => {
    const { metric } = useParams<{ metric: string }>();

    // Map friendly slugs if needed, but primary support is internal keys
    const metricKey = metric as keyof AggregatedMetrics;

    if (!metrics || metrics.length === 0) {
        return (
            <pre className="p-4 bg-slate-900 text-red-400 font-mono">
                {JSON.stringify({ error: "No metrics available" }, null, 2)}
            </pre>
        );
    }

    // Check if metric exists
    if (!(metricKey in metrics[0])) {
        return (
            <pre className="p-4 bg-slate-900 text-red-400 font-mono">
                {JSON.stringify({ error: "Invalid metric key", metric }, null, 2)}
            </pre>
        );
    }

    // Sort and filter only necessary data for the ranking
    const ranking = [...metrics]
        .sort((a, b) => (b[metricKey] as number) - (a[metricKey] as number))
        .map((m, index) => ({
            rank: index + 1,
            staffId: m.staffId,
            staffName: m.staffName,
            department: m.department,
            value: m[metricKey],
            unit: metricKey.includes('minutes') ? 'mins' : metricKey.includes('points') ? 'pts' : ''
        }));

    return (
        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono overflow-auto h-screen whitespace-pre-wrap">
            {JSON.stringify({
                metric: metricKey,
                count: ranking.length,
                data: ranking
            }, null, 2)}
        </pre>
    );
};

export default GlobalRankingApiView;
