import { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, query, orderBy } from "firebase/firestore";

// GERAR QUESTÕES
function generateQuestion(level) {
  const a = Math.floor(Math.random() * 20);
  const b = Math.floor(Math.random() * 20);

  if (level === 1) return { type: "input", q: `${a}+${b}`, a: String(a + b) };

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
  const [screen, setScreen] = useState("choice");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // GAME
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(generateQuestion(1));
  const [answer, setAnswer] = useState("");
  const [intro, setIntro] = useState(true);
  const [time, setTime] = useState(7);

  // XP e ranking
  const [xp, setXp] = useState(0);
  const [ranking, setRanking] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  // ===== LOGIN / REGISTER =====
  async function register() {
    if (!username || !password) {
      setError("Preencha tudo");
      return;
    }
    const userRef = doc(db, "users", username);
    try {
      await setDoc(userRef, { password, score: 0 });
      setUser(username);
      setXp(0);
      setScreen("menu");
      updateRanking();
    } catch (e) {
      setError("Erro ao criar usuário");
      console.error(e);
    }
  }

  async function login() {
    if (!username || !password) {
      setError("Preencha tudo");
      return;
    }
    try {
      const userRef = doc(db, "users", username);
      const userSnap = await getDocs(collection(db, "users"));
      const userDoc = userSnap.docs.find((d) => d.id === username);

      if (!userDoc) {
        setError("Usuário não existe");
        return;
      }
      const data = userDoc.data();
      if (data.password !== password) {
        setError("Senha inválida");
        return;
      }
      setUser(username);
      setXp(data.score || 0);
      setScreen("menu");
      updateRanking();
    } catch (e) {
      console.error(e);
      setError("Erro no login");
    }
  }

  // ===== UPDATE RANKING =====
  async function updateRanking() {
    const q = query(collection(db, "users"), orderBy("score", "desc"));
    const querySnap = await getDocs(q);
    const usersList = querySnap.docs.map((d) => ({ username: d.id, ...d.data() }));
    setRanking(usersList);
  }

  // ===== GAME TIMERS =====
  useEffect(() => {
    if (!intro) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIntro(false);
          setTime(7); // reset tempo resposta
          return 7;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intro]);

  useEffect(() => {
    if (intro) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          check(""); // simula resposta vazia
          return 7;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [intro, question]);

  // ===== ENTER =====
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Enter" && question.type === "input") check(answer);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [answer, question]);

  // ===== PROXIMA PERGUNTA =====
  function next() {
    setQuestion(generateQuestion(level));
    setAnswer("");
    setIntro(true);
    setTime(7);
  }

  async function handleCorrect() {
    setStreak((prev) => prev + 1);
    const newXP = xp + 10;
    setXp(newXP);

    const userRef = doc(db, "users", user);
    await setDoc(userRef, { password: password, score: newXP });

    if (streak + 1 >= 3) {
      setLevel((prev) => prev + 1);
      setStreak(0);
    }

    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 2000);

    next();
    updateRanking();
  }

  async function handleWrong() {
    setLives((prev) => prev - 1);
    setStreak(0);
    const newXP = Math.max(xp - 5, 0);
    setXp(newXP);

    const userRef = doc(db, "users", user);
    await setDoc(userRef, { password: password, score: newXP });

    if (lives - 1 <= 0) {
      setScreen("menu");
      setLives(3);
      updateRanking();
      return;
    }

    if (level > 1) setLevel((prev) => prev - 1);

    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 2000);

    next();
    updateRanking();
  }

  function check(ans) {
    if (ans == question.a) handleCorrect();
    else handleWrong();
  }

  // ===== RENDER =====
  if (screen === "choice")
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

  if (screen === "login")
    return (
      <div className="container">
        <h2>Entrar</h2>
        <input placeholder="Nome" onChange={(e) => setUsername(e.target.value)} />
        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setPassword(e.target.value)}
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

  if (screen === "register")
    return (
      <div className="container">
        <h2>Criar Conta</h2>
        <input placeholder="Nome" onChange={(e) => setUsername(e.target.value)} />
        <input
          type="password"
          placeholder="Senha"
          onChange={(e) => setPassword(e.target.value)}
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

  if (screen === "menu")
    return (
      <div className="container">
        <h1>🏠 Menu</h1>
        <h3>👤 {user}</h3>
        <h3>XP: {xp}</h3>
        <h3>Nível: {level}</h3>

        <h2>🏆 Ranking</h2>
        {ranking.length > 0
          ? ranking.map((r, i) => (
              <p key={i}>
                {i + 1}. {r.username} - {r.score}
              </p>
            ))
          : <p>Nenhum jogador ainda</p>}

        <button className="btn" onClick={() => { next(); setScreen("game"); }}>
          Jogar
        </button>
      </div>
    );

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

          {showOverlay && (
            <div className="overlay">
              <h1>🎉 Resultado</h1>
              <p>XP total: {xp}</p>
              <p>Streak: {streak}</p>
              <p>Nível: {level}</p>
            </div>
          )}

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