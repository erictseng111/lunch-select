import React from 'react';
import { AppResult, Review } from '../types';

const StarIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);

const StarRating: React.FC<{ rating?: number }> = ({ rating = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} className="text-accent-gold" />)}
            {halfStar && <StarIcon key="half" className="text-accent-gold opacity-50" />}
            {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} className="text-gray-600" />)}
        </div>
    );
};

// Helper to get today's day, Sunday is 0
const getDayOfWeek = () => {
    return new Date().getDay();
}

interface ResultCardProps {
  result: AppResult;
  onClose: () => void;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
        {children}
    </div>
);

// --- Components for Reviews ---
const ReviewStarIcon: React.FC<{className: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>);

const ReviewStarRating: React.FC<{ rating?: number }> = ({ rating = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <ReviewStarIcon key={`full-${i}`} className="text-accent-gold" />)}
            {halfStar && <ReviewStarIcon key="half" className="text-accent-gold opacity-50" />}
            {[...Array(emptyStars)].map((_, i) => <ReviewStarIcon key={`empty-${i}`} className="text-gray-600" />)}
        </div>
    );
};

interface ReviewItemProps {
    review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
    return (
        <div className="flex items-start space-x-3">
            <img 
                src={review.profile_photo_url} 
                alt={`${review.author_name}'s profile`}
                className="w-10 h-10 rounded-full bg-gray-700 object-cover"
                referrerPolicy="no-referrer"
            />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{review.author_name}</h4>
                    <span className="text-xs text-gray-500">{review.relative_time_description}</span>
                </div>
                <div className="mt-1">
                    <ReviewStarRating rating={review.rating} />
                </div>
                {review.text && <p className="text-sm text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">{review.text}</p>}
            </div>
        </div>
    );
};


const ResultCard: React.FC<ResultCardProps> = ({ result, onClose }) => {
  const todayIndex = getDayOfWeek();
  // Google's weekday_text starts with Monday, so we need to adjust Sunday's index.
  const googleApiDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <div className="absolute z-20 w-full card overflow-hidden flex flex-col 
                   bottom-0 right-0 left-0 rounded-t-2xl max-w-full max-h-[75vh] animate-slide-in-up
                   md:left-auto md:bottom-4 md:right-4 md:rounded-2xl md:max-w-sm md:max-h-[calc(100vh-4rem)] md:animate-fade-in-up">
        {/* 1. Restaurant Preview Image */}
        <div className="relative flex-shrink-0">
            <div 
                className="w-full h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${result.photoUrl || 'https://placehold.co/400x200/2c2c2e/f5f5f7?text=Image'})` }}
                role="img"
                aria-label={result.name}
            ></div>
            <button onClick={onClose} className="absolute top-3 right-3 bg-black/50 rounded-full p-1.5 text-white hover:bg-black/80 transition-colors z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      
        <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white">{result.name}</h2>
            
            {/* 2. Rating and Reviews */}
            {result.rating != null && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                <span className="font-semibold text-accent-gold text-base">{result.rating.toFixed(1)}</span>
                <StarRating rating={result.rating} />
                <span>({result.user_ratings_total} 則評論)</span>
              </div>
            )}

            <div className="mt-4 flex flex-col">
                {/* 3. AI Summary */}
                <InfoSection title="AI 總覽">
                    <p className="text-sm text-gray-300 leading-relaxed">{result.details}</p>
                </InfoSection>

                {/* 4. Address */}
                {result.vicinity && (
                    <InfoSection title="地址">
                        <p className="text-sm text-white">{result.vicinity}</p>
                    </InfoSection>
                )}

                {/* 5. Reservable & Website Link */}
                <InfoSection title="預約資訊">
                    <div className="space-y-3">
                        <div className="flex items-center text-sm">
                            {result.reservable === true && <span className="text-green-400 mr-2">✔️</span>}
                            {result.reservable === false && <span className="text-red-400 mr-2">❌</span>}
                            <span className={result.reservable === undefined ? 'text-gray-400' : 'text-white'}>
                                {result.reservable === true ? '可接受預約' : 
                                 result.reservable === false ? '不接受預約' : '預約資訊未提供'}
                            </span>
                        </div>
                        {result.website && (
                            <a 
                                href={result.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full text-center btn btn-primary"
                            >
                                前往預訂或查看官網
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                    </div>
                </InfoSection>

                {/* 6. Opening Hours */}
                {result.opening_hours && (
                    <InfoSection title="營業時間">
                        <div className="flex items-center mb-3">
                            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${result.opening_hours.open_now ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className={`font-semibold ${result.opening_hours.open_now ? 'text-green-300' : 'text-red-300'}`}>
                                {result.opening_hours.open_now ? '營業中' : '休息中'}
                            </span>
                        </div>
                        <ul className="text-sm space-y-1">
                            {result.opening_hours.weekday_text?.map((text, index) => (
                                <li key={index} className={`flex justify-between ${index === googleApiDayIndex ? 'text-accent-gold font-bold' : 'text-gray-300'}`}>
                                    <span>{text.split(': ')[0]}:</span>
                                    <span>{text.split(': ')[1]}</span>
                                </li>
                            ))}
                        </ul>
                    </InfoSection>
                )}

                {/* 7. User Reviews */}
                {result.reviews && result.reviews.length > 0 && (
                    <InfoSection title="用戶評論">
                        <div className="space-y-6">
                            {result.reviews.slice(0, 3).map((review, index) => (
                                <ReviewItem key={index} review={review} />
                            ))}
                        </div>
                    </InfoSection>
                )}
            </div>
        </div>
    </div>
  );
};

export default ResultCard;