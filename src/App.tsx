import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react';

// Complete Bangla alphabet data with corresponding English sounds
const allAlphabetData = [
  { bangla: 'অ', sound: 'o' }, { bangla: 'আ', sound: 'a' }, { bangla: 'ই', sound: 'i' }, { bangla: 'ঈ', sound: 'i' },
  { bangla: 'উ', sound: 'u' }, { bangla: 'ঊ', sound: 'u' }, { bangla: 'ঋ', sound: 'ri' }, { bangla: 'এ', sound: 'e' },
  { bangla: 'ঐ', sound: 'oi' }, { bangla: 'ও', sound: 'o' }, { bangla: 'ঔ', sound: 'ou' }, { bangla: 'ক', sound: 'ko' },
  { bangla: 'খ', sound: 'kho' }, { bangla: 'গ', sound: 'go' }, { bangla: 'ঘ', sound: 'gho' }, { bangla: 'ঙ', sound: 'ngo' },
  { bangla: 'চ', sound: 'cho' }, { bangla: 'ছ', sound: 'chho' }, { bangla: 'জ', sound: 'jo' }, { bangla: 'ঝ', sound: 'jho' },
  { bangla: 'ঞ', sound: 'nio' }, { bangla: 'ট', sound: 'to' }, { bangla: 'ঠ', sound: 'tho' }, { bangla: 'ড', sound: 'do' },
  { bangla: 'ঢ', sound: 'dho' }, { bangla: 'ণ', sound: 'no' }, { bangla: 'ত', sound: 'to' }, { bangla: 'থ', sound: 'tho' },
  { bangla: 'দ', sound: 'do' }, { bangla: 'ধ', sound: 'dho' }, { bangla: 'ন', sound: 'no' }, { bangla: 'প', sound: 'po' },
  { bangla: 'ফ', sound: 'pho' }, { bangla: 'ব', sound: 'bo' }, { bangla: 'ভ', sound: 'bho' }, { bangla: 'ম', sound: 'mo' }
];

interface Bubble {
  id: number;
  type: 'bangla' | 'sound';
  content: string;
  matched: boolean;
  position: { x: number; y: number; };
  startDelay: number;
}

const LETTERS_PER_LEVEL = 10;
const PASSING_SCORE_PERCENTAGE = 70;
const MAX_LEVEL = 10;

const App: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null);
  const [level, setLevel] = useState(1);
  const [currentLevelLetters, setCurrentLevelLetters] = useState<typeof allAlphabetData>([]);
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [popSound] = useState(() => new Audio('/sounds/pop.mp3'));
  const [showLevelEnd, setShowLevelEnd] = useState(false);
  const [allMatched, setAllMatched] = useState(false);

  useEffect(() => {
    popSound.preload = 'auto';
  }, [popSound]);

  const playPopSound = useCallback(() => {
    popSound.currentTime = 0;
    popSound.play().catch(error => console.log('Error playing sound:', error));
  }, [popSound]);

  const generateNewLevel = useCallback(() => {
    const availableLetters = allAlphabetData.filter(letter => !usedLetters.has(letter.bangla));
    let selectedLetters;
    if (availableLetters.length < LETTERS_PER_LEVEL) {
      setUsedLetters(new Set());
      const letters = [...allAlphabetData];
      shuffleArray(letters);
      selectedLetters = letters.slice(0, LETTERS_PER_LEVEL);
      setCurrentLevelLetters(selectedLetters);
    } else {
      shuffleArray(availableLetters);
      selectedLetters = availableLetters.slice(0, LETTERS_PER_LEVEL);
      setCurrentLevelLetters(selectedLetters);
      const newUsedLetters = new Set(usedLetters);
      selectedLetters.forEach(letter => newUsedLetters.add(letter.bangla));
      setUsedLetters(newUsedLetters);
    }
    const initialBubbles: Bubble[] = [];
    selectedLetters.forEach((item, index) => {
      const baseDelay = index * 2;
      initialBubbles.push({
        id: index * 2,
        type: 'bangla',
        content: item.bangla,
        matched: false,
        position: { x: 100 + (Math.random() * (window.innerWidth - 300)), y: window.innerHeight },
        startDelay: baseDelay,
      });
      initialBubbles.push({
        id: index * 2 + 1,
        type: 'sound',
        content: item.sound,
        matched: false,
        position: { x: 100 + (Math.random() * (window.innerWidth - 300)), y: window.innerHeight },
        startDelay: baseDelay + 1,
      });
    });
    setBubbles(initialBubbles);
    setSelectedBubble(null);
    setScore(0);
    setTotalAttempts(0);
    setAllMatched(false);
    setShowLevelEnd(false);
  }, [usedLetters]);

  useEffect(() => {
    if (level <= MAX_LEVEL) {
      generateNewLevel();
    }
  }, [level, generateNewLevel]);

  useEffect(() => {
    if (bubbles.length > 0 && bubbles.every(b => b.matched)) {
      setAllMatched(true);
      setTimeout(() => setShowLevelEnd(true), 700);
    }
  }, [bubbles]);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const handleBubbleClick = (bubble: Bubble) => {
    if (bubble.matched || allMatched) return;
    if (!selectedBubble) {
      setSelectedBubble(bubble);
    } else {
      const isMatch = checkMatch(selectedBubble, bubble);
      setTotalAttempts(prev => prev + 1);
      if (isMatch) {
        playPopSound();
        setScore(prev => prev + 1);
        setBubbles(prev =>
          prev.map(b =>
            b.id === bubble.id || b.id === selectedBubble.id
              ? { ...b, matched: true }
              : b
          )
        );
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

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
  };

  const handleTryAgain = () => {
    generateNewLevel();
  };

  const currentScore = totalAttempts > 0
    ? ((score / totalAttempts) * 100).toFixed(1)
    : '100';

  return (
    <GameContainer>
      <ScoreBoard>
        <div>Level: {level}/{MAX_LEVEL}</div>
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
              x: bubble.position.x
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
      {showLevelEnd && (
        <LevelEndOverlay>
          {parseFloat(currentScore) >= PASSING_SCORE_PERCENTAGE ? (
            <NextLevelButton onClick={handleNextLevel}>Next Level</NextLevelButton>
          ) : (
            <TryAgainButton onClick={handleTryAgain}>Try Again</TryAgainButton>
          )}
        </LevelEndOverlay>
      )}
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
  background: rgba(255, 255, 255, 0.8);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1.2rem;
  z-index: 10;
`;

const GrassGround = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 80px;
  background: linear-gradient(180deg, #4CAF50 0%, #357A38 100%);
  z-index: 1;
`;

const BubbleWrapper = styled(motion.div)<{ $isSelected: boolean; $isMatched: boolean }>`
  position: absolute;
  width: 80px;
  height: 80px;
  background: ${({ $isMatched }) => ($isMatched ? '#ccc' : '#fff')};
  border: 3px solid ${({ $isSelected }) => ($isSelected ? '#ff9800' : '#2196f3')};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  cursor: pointer;
  z-index: 2;
  user-select: none;
`;

const LevelEndOverlay = styled.div`
  position: fixed;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -40%);
  background: #fff;
  padding: 32px 48px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  text-align: center;
  z-index: 30;
`;

const NextLevelButton = styled.button`
  padding: 16px 32px;
  font-size: 1.5rem;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin: 0 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: background 0.2s;
  &:hover {
    background: #1769aa;
  }
`;

const TryAgainButton = styled(NextLevelButton)`
  background: #f44336;
  &:hover {
    background: #b71c1c;
  }
`;

export default App;
