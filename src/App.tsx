// ... existing code ...
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
  const [gameStarted, setGameStarted] = useState(false);

  // Helper to start the game and initialize level 1
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
    setLevel(1);
    setUsedLetters(new Set());
    setTimeout(() => {
      generateNewLevel();
    }, 0);
  }, [generateNewLevel]);

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
// ... existing code ...
// Replace JellyButton and StartScreen styles with the following:
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
// ... existing code ...