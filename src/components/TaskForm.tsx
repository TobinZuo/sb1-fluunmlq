import React, { useState } from 'react';
import { Settings, Play, FileJson } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import yaml from 'js-yaml';

interface TaskFormProps {
  onSubmit: (data: any) => string;
}

type FormMode = 'simple' | 'advanced';

export function TaskForm({ onSubmit }: TaskFormProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<FormMode>('simple');
  const [formData, setFormData] = useState({
    name: '',
    algorithm: 'PPO',
    environment: 'CartPole-v1',
    learningRate: 0.0003,
    batchSize: 64,
    episodes: 1000,
  });
  const [advancedConfig, setAdvancedConfig] = useState('');
  const [configFormat, setConfigFormat] = useState<'json' | 'yaml'>('json');
  const [parseError, setParseError] = useState<string | null>(null);

  const defaultConfig = {
    algorithm: 'PPO',
    environment: 'CartPole-v1',
    parameters: {
      learningRate: 0.0003,
      batchSize: 64,
      episodes: 1000,
      // Add more complex parameters here as examples
      network: {
        type: 'mlp',
        hidden_sizes: [64, 64],
        activation: 'tanh'
      },
      optimizer: {
        type: 'adam',
        epsilon: 1e-5,
        learning_rate_schedule: 'linear'
      },
      ppo_specific: {
        clip_range: 0.2,
        vf_coef: 0.5,
        ent_coef: 0.01
      }
    }
  };

  const handleModeToggle = () => {
    if (mode === 'simple') {
      // Convert current simple form data to advanced format
      const advancedData = {
        algorithm: formData.algorithm,
        environment: formData.environment,
        parameters: {
          learningRate: formData.learningRate,
          batchSize: formData.batchSize,
          episodes: formData.episodes
        }
      };
      setAdvancedConfig(
        configFormat === 'json' 
          ? JSON.stringify(advancedData, null, 2)
          : yaml.dump(advancedData)
      );
    }
    setMode(mode === 'simple' ? 'advanced' : 'simple');
    setParseError(null);
  };

  const handleFormatToggle = () => {
    try {
      if (advancedConfig) {
        const data = configFormat === 'json' 
          ? JSON.parse(advancedConfig)
          : yaml.load(advancedConfig);
        
        setConfigFormat(configFormat === 'json' ? 'yaml' : 'json');
        setAdvancedConfig(
          configFormat === 'json'
            ? yaml.dump(data)
            : JSON.stringify(data, null, 2)
        );
      } else {
        setConfigFormat(configFormat === 'json' ? 'yaml' : 'json');
        setAdvancedConfig(
          configFormat === 'json'
            ? yaml.dump(defaultConfig)
            : JSON.stringify(defaultConfig, null, 2)
        );
      }
      setParseError(null);
    } catch (error) {
      setParseError('Invalid format. Please check your syntax.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let submitData;
    
    if (mode === 'simple') {
      submitData = {
        name: formData.name,
        algorithm: formData.algorithm,
        environment: formData.environment,
        parameters: {
          learningRate: formData.learningRate,
          batchSize: formData.batchSize,
          episodes: formData.episodes
        }
      };
    } else {
      try {
        const parsedConfig = configFormat === 'json'
          ? JSON.parse(advancedConfig)
          : yaml.load(advancedConfig);
        
        submitData = {
          name: formData.name,
          ...parsedConfig
        };
        
        setParseError(null);
      } catch (error) {
        setParseError('Invalid format. Please check your syntax.');
        return;
      }
    }

    const taskId = onSubmit(submitData);
    navigate(`/tasks/${taskId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Submit RL Task</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleModeToggle}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {mode === 'simple' ? 'Advanced Mode' : 'Simple Mode'}
          </button>
          {mode === 'advanced' && (
            <button
              type="button"
              onClick={handleFormatToggle}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Switch to {configFormat === 'json' ? 'YAML' : 'JSON'}
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {mode === 'simple' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Algorithm
            </label>
            <select
              value={formData.algorithm}
              onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PPO">PPO</option>
              <option value="DQN">DQN</option>
              <option value="SAC">SAC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CartPole-v1">CartPole-v1</option>
              <option value="LunarLander-v2">LunarLander-v2</option>
              <option value="Pendulum-v1">Pendulum-v1</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Rate
            </label>
            <input
              type="number"
              value={formData.learningRate}
              onChange={(e) => setFormData({ ...formData, learningRate: parseFloat(e.target.value) })}
              step="0.0001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Size
            </label>
            <input
              type="number"
              value={formData.batchSize}
              onChange={(e) => setFormData({ ...formData, batchSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Episodes
            </label>
            <input
              type="number"
              value={formData.episodes}
              onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Configuration ({configFormat.toUpperCase()})
            </label>
            <button
              type="button"
              onClick={() => {
                setAdvancedConfig(
                  configFormat === 'json'
                    ? JSON.stringify(defaultConfig, null, 2)
                    : yaml.dump(defaultConfig)
                );
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Load Example
            </button>
          </div>
          <textarea
            value={advancedConfig}
            onChange={(e) => {
              setAdvancedConfig(e.target.value);
              setParseError(null);
            }}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter your ${configFormat.toUpperCase()} configuration here...`}
          />
          {parseError && (
            <p className="text-sm text-red-600">{parseError}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Play className="w-5 h-5 mr-2" />
        Submit Task
      </button>
    </form>
  );
}