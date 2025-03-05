import React from 'react';
import { Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RLTask } from '../types';

interface TaskListProps {
  tasks: RLTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Task History</h3>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your reinforcement learning tasks
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={task.submitter.avatar}
                  alt={task.submitter.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{task.name}</h4>
                  <p className="text-sm text-gray-500">by {task.submitter.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}