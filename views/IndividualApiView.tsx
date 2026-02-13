import React from 'react';
import { useParams } from 'react-router-dom';
import { AggregatedMetrics } from '../types';

interface IndividualApiViewProps {
    metrics: AggregatedMetrics[];
}

const IndividualApiView: React.FC<IndividualApiViewProps> = ({ metrics }) => {
    const { staffId } = useParams<{ staffId: string }>();

    const staffMetrics = metrics.find(m => m.staffId === staffId);

    if (!staffMetrics) {
        return (
            <pre className="p-4 bg-slate-900 text-red-400 font-mono">
                {JSON.stringify({ error: "Staff not found", staffId }, null, 2)}
            </pre>
        );
    }

    // Set background to pure dark specifically for this view to look like an API
    return (
        <pre className="p-4 bg-slate-900 text-emerald-400 font-mono overflow-auto h-screen whitespace-pre-wrap">
            {JSON.stringify(staffMetrics, null, 2)}
        </pre>
    );
};

export default IndividualApiView;
