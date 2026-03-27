import { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

// ===== SONS DO JOGO =====
const playSound = (type) => {
  const sounds = {
    correct: () => {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTgwNUKrj7rdkGwU7k9XzzXkqBSh+zPLaizsLGGS56+mnUhMJTKXh8bllHAU2jdXzzXksBSh+zPDajzsKGGS46+ajVBMKTKPi8bllHAU2jdXzzXkqBSh+zPDajzsKGGS46+ajVBMKTKPi8bllHAU2jdXzzXkqBSh+zPDajzsKGGS46+ajVBMKTKPi8bllHAU2jdXzzXkqBSh+zPDajzsKGGS46+ajVBMKTKPi8bllHAU2jdXzzXkqBSh+zPDajzsKGGS46+ajVBMKTKPi8bllHAU2jdXzzXkqBQ==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    },
    wrong: () => {
      const audio = new Audio('data:audio/wav;base64,UklGRhQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfADAACAgICAgICAgICAgICAgICAfn18e3l3dXNxb21raWhkY19cWFRRTEhEQD06Njw/QkhLT1JUXF5haGt0eH1/gH59fHt5d3Rzb2xpZ2NdWVRQS0ZBPDc0MTU4PUFGSk1RVllfY2drc3h9gIKBgH17eXd0cm9saGRgXFdTTklEPzs3NDAxNDg8QUVJTVFVWmJma3B1en6AgYF+fHp3dHJubGhlYFxXU05JREBAREhMUVZaX2RpcHV6fn+AfXt4dXJwbGdhXFhUUEtGQTs3MzAxNTg8QURITFBUWl5ja3B1e36AgH98eXZzbm1pZGFdWVRPSURAOzc0MTQ4PD9DR0tPU1hfZGlud3t/gYF+fXp3dHFubWlkYFxXU05JREAAQERHTFFVWVxhaGx0eX+BgYB9enZybmxoYl5aVVBLRkA8ODU0Nzs/Q0dLUFRaX2VrbXV7foKCgX99e3d0cGxnYl5ZU05JREBAREhMT1NXXGVrcHZ7gH+AfXt4dHJsamJeWlZRTUdCPTk1NDY6PkBESEtQVV1ia3B1eX5/f3x5dXFsZ2RgWlZST0pEPzw5Nzk8P0JFSUxQVltgZm13fYCCgn99eXVxbGhiXllUTklEQD88Ozw/QkVIS05UWWJ');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    },
    click: () => {
      const audio = new Audio('data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    },
    gameOver: () => {
      const audio = new Audio('data:audio/wav;base64,UklGRkgCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSQCAACAgICAgH9+fXx7eXh3dnV0c3JxcG9ube3s7Orq6enp6Ojn5+bm5eXk5OPj4uLi4eHh4ODg4N/f39/e3t7e3d3d3d3c3Nzc3Nzb29vb29vb2tra2tra2dnZ2dnZ2djY2NjY2NjY19fX19fX19fW1tbW1tbW1tbV1dXV1dXV1dXV1NTU1NTU1NTU09PT09PT09PT09PS0tLS0tLS0tLS0tLR0dHR0dHR0dHR0dHQ0NDQ0NDQ0NDQ0NDPz8/Pz8/Pz8/Pz8/Pz87Ozs7Ozs7Ozs7Ozs7Nzc3Nzc3Nzc3Nzc3Nzc3MzMzMzMzMzMzMzMzMy8vLy8vLy8vLy8vLy8vLurq6urq6urq6urq6urq6uqmpqampqampqampqampqamhoaGhoaGhoaGhoaGhoaGhoZ+fn5+fn5+fn5+fn5+fn5+fn4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj39/f39/f39/f39/f39/f39/f29vb29vb29vb29vb29vb29vb19fX19fX19fX19fX19fX19fX09PT09PT09PT09PT09PT09PPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Ly8vLy8vLy8vLy8vLy8vLy8vLx8fHx8fHx8fHx8fHx8fHx8fHx8PDw8PDw8PDw8PDw==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    },
    victory: () => {
      const audio = new Audio('data:audio/wav;base64,UklGRkgCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSQCAACJjI+Si5WYm56hpKesrrG0t7q9wMPGyczP0tXY293g4+bp7O/y9fj7/v///Pn29PH+7+zp5uPg3drc2dfU0c7LyMXCv7y5tra0sa6rqKWioJ+dnJqYl5aUk5KQj46NjIqJiYeHhoWFhIOEg4KCgoGBgYCAgIB/f39/fn5+fn19fX18fHx8e3t7e3p6enp5eXl5eHh4eHd3d3d2dnZ2dXV1dXR0dHRzc3Nzc3JycnJxcXFxcHBwcG9vb29ubm5ubW1tbWxsbGxra2tram5ubm5tbW1ta2tram5ubm5tbW1ta2tra2pqamppaWlpaWhoaGhnZ2dnZmZmZmVlZWVkZGRkY2NjY2JiYmJhYWFhYGBgYF9fX19eXl5eXV1dXVxcXFxbW1tbWlpaWllZWVlYWFhYV1dXV1ZWVlZVVVVVVFRUVFNTU1NSUlJSUVFRUVBQUFBPT09PTk5OTk1NTU1MTExMS0tLSkpKSkpJSUlJSEhIR0dHR0ZGRkZFRUVFREREREREQ0NDQ0JCQkJBQUFBQEBAQD8/Pz8+Pj4+PT09PT09PDw8PDs7Ozs6Ojo6OTk5OTg4ODg4Nzc3NzY2NjY1NTU1NDQ0NDMzMzMzMjIyMjExMTExMDAwMC8vLy8uLi4uLi0tLS0sLCwsKysrKyoqKioqKSkpKSgoKCgnJycnJiYmJiYlJSUlJCQkJCMjIyMiIiIiIiEhISEgICAgHx8fHx8eHh4eHR0dHRwcHBwbGxsbGxoaGhoZGRkZGBgYGBcXFxcXFhYWFhUVFRUUFBQUExMTExMSEhISERERERAQEBAQDw8PDw4ODg4NDQ0NDAwMDAsLCwsLCgoKCgkJCQkICAgIBwcHBwcGBgYGBQUFBQQEBAQDAwMDAwICAgIBAQEBAAAAAA==');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
  };
  
  if (sounds[type]) sounds[type]();
};

// ===== GERAR QUESTÕES =====
function generateQuestion(level) {
  const a = Math.floor(Math.random() * 20);
  const b = Math.floor(Math.random() * 20);

  if (level === 1) {
    return { type: "input", q: `${a}+${b}`, a: String(a + b) };
  }

  if (level === 2) {
    const correct = a + b;
    const isTrue = Math.random() > 0.5;
    return {
      type: "vf",
      q: `${a}+${b}=${isTrue ? correct : correct + 1}`,
      a: isTrue ? "true" : "false",
    };
  }

  return {
    type: "mc",
    q: `${a}+${b}`,
    options: [a + b, a + b + 1, a + b - 1, a + b + 2].sort(() => Math.random() - 0.5),
    a: String(a + b),
  };
}

export default function App() {
  // ===== ESTADOS =====
  const [screen, setScreen] = useState("choice");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(generateQuestion(1));
  const [answer, setAnswer] = useState("");
  const [intro, setIntro] = useState(true);
  const [time, setTime] = useState(5);
  const [gameTime, setGameTime] = useState(30); // Aumentado para 30 segundos

  const [xp, setXp] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // ===== FIRESTORE LOGIN / REGISTER =====
  async function register() {
    if (!username || !password) {
      setError("Preencha tudo");
      return;
    }

    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9]/g, "");
    if (!cleanUsername) {
      setError("Nome de usuário inválido");
      return;
    }

    try {
      const userRef = doc(db, "users", cleanUsername);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setError("Usuário já existe");
        return;
      }

      await setDoc(userRef, { password: password.trim(), score: 0 });

      setUser(cleanUsername);
      setXp(0);
      setScreen("menu");
      setError("");
      playSound('victory');
      fetchGlobalRanking();
    } catch (e) {
      console.error("Erro ao criar usuário:", e);
      setError("Erro ao criar usuário (verifique regras do Firestore)");
      playSound('wrong');
    }
  }

  async function login() {
    if (!username || !password) {
      setError("Preencha tudo");
      return;
    }

    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9]/g, "");
    if (!cleanUsername) {
      setError("Nome de usuário inválido");
      return;
    }

    try {
      const userRef = doc(db, "users", cleanUsername);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Usuário não existe");
        return;
      }

      const data = userSnap.data();
      if (data.password !== password.trim()) {
        setError("Senha inválida");
        return;
      }

      setUser(cleanUsername);
      setXp(data.score || 0);
      setScreen("menu");
      setError("");
      playSound('victory');
      fetchGlobalRanking();
    } catch (e) {
      console.error("Erro no login:", e);
      setError("Erro no login (verifique Firestore e conexão)");
      playSound('wrong');
    }
  }

  async function updateScore(newXP) {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user), { score: newXP }, { merge: true });
      await fetchGlobalRanking();
    } catch (e) {
      console.error("Erro ao atualizar score:", e);
    }
  }

  // ===== FETCH GLOBAL RANKING =====
  async function fetchGlobalRanking() {
    try {
      const usersCol = collection(db, "users");
      const usersSnap = await getDocs(usersCol);
      const usersList = usersSnap.docs.map((doc) => ({ username: doc.id, ...doc.data() }));
      usersList.sort((a, b) => b.score - a.score);
      setGlobalRanking(usersList);
    } catch (e) {
      console.error("Erro ao buscar ranking global:", e);
    }
  }

  // ===== INTRO TIMER =====
  useEffect(() => {
    if (!intro || gameOver) return;
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIntro(false);
          setGameTime(30); // Reset para 30 segundos
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intro, gameOver]);

  // ===== GAME TIMER =====
  useEffect(() => {
    if (intro || gameOver) return;
    const timer = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          handleWrong();
          return 30; // Reset para 30 segundos
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intro, level, gameOver]);

  // ===== ENTER PARA INPUT =====
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Enter" && question.type === "input" && !intro && !gameOver) {
        check(answer);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [answer, question, intro, gameOver]);

  // ===== LOCAL RANKING (MENU) =====
  useEffect(() => {
    if (screen === "menu") {
      fetchGlobalRanking();
    }
  }, [screen]);

  // ===== GAME FUNCTIONS =====
  function next() {
    setQuestion(generateQuestion(level));
    setAnswer("");
    setIntro(true);
    setTime(5);
  }

  function handleCorrect() {
    playSound('correct');
    const newStreak = streak + 1;
    const newXP = xp + 10;
    
    setStreak(newStreak);
    setXp(newXP);

    if (newStreak >= 3) {
      setLevel((prev) => prev + 1);
      setStreak(0);
      playSound('victory');
    }
    
    next();
  }

  function handleWrong() {
    playSound('wrong');
    const newLives = lives - 1;
    const newXP = Math.max(xp - 5, 0);
    
    setLives(newLives);
    setStreak(0);
    setXp(newXP);

    if (newLives <= 0) {
      // Salvar score final e atualizar ranking
      setFinalScore(newXP);
      setGameOver(true);
      updateScore(newXP);
      playSound('gameOver');
      return;
    }

    if (level > 1) setLevel((prev) => prev - 1);
    next();
  }

  function check(ans) {
    playSound('click');
    if (ans == question.a) handleCorrect();
    else handleWrong();
  }

  function resetGame() {
    playSound('click');
    setLives(3);
    setLevel(1);
    setStreak(0);
    setQuestion(generateQuestion(1));
    setAnswer("");
    setIntro(true);
    setTime(5);
    setGameTime(30);
    setGameOver(false);
  }

  function backToMenu() {
    playSound('click');
    resetGame();
    setScreen("menu");
  }

  // ===== SCREENS =====
  if (screen === "choice") {
    return (
      <div className="container">
        <div className="card">
          <div className="logo">🧮</div>
          <h1 className="title">Math Game CEM 01</h1>
          <p className="subtitle">Aprenda matemática jogando!</p>
          <button className="btn btn-primary" onClick={() => { playSound('click'); setScreen("login"); }}>
            Entrar
          </button>
          <button className="btn btn-secondary" onClick={() => { playSound('click'); setScreen("register"); }}>
            Criar Conta
          </button>
        </div>
      </div>
    );
  }

  if (screen === "login") {
    return (
      <div className="container">
        <div className="card">
          <h2 className="title">Entrar</h2>
          <input
            className="input"
            placeholder="Nome"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />
          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" onClick={login}>
            Entrar
          </button>
          <button className="btn btn-back" onClick={() => { playSound('click'); setScreen("choice"); }}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  if (screen === "register") {
    return (
      <div className="container">
        <div className="card">
          <h2 className="title">Criar Conta</h2>
          <input
            className="input"
            placeholder="Nome"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />
          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" onClick={register}>
            Criar
          </button>
          <button className="btn btn-back" onClick={() => { playSound('click'); setScreen("choice"); }}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  if (screen === "menu") {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">🏠 Menu</h1>
          <div className="stats-container">
            <div className="stat-card">
              <span className="stat-icon">👤</span>
              <span className="stat-value">{user}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">XP: {xp}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📈</span>
              <span className="stat-value">Nível: {level}</span>
            </div>
          </div>

          <div className="ranking-section">
            <h2 className="subtitle">🏆 Ranking Global</h2>
            <div className="ranking-list">
              {globalRanking.slice(0, 10).map((r, i) => (
                <div key={i} className={`ranking-item ${r.username === user ? 'current-user' : ''}`}>
                  <span className="ranking-position">{i + 1}.</span>
                  <span className="ranking-name">{r.username}</span>
                  <span className="ranking-score">{r.score} XP</span>
                </div>
              ))}
              {globalRanking.length === 0 && (
                <p className="no-data">Nenhum jogador ainda</p>
              )}
            </div>
          </div>

          <button className="btn btn-primary btn-large" onClick={() => { playSound('click'); setScreen("game"); }}>
            🎮 Jogar Agora
          </button>
        </div>
      </div>
    );
  }

  // ===== GAME OVER SCREEN =====
  if (gameOver) {
    return (
      <div className="container">
        <div className="card game-over-card">
          <div className="game-over-icon">💀</div>
          <h1 className="title game-over-title">Game Over!</h1>
          <div className="game-over-stats">
            <p className="game-over-score">Score Final: <strong>{finalScore} XP</strong></p>
            <p className="game-over-level">Nível Alcançado: <strong>{level}</strong></p>
          </div>
          <div className="button-group">
            <button className="btn btn-primary" onClick={resetGame}>
              🔄 Jogar Novamente
            </button>
            <button className="btn btn-secondary" onClick={backToMenu}>
              🏠 Voltar ao Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME SCREEN =====
  return (
    <div className="container game-container">
      <div className="game-header">
        <button className="btn-menu" onClick={backToMenu} title="Voltar ao Menu">
          🏠
        </button>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">👤</span>
            <span className="stat-text">{user}</span>
          </div>
          <div className="stat-item lives">
            <span className="stat-label">❤️</span>
            <span className="stat-text">{lives}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🔥</span>
            <span className="stat-text">{streak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">📈</span>
            <span className="stat-text">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">⭐</span>
            <span className="stat-text">{xp}</span>
          </div>
        </div>
      </div>

      <div className="card game-card">
        {intro ? (
          <div className="intro">
            <div className="intro-icon">
              {question.type === "input" && "✍️"}
              {question.type === "vf" && "✅"}
              {question.type === "mc" && "🎯"}
            </div>
            <h2 className="intro-title">
              {question.type === "input" && "Digite a Resposta"}
              {question.type === "vf" && "Verdadeiro ou Falso?"}
              {question.type === "mc" && "Escolha a Resposta"}
            </h2>
            <div className="intro-timer">{time}</div>
          </div>
        ) : (
          <div className="question-container">
            <h2 className="question">{question.q}</h2>
            <div className={`timer ${gameTime <= 10 ? 'timer-warning' : ''}`}>
              ⏱️ {gameTime}s
            </div>

            {question.type === "input" && (
              <div className="answer-section">
                <input
                  className="input game-input"
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="?"
                  autoFocus
                />
                <button className="btn btn-primary" onClick={() => check(answer)}>
                  Confirmar
                </button>
              </div>
            )}

            {question.type === "vf" && (
              <div className="button-group">
                <button className="btn btn-true" onClick={() => check("true")}>
                  ✅ Verdadeiro
                </button>
                <button className="btn btn-false" onClick={() => check("false")}>
                  ❌ Falso
                </button>
              </div>
            )}

            {question.type === "mc" && (
              <div className="options-grid">
                {question.options.map((o, i) => (
                  <button key={i} className="btn btn-option" onClick={() => check(String(o))}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}