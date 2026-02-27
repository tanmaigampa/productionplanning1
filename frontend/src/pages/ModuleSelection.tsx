import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ModuleSelection: React.FC = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'agriculture',
      name: 'Agriculture',
      icon: '🌾',
      description: 'Weather-driven crop planning with multiple sales channels',
      available: true,
      path: '/agriculture'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: '🏭',
      description: 'Demand-driven production and inventory planning',
      available: false,
      path: '/manufacturing'
    },
    {
      id: 'pharma',
      name: 'Pharma / Chemical',
      icon: '🧪',
      description: 'Batch production with quality risk management',
      available: false,
      path: '/pharma'
    },
    {
      id: 'food',
      name: 'Food & Beverage',
      icon: '🥫',
      description: 'Perishable production planning with spoilage modeling',
      available: false,
      path: '/food'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Module</h1>
            <p className="text-gray-600 text-sm">Choose a sector to optimize</p>
          </div>
        </div>
      </header>

      {/* Module Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`bg-white rounded-xl shadow-md p-8 ${
                module.available
                  ? 'hover:shadow-xl cursor-pointer transform hover:scale-102 transition-all'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => module.available && navigate(module.path)}
            >
              <div className="flex items-start">
                <div className="text-6xl mr-6">{module.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{module.name}</h3>
                    {!module.available && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  {module.available && (
                    <button className="btn-primary">
                      Start Optimization →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ModuleSelection;
