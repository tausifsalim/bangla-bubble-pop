import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  popping?: boolean;
}

const LETTERS_PER_LEVEL = 10;
const PASSING_SCORE_PERCENTAGE = 70;
const MAX_LEVEL = 10;
const BUBBLE_RADIUS = 40; // px
const BUBBLE_DIAM = BUBBLE_RADIUS * 2;
const BUBBLE_OVERLAP_THRESHOLD = 0.1; // 10%

const App: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null);
  const [level, setLevel] = useState(1);
  const [currentLevelLetters, setCurrentLevelLetters] = useState<typeof allAlphabetData>([]);
  const [usedLetters, setUsedLetters] = useState<Set<string>>(new Set());
  const [showLevelEnd, setShowLevelEnd] = useState(false);
  const [allMatched, setAllMatched] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const popSound = useRef<HTMLAudioElement | null>(null);

  // Helper to shuffle an array
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Generate bubble positions
  const generateBubblePositions = (count: number, type: 'bangla' | 'sound') => {
    const positions: { x: number; y: number }[] = [];
    const maxAttempts = 1000;
    let attempts = 0;
    const width = window.innerWidth;
    const height = window.innerHeight - 120;
    const xMin = type === 'bangla' ? width / 2 + 40 : 40;
    const xMax = type === 'bangla' ? width - 120 : width / 2 - 120;
    while (positions.length < count && attempts < maxAttempts) {
      const x = xMin + Math.random() * (xMax - xMin);
      const y = height - 100 - Math.random() * (height / 2 - 100);
      const tooClose = positions.some(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < BUBBLE_DIAM - BUBBLE_DIAM * BUBBLE_OVERLAP_THRESHOLD;
      });
      if (!tooClose) positions.push({ x, y });
      attempts++;
    }
    return positions;
  };

  // Generate a new level (memoized, does not depend on usedLetters)
  const generateNewLevel = useCallback((resetUsedLetters = false) => {
    let availableLetters = allAlphabetData.filter(letter => !usedLetters.has(letter.bangla));
    let selectedLetters;
    let newUsedLetters = new Set(usedLetters);

    if (availableLetters.length < LETTERS_PER_LEVEL || resetUsedLetters) {
      newUsedLetters = new Set();
      const letters = [...allAlphabetData];
      shuffleArray(letters);
      selectedLetters = letters.slice(0, LETTERS_PER_LEVEL);
    } else {
      shuffleArray(availableLetters);
      selectedLetters = availableLetters.slice(0, LETTERS_PER_LEVEL);
      selectedLetters.forEach(letter => newUsedLetters.add(letter.bangla));
    }

    setCurrentLevelLetters(selectedLetters);

    // Generate bubble positions
    const banglaPositions = generateBubblePositions(LETTERS_PER_LEVEL, 'bangla');
    const soundPositions = generateBubblePositions(LETTERS_PER_LEVEL, 'sound');
    // Generate bubbles
    const initialBubbles: Bubble[] = [];
    selectedLetters.forEach((item, index) => {
      const baseDelay = index * 2;
      initialBubbles.push({
        id: index * 2,
        type: 'bangla',
        content: item.bangla,
        matched: false,
        position: banglaPositions[index],
        startDelay: baseDelay,
      });
      initialBubbles.push({
        id: index * 2 + 1,
        type: 'sound',
        content: item.sound,
        matched: false,
        position: soundPositions[index],
        startDelay: baseDelay + 1,
      });
    });
    setBubbles(initialBubbles);
    setSelectedBubble(null);
    setScore(0);
    setTotalAttempts(0);
    setAllMatched(false);
    setShowLevelEnd(false);
    setUsedLetters(newUsedLetters);
  // eslint-disable-next-line
  }, [level]);

  // Helper to start the game and initialize level 1
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    setLevel(1);
    generateNewLevel(true); // Reset used letters
  }, [generateNewLevel]);

  useEffect(() => {
    popSound.current = new Audio('/sounds/pop.mp3');
    if (popSound.current) {
      popSound.current.preload = 'auto';
    }
  }, []);

  // Play pop sound and haptic feedback
  const playPopSoundAndHaptic = useCallback(() => {
    if (popSound.current) {
      popSound.current.currentTime = 0;
      popSound.current.play().catch(error => console.log('Error playing sound:', error));
    }
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  // Realistic Pop Animation
  const handleBubbleClick = (bubble: Bubble) => {
    if (bubble.matched || allMatched) return;
    if (!selectedBubble) {
      setSelectedBubble(bubble);
    } else {
      const isMatch = checkMatch(selectedBubble, bubble);
      setTotalAttempts(prev => prev + 1);
      if (isMatch) {
        playPopSoundAndHaptic();
        // Set popping state for animation
        setBubbles(prev =>
          prev.map(b =>
            b.id === bubble.id || b.id === selectedBubble.id
              ? { ...b, popping: true }
              : b
          )
        );
        setTimeout(() => {
          setScore(prev => prev + 1);
          setBubbles(prev =>
            prev.map(b =>
              b.id === bubble.id || b.id === selectedBubble.id
                ? { ...b, matched: true, popping: false }
                : b
            )
          );
        }, 400); // Animation duration
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

  // Only generate a new level when level or gameStarted changes
  useEffect(() => {
    if (level <= MAX_LEVEL && gameStarted) {
      generateNewLevel();
    }
    // eslint-disable-next-line
  }, [level, gameStarted]);

  useEffect(() => {
    if (bubbles.length > 0 && bubbles.every(b => b.matched)) {
      setAllMatched(true);
      setTimeout(() => setShowLevelEnd(true), 700);
    }
  }, [bubbles]);

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
  };

  const handleTryAgain = () => {
    generateNewLevel();
  };

  const currentScore = totalAttempts > 0
    ? ((score / totalAttempts) * 100).toFixed(1)
    : '100';

  // --- 1. Start Screen ---
  if (!gameStarted) {
    return (
      <StartScreen>
        <StartButton onClick={handleStartGame}>
          Start Game
        </StartButton>
      </StartScreen>
    );
  }

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
            initial={{
              y: window.innerHeight,
              scale: 1,
              opacity: 1,
              rotate: 0
            }}
            animate={bubble.popping ? {
              scale: [1, 1.2, 0.7, 0.5],
              opacity: [1, 1, 0.7, 0],
              y: bubble.position
                ? [
                    bubble.position.y,
                    bubble.position.y - 40,
                    bubble.position.y - 80,
                    bubble.position.y - 120
                  ]
                : [0, -40, -80, -120],
              transition: { duration: 0.4 }
            } : {
              y: bubble.matched
                ? window.innerHeight
                : (bubble.position?.y ?? 0),
              x: bubble.position?.x ?? 0,
              scale: 1,
              opacity: 1,
              rotate: 0
            }}
            exit={{ y: window.innerHeight, opacity: 0 }}
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
            <BubbleInner popping={bubble.popping}>
              {bubble.content}
            </BubbleInner>
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

const StartScreen = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
`;

const StartButton = styled.button`
  font-size: 2rem;
  padding: 32px 64px;
  border-radius: 32px;
  background: linear-gradient(145deg, #87CEEB 0%, #E0F6FF 100%);
  color: #fff;
  border: none;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  cursor: pointer;
  font-weight: bold;
  outline: none;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(145deg, #E0F6FF 0%, #87CEEB 100%);
  }
`;

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

const BubbleInner = styled.div<{ popping?: boolean }>`
  transition: transform 0.4s cubic-bezier(.68,-0.55,.27,1.55);
  ${({ popping }) => popping && `
    transform: rotate(720deg) scale(1.3) translateY(-40px);
    opacity: 0;
  `}
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