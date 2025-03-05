import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskDetails } from './components/TaskDetails';

// Mock data - In a real app, this would come from your backend
const mockTasks = [
  {
    id: '1',
    name: 'CartPole Training',
    status: 'completed',
    algorithm: 'PPO',
    environment: 'CartPole-v1',
    parameters: {
      learningRate: 0.0003,
      batchSize: 64,
      episodes: 1000,
    },
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
    submitter: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    }
  },
  {
    id: '2',
    name: 'LunarLander Training',
    status: 'running',
    algorithm: 'DQN',
    environment: 'LunarLander-v2',
    parameters: {
      learningRate: 0.0001,
      batchSize: 128,
      episodes: 2000,
    },
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    submitter: {
      name: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face'
    }
  },
];

function App() {
  const handleSubmit = (formData: any) => {
    const newTask = {
      id: String(mockTasks.length + 1),
      name: formData.name,
      status: 'pending',
      algorithm: formData.algorithm,
      environment: formData.environment,
      parameters: {
        learningRate: formData.learningRate,
        batchSize: formData.batchSize,
        episodes: formData.episodes,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submitter: {
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face'
      }
    };

    // In a real app, this would be an API call
    mockTasks.unshift(newTask);
    
    // Return the new task ID for redirection
    return newTask.id;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="submit" element={<TaskForm onSubmit={handleSubmit} />} />
          <Route path="tasks" element={<TaskList tasks={mockTasks} />} />
          <Route path="tasks/:taskId" element={<TaskDetails tasks={mockTasks} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;