import React, { useState, useEffect } from 'react';

// Define the 8-bit food SVGs as components
const BurgerIcon = () => (
  <svg width="80" height="80" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
    <rect x="5" y="4" width="10" height="2" fill="#D2691E" /> {/* Top Bun */}
    <rect x="6" y="5" width="2" height="1" fill="#FFD700" /> {/* Sesame */}
    <rect x="12" y="5" width="2" height="1" fill="#FFD700" /> {/* Sesame */}
    <rect x="4" y="6" width="12" height="2" fill="#8B4513" /> {/* Patty */}
    <rect x="4" y="8" width="12" height="1" fill="#FFD700" /> {/* Cheese */}
    <rect x="4" y="9" width="12" height="1" fill="#008000" /> {/* Lettuce */}
    <rect x="5" y="10" width="10" height="2" fill="#D2691E" /> {/* Bottom Bun */}
  </svg>
);

const PizzaIcon = () => (
  <svg width="80" height="80" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
    <path d="M 2 2 L 18 10 L 2 18 Z" fill="#FFD700" /> {/* Crust */}
    <path d="M 4 4.5 L 16 10 L 4 15.5 Z" fill="#FF4500" /> {/* Sauce */}
    <rect x="6" y="6" width="3" height="3" fill="#FFFF00" rx="1" /> {/* Cheese/Topping */}
    <rect x="10" y="8" width="3" height="3" fill="#FFFF00" rx="1" /> {/* Cheese/Topping */}
    <rect x="5" y="11" width="3" height="3" fill="#FFFF00" rx="1" /> {/* Cheese/Topping */}
  </svg>
);

const OnigiriIcon = () => (
    <svg width="80" height="80" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <path d="M 4 15 L 4 8 L 10 3 L 16 8 L 16 15 Z" fill="#FFFFFF" /> {/* Rice */}
      <rect x="6" y="15" width="8" height="3" fill="#000000" /> {/* Nori */}
    </svg>
);

// Array of food component choices
const foodIcons = [<BurgerIcon />, <PizzaIcon />, <OnigiriIcon />];

// Array of funny captions
const funnyCaptions = [
  "AI小編在熱鍋了，別催！",
  "正在為您捕捉最肥美的餐廳...",
  "吃撒小... 我幫你看看",
  "AI正在跑來跑去搜集中，腳好痠",
  "今天好熱喔，AI吃到滿頭大汗",
  "等等，我掐指算一下哪家好吃",
];

interface LoadingOverlayProps {
  message?: string; // Prop kept for compatibility but is no longer used.
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = () => {
    const [selectedFood, setSelectedFood] = useState<React.ReactNode>(null);
    const [selectedCaption, setSelectedCaption] = useState<string>('');
  
    useEffect(() => {
      // Randomly select one food icon and one caption on component mount
      const randomFoodIndex = Math.floor(Math.random() * foodIcons.length);
      const randomCaptionIndex = Math.floor(Math.random() * funnyCaptions.length);
  
      setSelectedFood(foodIcons[randomFoodIndex]);
      setSelectedCaption(funnyCaptions[randomCaptionIndex]);
    }, []); // Empty dependency array ensures this runs only once per load
  
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="animate-bobbing">
          {selectedFood}
        </div>
        <p className="text-white text-lg font-medium mt-4 text-center px-4">{selectedCaption}</p>
      </div>
    );
  };
  
export default LoadingOverlay;