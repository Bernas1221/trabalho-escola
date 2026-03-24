// App.jsx
import { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

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

  const [xp, setXp] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [globalRanking, setGlobalRanking] = useState([]);

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
      fetchGlobalRanking();
    } catch (e) {
      console.error("Erro ao criar usuário:", e);
      setError("Erro ao criar usuário (verifique regras do Firestore)");
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
      fetchGlobalRanking();
    } catch (e) {
      console.error("Erro no login:", e);
      setError("Erro no login (verifique Firestore e conexão)");
    }
  }

  async function updateScore(newXP) {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user), { score: newXP }, { merge: true });
      fetchGlobalRanking();
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
    if (!intro) return;
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIntro(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intro]);

  // ===== GAME TIMER =====
  useEffect(() => {
    if (intro) return;
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          handleWrong();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intro]);

  // ===== ENTER PARA INPUT =====
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Enter" && question.type === "input") {
        check(answer);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [answer, question]);

  // ===== LOCAL RANKING (MENU) =====
  useEffect(() => {
    if (screen === "menu") {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const sorted = users.sort((a, b) => b.score - a.score);
      setRanking(sorted);
    }
  }, [screen]);

  // ===== GAME FUNCTIONS =====
  function next() {
    setQuestion(generateQuestion(level));
    setAnswer("");
    setIntro(true);
  }

  function handleCorrect() {
    setStreak((prev) => prev + 1);
    setXp((prev) => prev + 10);
    updateScore(xp + 10);

    if (streak + 1 >= 3) {
      setLevel((prev) => prev + 1);
      setStreak(0);
    }
    next();
  }

  function handleWrong() {
    setLives((prev) => prev - 1);
    setStreak(0);
    setXp((prev) => Math.max(prev - 5, 0));
    updateScore(Math.max(xp - 5, 0));

    if (lives - 1 <= 0) {
      setScreen("menu");
      setLives(3);
      setLevel(1);
      return;
    }

    if (level > 1) setLevel((prev) => prev - 1);
    next();
  }

  function check(ans) {
    if (ans == question.a) handleCorrect();
    else handleWrong();
  }

  // ===== SCREENS =====
  if (screen === "choice") {
    return (
      <div className="container">
        <h1>Math Game CEM 01</h1>
        <button className="btn" onClick={() => setScreen("login")}>
          Entrar
        </button>
        <button className="btn" onClick={() => setScreen("register")}>
          Criar Conta
        </button>
      </div>
    );
  }

  if (screen === "login") {
    return (
      <div className="container">
        <h2>Entrar</h2>
        <input
          placeholder="Nome"
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
        />
        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        <button className="btn" onClick={login}>
          Entrar
        </button>
        <button className="btn" onClick={() => setScreen("choice")}>
          Voltar
        </button>
        <p>{error}</p>
      </div>
    );
  }

  if (screen === "register") {
    return (
      <div className="container">
        <h2>Criar Conta</h2>
        <input
          placeholder="Nome"
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
        />
        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        <button className="btn" onClick={register}>
          Criar
        </button>
        <button className="btn" onClick={() => setScreen("choice")}>
          Voltar
        </button>
        <p>{error}</p>
      </div>
    );
  }

  if (screen === "menu") {
    return (
      <div className="container">
        <h1>🏠 Menu</h1>
        <h3>👤 {user}</h3>
        <h3>XP: {xp}</h3>
        <h3>Nível: {level}</h3>

        <h2>🏆 Ranking Local</h2>
        {ranking.map((r, i) => (
          <p key={i}>
            {i + 1}. {r.username} - {r.score}
          </p>
        ))}

        <h2>🌐 Ranking Global (Firestore)</h2>
        {globalRanking.map((r, i) => (
          <p key={i}>
            {i + 1}. {r.username} - {r.score}
          </p>
        ))}

        <button className="btn" onClick={() => setScreen("game")}>
          Jogar
        </button>
      </div>
    );
  }

  // ===== GAME SCREEN =====
  return (
    <div className="container">
      <h3>👤 {user}</h3>
      <h3>
        ❤️ {lives} | 🔥 {streak} | 📈 {level}
      </h3>

      {intro ? (
        <div className="intro">
          <h2>
            {question.type === "input" && "✍️ Digite"}
            {question.type === "vf" && "✅ V ou F"}
            {question.type === "mc" && "🎯 Escolha"}
          </h2>
          <p>{time}</p>
        </div>
      ) : (
        <>
          <h2>{question.q}</h2>
          <p>⏱️ {time}</p>

          {question.type === "input" && (
            <>
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <button className="btn" onClick={() => check(answer)}>
                OK
              </button>
            </>
          )}

          {question.type === "vf" && (
            <>
              <button className="btn" onClick={() => check("true")}>
                V
              </button>
              <button className="btn" onClick={() => check("false")}>
                F
              </button>
            </>
          )}

          {question.type === "mc" &&
            question.options.map((o, i) => (
              <button key={i} className="btn" onClick={() => check(String(o))}>
                {o}
              </button>
            ))}
        </>
      )}
    </div>
  );
}
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrCUOU644QApsrQ6MLmOtlEBmQ4-6LOCg",
  authDomain: "trabalho-da-escola-254e7.firebaseapp.com",
  projectId: "trabalho-da-escola-254e7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);