import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Check, Clock, ArrowRight, Users, X, HelpCircle, type LucideIcon } from 'lucide-react';

interface Feature {
  feature_name: string;
  vote_count: number;
  status: 'Delivered' | 'Under Review' | 'Committed';
  status_updated_at: string;
  client_voters: string[];
}

interface TopFeaturesChartProps {
  features: Feature[];
}

const STATUS_COLORS: Record<Feature['status'], string> = {
  'Delivered': '#22c55e',
  'Under Review': '#8b5cf6',
  'Committed': '#3b82f6'
};

const STATUS_ICONS: Record<Feature['status'], LucideIcon> = {
  'Delivered': Check,
  'Under Review': Clock,
  'Committed': ArrowRight
};

export const TopFeaturesChart: React.FC<TopFeaturesChartProps> = ({ features }) => {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Sort features by vote count and take top 10
  const topFeatures = features
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 10)
    .map(feature => ({
      ...feature,
      vote_count: feature.vote_count || 0,
      client_voters: feature.client_voters || []
    }));

  const renderCustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-10}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#6B7280"
          fontSize={12}
          width={100}
          className="font-medium"
          style={{ wordWrap: 'break-word' }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      const feature = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900">{feature.feature_name}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {feature.vote_count} votes
          </p>
          <div className="flex items-center mt-2">
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: STATUS_COLORS[feature.status] }}
            />
            <span className="text-sm text-gray-600">{feature.status}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(feature.status_updated_at).toLocaleDateString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          Top 10 Requested Features
          <span className="text-sm text-gray-500 font-normal">
            ({topFeatures.length} of 10)
          </span>
        </h3>
        <div className="relative group">
          <HelpCircle className="h-4 w-4 text-[#6E6E6E] cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            Most frequently requested product features based on aggregated client votes
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topFeatures}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
            barSize={21}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              dataKey="feature_name"
              type="category"
              tick={renderCustomAxisTick}
              width={110}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="vote_count"
              fill="#FFB366"
              data={topFeatures}
              background={{ fill: '#f3f4f6' }}
              minPointSize={21}
              barSize={21}
              className="cursor-pointer"
              radius={3}
              maxBarSize={21}
              onClick={(data) => setExpandedFeature(data.feature_name)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {expandedFeature && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {expandedFeature}
                </h3>
                {(() => {
                  const feature = topFeatures.find(f => f.feature_name === expandedFeature);
                  const StatusIcon = feature && feature.status in STATUS_ICONS ? STATUS_ICONS[feature.status] : Clock;
                  return (
                    <div className="flex items-center mt-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${STATUS_COLORS[feature?.status || 'Under Review']}20` }}>
                        <StatusIcon className="h-6 w-6" style={{ color: STATUS_COLORS[feature?.status || 'Under Review'] }} />
                      </div>
                      <div className="ml-4">
                      <span className="text-sm text-gray-600">{feature?.status}</span>
                      <span className="text-sm text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-600">{feature?.vote_count} votes</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <button
                onClick={() => setExpandedFeature(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="mt-8 space-y-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Contributing Clients
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {topFeatures.find(f => f.feature_name === expandedFeature)?.client_voters.map((client, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 mb-2">
                    <Users className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm text-gray-600">{client}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};