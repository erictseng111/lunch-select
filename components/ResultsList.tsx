
import React, { useRef } from 'react';
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

interface FilterControlsProps {
    ratingFilter: number;
    openNowFilter: boolean;
    onRatingChange: (rating: number) => void;
    onOpenNowChange: (isOpen: boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ ratingFilter, openNowFilter, onRatingChange, onOpenNowChange }) => {
    const ratingOptions = [
        { label: '全部', value: 0 },
        { label: '3★+', value: 3 },
        { label: '4★+', value: 4 },
    ];

    return (
        <div className="p-3 bg-black/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">評分:</span>
                <div className="flex items-center bg-white/10 rounded-lg p-1">
                    {ratingOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onRatingChange(opt.value)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                                ratingFilter === opt.value
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <label htmlFor="open-toggle" className="flex items-center cursor-pointer select-none">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="open-toggle" 
                        className="sr-only peer" 
                        checked={openNowFilter} 
                        onChange={(e) => onOpenNowChange(e.target.checked)} 
                    />
                    <div className="block bg-gray-600 w-10 h-6 rounded-full peer-checked:bg-indigo-500 transition"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform peer-checked:translate-x-full"></div>
                </div>
                <div className="ml-3 text-gray-300 text-sm font-medium">
                    僅顯示營業中
                </div>
            </label>
        </div>
    );
}


interface ResultsListProps {
  results: AppResult[];
  onResultSelect: (result: AppResult) => void;
  onClose: () => void;
  ratingFilter: number;
  openNowFilter: boolean;
  onRatingChange: (rating: number) => void;
  onOpenNowChange: (isOpen: boolean) => void;
  listState: 'hidden' | 'collapsed' | 'expanded';
  setListState: (state: 'hidden' | 'collapsed' | 'expanded') => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, onResultSelect, onClose, ratingFilter, openNowFilter, onRatingChange, onOpenNowChange, listState, setListState }) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragState = useRef({ startY: 0, isDragging: false });
    const isExpanded = listState === 'expanded';

    const handleTouchStart = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        dragState.current.isDragging = true;
        dragState.current.startY = e.touches[0].clientY;
        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none';
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragState.current.isDragging || !sheetRef.current) return;
        
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - dragState.current.startY;
        const collapsedTranslateY = sheetRef.current.offsetHeight - 120;
        const currentTranslateY = isExpanded ? deltaY : collapsedTranslateY + deltaY;
        const newTranslateY = Math.max(0, Math.min(currentTranslateY, collapsedTranslateY));
        
        sheetRef.current.style.transform = `translateY(${newTranslateY}px)`;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!dragState.current.isDragging || !sheetRef.current) return;
        dragState.current.isDragging = false;

        const endY = e.changedTouches[0].clientY;
        const deltaY = endY - dragState.current.startY;

        sheetRef.current.style.transition = '';
        sheetRef.current.style.transform = '';

        if (Math.abs(deltaY) < 10) {
            setListState(isExpanded ? 'collapsed' : 'expanded');
            return;
        }

        const sheetHeight = sheetRef.current.offsetHeight;
        if (isExpanded) {
            if (deltaY > sheetHeight * 0.2) setListState('collapsed');
        } else {
            if (deltaY < -sheetHeight * 0.2) setListState('expanded');
        }
    };

    const containerClasses = [
        "absolute z-20 w-full card overflow-hidden flex flex-col",
        "bottom-0 right-0 left-0 rounded-t-2xl h-[70vh]",
        "transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "md:left-auto md:bottom-4 md:right-4 md:rounded-2xl md:max-w-sm md:h-auto md:max-h-[calc(100vh-6rem)] md:transform-none",
        isExpanded ? "translate-y-0" : "translate-y-[calc(70vh-120px)] md:translate-y-0",
    ].join(' ');

    return (
        <div ref={sheetRef} className={containerClasses}>
            <div
                className="flex-shrink-0 touch-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="w-10 h-1.5 bg-gray-500 rounded-full mx-auto mt-2 cursor-grab"></div>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="text-lg font-bold text-white">為您找到 {results.length} 間餐廳</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <FilterControls
                ratingFilter={ratingFilter}
                openNowFilter={openNowFilter}
                onRatingChange={onRatingChange}
                onOpenNowChange={onOpenNowChange}
            />
            {results.length > 0 ? (
                <ul className="divide-y divide-white/10 overflow-y-auto">
                    {results.map((result) => (
                        <li key={result.place_id} className="p-4 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => onResultSelect(result)}>
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
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/10">
                    <span className="text-4xl mb-4" role="img" aria-label="shrug">🤷‍♀️</span>
                    <h3 className="font-bold text-white">找不到符合條件的餐廳</h3>
                    <p className="text-sm text-gray-400 mt-2">請試著放寬您的篩選條件，或在附近進行新的搜尋。</p>
                </div>
            )}
        </div>
    );
};

export default ResultsList;
