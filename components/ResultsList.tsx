import React from 'react';
import { AppResult } from '../types';

const StarIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);
const StarHalfIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /><path d="M10 12.535V3.422l-1.07 3.292a1 1 0 00-.95.69H4.518l2.8 2.034a1 1 0 00.364 1.118l-1.07 3.292L10 15.465z" /></svg>);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} className="text-accent-gold" />)}
            {halfStar && <StarHalfIcon key="half" className="text-accent-gold" />}
            {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} className="text-gray-600" />)}
        </div>
    );
};

interface ResultsListProps {
  results: AppResult[];
  onResultSelect: (result: AppResult) => void;
  onClose: () => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, onResultSelect, onClose }) => {
  return (
    <div className="absolute z-20 w-full card overflow-hidden flex flex-col 
                   bottom-0 right-0 left-0 rounded-t-2xl max-w-full max-h-[60vh] animate-slide-in-up
                   md:left-auto md:bottom-4 md:right-4 md:rounded-2xl md:max-w-sm md:max-h-[calc(100vh-6rem)] md:animate-fade-in-up">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">為您推薦這 {results.length} 間餐廳</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
      <ul className="divide-y divide-white/10 overflow-y-auto">
        {results.map((result) => (
          <li key={result.name + result.details} className="p-4 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => onResultSelect(result)}>
            <div className="flex items-start space-x-4">
              <div 
                className="w-24 h-24 bg-cover bg-center rounded-md flex-shrink-0 border border-white/10" 
                style={{ backgroundImage: `url(${result.photoUrl || 'https://placehold.co/150x150/2c2c2e/f5f5f7?text=Image'})` }}
              ></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{result.name}</h3>
                {result.rating != null && (
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                    <span className="font-semibold text-accent-gold">{result.rating.toFixed(1)}</span>
                    <StarRating rating={result.rating} />
                    <span className="flex-shrink-0">({result.user_ratings_total})</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{result.details}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultsList;