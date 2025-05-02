import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Complete Bangla alphabet data with corresponding English sounds
const allAlphabetData = [
  { bangla: 'অ', sound: 'o' },
  { bangla: 'আ', sound: 'a' },
  { bangla: 'ই', sound: 'i' },
  { bangla: 'ঈ', sound: 'i' },
  { bangla: 'উ', sound: 'u' },
  { bangla: 'ঊ', sound: 'u' },
  { bangla: 'ঋ', sound: 'ri' },
  { bangla: 'এ', sound: 'e' },
  { bangla: 'ঐ', sound: 'oi' },
  { bangla: 'ও', sound: 'o' },
  { bangla: 'ঔ', sound: 'ou' },
  { bangla: 'ক', sound: 'ko' },
  { bangla: 'খ', sound: 'kho' },
  { bangla: 'গ', sound: 'go' },
  { bangla: 'ঘ', sound: 'gho' },
  { bangla: 'ঙ', sound: 'ngo' },
  { bangla: 'চ', sound: 'cho' },
  { bangla: 'ছ', sound: 'chho' },
  { bangla: 'জ', sound: 'jo' },
  { bangla: 'ঝ', sound: 'jho' },
  { bangla: 'ঞ', sound: 'nio' },
  { bangla: 'ট', sound: 'to' },
  { bangla: 'ঠ', sound: 'tho' },
  { bangla: 'ড', sound: 'do' },
  { bangla: 'ঢ', sound: 'dho' },
  { bangla: 'ণ', sound: 'no' },
  { bangla: 'ত', sound: 'to' },
  { bangla: 'থ', sound: 'tho' },
  { bangla: 'দ', sound: 'do' },
  { bangla: 'ধ', sound: 'dho' },
  { bangla: 'ন', sound: 'no' },
  { bangla: 'প', sound: 'po' },
  { bangla: 'ফ', sound: 'pho' },
  { bangla: 'ব', sound: 'bo' },
  { bangla: 'ভ', sound: 'bho' },
  { bangla: 'ম', sound: 'mo' }
];

interface Bubble {
  id: number;
  type: 'bangla' | 'sound';
  content: string;
  matched: boolean;
  position: {
    x: number;
    y: number;
  };
  startDelay: number;
}

const LETTERS_PER_LEVEL = 10;
const PASSING_SCORE_PERCENTAGE = 70;

const App: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null);
  const [level, setLevel] = useState(1);
  const [currentLevelLetters, setCurrentLevelLetters] = useState<typeof allAlphabetData>([]);
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [popSound] = useState(() => new Audio('/sounds/pop.mp3'));

  // Initialize pop sound
  useEffect(() => {
    popSound.preload = 'auto';
  }, [popSound]);

  // Play pop sound function
  const playPopSound = useCallback(() => {
    popSound.currentTime = 0; // Reset sound to start
    popSound.play().catch(error => console.log('Error playing sound:', error));
  }, [popSound]);

  // Initialize level
  useEffect(() => {
    console.log('Level changed, generating new level:', level);
    generateNewLevel();
  }, [level]);

  // Debug useEffect to track bubble state
  useEffect(() => {
    console.log('Bubbles state updated:', bubbles);
  }, [bubbles]);

  const generateNewLevel = () => {
    // Filter out already used letters when possible
    const availableLetters = allAlphabetData.filter(letter => !usedLetters.has(letter.bangla));
    
    let selectedLetters;
    // If we don't have enough unused letters, reset the used letters
    if (availableLetters.length < LETTERS_PER_LEVEL) {
      setUsedLetters(new Set());
      const letters = [...allAlphabetData];
      shuffleArray(letters);
      selectedLetters = letters.slice(0, LETTERS_PER_LEVEL);
      setCurrentLevelLetters(selectedLetters);
    } else {
      // Get random unused letters
      shuffleArray(availableLetters);
      selectedLetters = availableLetters.slice(0, LETTERS_PER_LEVEL);
      setCurrentLevelLetters(selectedLetters);
      
      // Add selected letters to used set
      const newUsedLetters = new Set(usedLetters);
      selectedLetters.forEach(letter => newUsedLetters.add(letter.bangla));
      setUsedLetters(newUsedLetters);
    }

    // Generate bubbles immediately with the selected letters
    const initialBubbles: Bubble[] = [];
    selectedLetters.forEach((item, index) => {
      const baseDelay = index * 2;
      
      // Create Bangla bubble
      initialBubbles.push({
        id: index * 2,
        type: 'bangla',
        content: item.bangla,
        matched: false,
        position: {
          x: 100 + (Math.random() * (window.innerWidth - 300)), // Keep away from edges
          y: window.innerHeight,
        },
        startDelay: baseDelay,
      });

      // Create sound bubble
      initialBubbles.push({
        id: index * 2 + 1,
        type: 'sound',
        content: item.sound,
        matched: false,
        position: {
          x: 100 + (Math.random() * (window.innerWidth - 300)), // Keep away from edges
          y: window.innerHeight,
        },
        startDelay: baseDelay + 1,
      });
    });

    console.log('Generated bubbles:', initialBubbles); // Debug log
    setBubbles(initialBubbles);
  };

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const handleBubbleClick = (bubble: Bubble) => {
    if (bubble.matched) return;

    if (!selectedBubble) {
      setSelectedBubble(bubble);
    } else {
      // Check if it's a match
      const isMatch = checkMatch(selectedBubble, bubble);
      setTotalAttempts(prev => prev + 1);
      
      if (isMatch) {
        playPopSound(); // Play pop sound on match
        setScore(prev => prev + 1);
        setBubbles(prev =>
          prev.map(b =>
            b.id === bubble.id || b.id === selectedBubble.id
              ? { ...b, matched: true }
              : b
          )
        );

        // Check if all current bubbles are matched
        const allMatched = bubbles.every(b => 
          b.matched || b.id === bubble.id || b.id === selectedBubble.id
        );

        // If all matched, proceed to next level
        if (allMatched) {
          if (level < 10) {
            setTimeout(() => {
              setLevel(prev => prev + 1);
            }, 1000);
          } else {
            // Game completed
            alert(`Game Complete!\nFinal Score: ${((score + 1) / totalAttempts * 100).toFixed(1)}%\n${((score + 1) / totalAttempts * 100) >= PASSING_SCORE_PERCENTAGE ? 'Passed! 🎉' : 'Try again to achieve 70% or higher'}`);
          }
        }
      }
      setSelectedBubble(null);
    }
  };

  const checkMatch = (bubble1: Bubble, bubble2: Bubble) => {
    if (bubble1.type === bubble2.type) return false;
    const pair = currentLevelLetters.find(
      item =>
        (bubble1.content === item.bangla && bubble2.content === item.sound) ||
        (bubble2.content === item.bangla && bubble1.content === item.sound)
    );
    return !!pair;
  };

  const currentScore = totalAttempts > 0 
    ? ((score / totalAttempts) * 100).toFixed(1) 
    : '100';

  return (
    <GameContainer>
      <ScoreBoard>
        <div>Level: {level}/10</div>
        <div>Score: {score}</div>
        <div>Accuracy: {currentScore}%</div>
      </ScoreBoard>
      <GrassGround />
      <AnimatePresence>
        {bubbles.map(bubble => (
          <BubbleWrapper
            key={bubble.id}
            initial={{ y: window.innerHeight }}
            animate={{
              y: bubble.matched ? window.innerHeight : -100,
              x: bubble.position.x + Math.sin(Date.now() / 1000) * 20
            }}
            exit={{ y: window.innerHeight }}
            transition={{
              y: { 
                duration: bubble.matched ? 0.5 : 27,
                ease: bubble.matched ? 'easeIn' : 'linear',
                delay: bubble.matched ? 0 : bubble.startDelay,
              }
            }}
            onClick={() => handleBubbleClick(bubble)}
            $isSelected={selectedBubble?.id === bubble.id}
            $isMatched={bubble.matched}
          >
            {bubble.content}
          </BubbleWrapper>
        ))}
      </AnimatePresence>
    </GameContainer>
  );
};

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
  overflow: hidden;
  position: relative;
`;

const ScoreBoard = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px 25px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BubbleWrapper = styled(motion.div)<{ $isSelected: boolean; $isMatched: boolean }>`
  position: absolute;
  width: 70px;
  height: 70px;
  background: ${props => props.$isMatched 
    ? 'linear-gradient(135deg, rgba(136, 255, 136, 0.8), rgba(136, 255, 136, 0.4))' 
    : props.$isSelected 
      ? 'linear-gradient(135deg, rgba(255, 255, 136, 0.8), rgba(255, 255, 136, 0.4))' 
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  cursor: pointer;
  user-select: none;
  backdrop-filter: blur(2px);
  box-shadow: 
    inset -2px -2px 6px rgba(0, 0, 0, 0.1),
    inset 2px 2px 6px rgba(255, 255, 255, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    transform: scale(1.1) translateZ(10px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 5%;
    left: 15%;
    width: 30%;
    height: 30%;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    filter: blur(2px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 15%;
    right: 15%;
    width: 20%;
    height: 20%;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    filter: blur(1px);
  }
`;

const GrassGround = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(180deg, #90EE90 0%, #228B22 100%);
  z-index: 1;
`;

export default App; 