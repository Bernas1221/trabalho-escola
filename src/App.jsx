import { useState, useEffect } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDr...",
  authDomain: "trabalho-da-escola-254e7.firebaseapp.com",
  projectId: "trabalho-da-escola-254e7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// QUESTÕES
const questions = Array.from({ length: 100 }, () => {
  let a = Math.floor(Math.random()*50);
  let b = Math.floor(Math.random()*50);
  return { q: `${a} + ${b}`, a: String(a+b) };
});

export default function App() {
  const [screen, setScreen] = useState("login");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const [mode, setMode] = useState(null);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [xp, setXp] = useState(0);
  const [answer, setAnswer] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [history, setHistory] = useState([]);

  function getQuestion() {
    return questions[currentQ % questions.length];
  }

  function checkAnswer() {
    if (answer == getQuestion().a) {
      setXp(xp + 10);
      if (xp + 10 >= 100) {
        setLevel(level + 1);
        setXp(0);
        setResult("win");
      }
      setCurrentQ(currentQ + 1);
    } else {
      setLives(lives - 1);
      if (lives - 1 <= 0) setResult("lose");
    }
    setAnswer("");
  }

  useEffect(() => {
    const key = (e) => e.key === "Enter" && checkAnswer();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  // LOGIN
  async function login() {
    const ref = doc(db, "users", nickname);
    const snap = await getDoc(ref);

    if (!snap.exists()) return setError("Conta não existe");

    if (snap.data().password !== password) {
      return setError("Senha errada");
    }

    setUser(nickname);
    setHistory(snap.data().history || []);
    setScreen("menu");
  }

  // REGISTRO
  async function register() {
    const ref = doc(db, "users", nickname);
    const snap = await getDoc(ref);

    if (snap.exists()) return setError("Nome já existe");

    await setDoc(ref, {
      password,
      level: 1,
      history: [],
      scores: {}
    });

    setUser(nickname);
    setScreen("menu");
  }

  // SALVAR
  async function saveGame() {
    const ref = doc(db, "users", user);

    const snap = await getDoc(ref);
    const data = snap.data();

    const newHistory = [
      ...data.history,
      { mode, level, date: new Date().toLocaleString() }
    ];

    const newScores = {
      ...data.scores,
      [mode]: Math.max(data.scores?.[mode] || 0, level)
    };

    await updateDoc(ref, {
      level,
      history: newHistory,
      scores: newScores
    });
  }

  // RANKING
  async function loadRanking() {
    const query = await getDocs(collection(db, "users"));
    const list = [];

    query.forEach(doc => {
      const data = doc.data();
      list.push({
        name: doc.id,
        score: data.scores?.[mode] || 0
      });
    });

    list.sort((a,b)=>b.score - a.score);
    setRanking(list);
  }

  // LOGIN SCREEN
  if (screen === "login") {
    return (
      <div className="container">
        <h1>🔥 Math Game</h1>

        <input placeholder="Nome" onChange={(e)=>setNickname(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={(e)=>setPassword(e.target.value)} />

        <button className="btn" onClick={login}>Entrar</button>
        <button className="btn" onClick={register}>Criar Conta</button>

        <p>{error}</p>
      </div>
    );
  }

  // MENU
  if (screen === "menu") {
    return (
      <div className="container">
        <h2>Bem-vindo {user}</h2>

        <button className="btn" onClick={()=>{setMode("treino");setScreen("game")}}>Treino</button>
        <button className="btn" onClick={()=>{setMode("desafio");setScreen("game")}}>Desafio</button>
        <button className="btn" onClick={()=>{setMode("tempo");setScreen("game")}}>Tempo</button>

        <button className="btn" onClick={()=>{loadRanking();setScreen("ranking")}}>
          Ranking 🏆
        </button>

        <button className="btn" onClick={()=>setScreen("history")}>
          Histórico 📊
        </button>
      </div>
    );
  }

  // GAME
  if (screen === "game") {
    return (
      <div className="container">
        <button className="btn" onClick={()=>setScreen("menu")}>⬅ Menu</button>

        <h2>{user} | Lv {level} | ❤️ {lives}</h2>

        <h1>{getQuestion().q}</h1>

        <input value={answer} onChange={(e)=>setAnswer(e.target.value)} />

        <button className="btn" onClick={checkAnswer}>Responder</button>

        {result && (
          <div className="overlay">
            <h1>{result === "win" ? "🎉 Vitória" : "💀 Derrota"}</h1>
            <button className="btn" onClick={()=>{
              saveGame();
              setLives(3);
              setResult(null);
              setScreen("menu");
            }}>
              Voltar
            </button>
          </div>
        )}
      </div>
    );
  }

  // RANKING
  if (screen === "ranking") {
    return (
      <div className="container">
        <h2>🏆 Ranking ({mode})</h2>

        {ranking.map((p,i)=>(
          <p key={i}>{i+1}. {p.name} - Lv {p.score}</p>
        ))}

        <button className="btn" onClick={()=>setScreen("menu")}>
          Voltar
        </button>
      </div>
    );
  }

  // HISTÓRICO
  if (screen === "history") {
    return (
      <div className="container">
        <h2>📊 Histórico</h2>

        {history.map((h,i)=>(
          <p key={i}>{h.mode} | Lv {h.level} | {h.date}</p>
        ))}

        <button className="btn" onClick={()=>setScreen("menu")}>
          Voltar
        </button>
      </div>
    );
  }
}