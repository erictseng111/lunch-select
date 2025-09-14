import React from 'react';

interface ControlsProps {
  onSuggestCuisines: () => void;
  onFeelingLucky: () => void;
  currentArea: string;
  isLoading: boolean;
  loadingMessage: string;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const Controls: React.FC<ControlsProps> = ({ onSuggestCuisines, onFeelingLucky, currentArea, isLoading, loadingMessage }) => {
  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="card p-3 flex flex-col space-y-3 w-72">
        <div>
          <h1 className="text-xl font-bold text-white">午餐吃什麼？</h1>
          <p className="text-xs text-gray-400">目前位置：{currentArea}</p>
        </div>

        {isLoading && (
          <div className="p-3 bg-blue-500/20 text-blue-200 text-sm rounded-lg flex items-center">
            <LoadingSpinner />
            <span>{loadingMessage || '載入中...'}</span>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onSuggestCuisines}
            disabled={isLoading}
            className="flex-1 btn btn-primary flex items-center justify-center"
          >
            <span role="img" aria-label="lightbulb" className="mr-2">💡</span>
            AI推薦菜色
          </button>
          <button
            onClick={onFeelingLucky}
            disabled={isLoading}
            className="flex-1 btn btn-secondary flex items-center justify-center"
          >
            <span role="img" aria-label="dice" className="mr-2">🎲</span>
            我手氣很好
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
