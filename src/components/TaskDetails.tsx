import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Activity, Terminal, Cpu, Settings, Clock, User, Calendar, Timer, FileJson } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { RLTask } from '../types';
import yaml from 'js-yaml';

interface TaskDetailsProps {
  tasks: RLTask[];
}

// Mock data for charts
const generateTimeSeriesData = (length: number, baseValue: number, variance: number) => {
  return Array.from({ length }, (_, i) => ({
    time: i * 5,
    value: baseValue + Math.random() * variance - variance / 2,
  }));
};

const mockCpuData = generateTimeSeriesData(50, 45, 20);
const mockMemoryData = generateTimeSeriesData(50, 2.4, 1);
const mockGpuData = generateTimeSeriesData(50, 78, 15);
const mockRewardData = generateTimeSeriesData(50, 100, 50);

// Mock logs data
const logs = [
  { timestamp: '2024-03-15T10:00:00Z', level: 'info', message: 'Training started' },
  { timestamp: '2024-03-15T10:01:00Z', level: 'info', message: 'Episode 1 completed: reward=100' },
  { timestamp: '2024-03-15T10:02:00Z', level: 'warning', message: 'Learning rate adjusted to 0.0002' },
  { timestamp: '2024-03-15T10:03:00Z', level: 'info', message: 'Episode 2 completed: reward=150' },
  { timestamp: '2024-03-15T10:04:00Z', level: 'error', message: 'Memory usage exceeded 90%' },
];

export function TaskDetails({ tasks }: TaskDetailsProps) {
  const { taskId } = useParams();
  const [activeTab, setActiveTab] = useState('parameters');
  const [configFormat, setConfigFormat] = useState<'json' | 'yaml'>('json');

  // Find the task by ID
  const task = tasks.find(t => t.id === taskId);

  // If task is not found, redirect to the task list
  if (!task) {
    return <Navigate to="/tasks" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const TabButton = ({ icon: Icon, label, tabName }: { icon: any, label: string, tabName: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
        activeTab === tabName
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  // Calculate duration
  const startDate = new Date(task.createdAt);
  const endDate = task.status === 'completed' ? new Date(task.updatedAt) : new Date();
  const duration = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60); // in minutes

  const formatConfig = (config: any) => {
    return configFormat === 'json'
      ? JSON.stringify(config, null, 2)
      : yaml.dump(config);
  };

  const renderParameters = () => {
    if (typeof task.parameters === 'object' && task.parameters !== null) {
      const config = {
        algorithm: task.algorithm,
        environment: task.environment,
        parameters: task.parameters
      };

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
            <button
              onClick={() => setConfigFormat(configFormat === 'json' ? 'yaml' : 'json')}
              className="flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FileJson className="w-4 h-4 mr-1" />
              Switch to {configFormat === 'json' ? 'YAML' : 'JSON'}
            </button>
          </div>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono">
            {formatConfig(config)}
          </pre>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500">Algorithm</h4>
          <p className="mt-1 text-sm text-gray-900">{task.algorithm}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500">Environment</h4>
          <p className="mt-1 text-sm text-gray-900">{task.environment}</p>
        </div>
        {Object.entries(task.parameters).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h4>
            <p className="mt-1 text-sm text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Task Metadata Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.name}</h2>
            <div className="mt-2 flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {task.algorithm}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {task.environment}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Submitted by</p>
              <p className="text-sm text-gray-900">{task.submitter.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-sm text-gray-900">{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-sm text-gray-900">{duration} minutes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-900">{new Date(task.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-2">
          <TabButton icon={Settings} label="Parameters" tabName="parameters" />
          <TabButton icon={Activity} label="Metrics" tabName="metrics" />
          <TabButton icon={Terminal} label="Logs" tabName="logs" />
          <TabButton icon={Cpu} label="Resources" tabName="resources" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'parameters' && renderParameters()}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Training Progress</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockRewardData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'bottom' }} />
                    <YAxis label={{ value: 'Reward', angle: -90, position: 'left' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  log.level === 'error'
                    ? 'bg-red-50'
                    : log.level === 'warning'
                    ? 'bg-yellow-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span
                    className={`ml-2 text-xs font-medium ${
                      log.level === 'error'
                        ? 'text-red-800'
                        : log.level === 'warning'
                        ? 'text-yellow-800'
                        : 'text-gray-800'
                    }`}
                  >
                    {log.level.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-900">{log.message}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Utilization</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">CPU Usage</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockCpuData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Memory Usage (GB)</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockMemoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#6ee7b7" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">GPU Usage</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockGpuData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}