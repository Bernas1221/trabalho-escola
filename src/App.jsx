import { useState, useEffect } from "react";
import "./App.css";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

// GERAR QUESTÕES
function generateQuestion(level) {
  const a = Math.floor(Math.random()*20);
  const b = Math.floor(Math.random()*20);

  if (level === 1) {
    return { type:"input", q:`${a}+${b}`, a:String(a+b) };
  }

  if (level === 2) {
    const correct = a+b;
    const isTrue = Math.random() > 0.5;
    return {
      type:"vf",
      q:`${a}+${b}=${isTrue ? correct : correct+1}`,
      a: isTrue ? "true" : "false"
    };
  }

  return {
    type:"mc",
    q:`${a}+${b}`,
    options:[a+b, a+b+1, a+b-1, a+b+2].sort(()=>Math.random()-0.5),
    a:String(a+b)
  };
}

export default function App() {

  // 🔐 
  const [screen,setScreen] = useState("choice");
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [user,setUser] = useState(null);
  const [error,setError] = useState("");

  //  GAME
  const [level,setLevel] = useState(1);
  const [lives,setLives] = useState(3);
  const [streak,setStreak] = useState(0);
  const [question,setQuestion] = useState(generateQuestion(1));
  const [answer,setAnswer] = useState("");
  const [intro,setIntro] = useState(true);
  const [time,setTime] = useState(5);

  // 💾 CONTAS (local)
  function register(){
    if(!username || !password){
      setError("Preencha tudo");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find(u => u.username === username);
    if(exists){
      setError("Usuário já existe");
      return;
    }

    users.push({username,password,score:0});
    localStorage.setItem("users", JSON.stringify(users));

    setUser(username);
    setScreen("menu");
  }

  function login(){
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const found = users.find(
      u => u.username === username && u.password === password
    );

    if(!found){
      setError("Login inválido");
      return;
    }

    setUser(username);
    setScreen("menu");
  }

  // ⏱️ INTRO TIMER 
  useEffect(()=>{
    if(!intro) return;

    const timer = setInterval(()=>{
      setTime(prev=>{
        if(prev <= 1){
          clearInterval(timer);
          setIntro(false);
          return 5;
        }
        return prev - 1;
      });
    },1000);

    return ()=>clearInterval(timer);
  },[intro]);

  // ⏱️ GAME TIMER 
  useEffect(()=>{
    if(intro) return;

    const timer = setInterval(()=>{
      setTime(prev=>{
        if(prev <= 1){
          handleWrong();
          return 10;
        }
        return prev - 1;
      });
    },1000);

    return ()=>clearInterval(timer);
  },[intro]);

  function next(){
    setQuestion(generateQuestion(level));
    setAnswer("");
    setIntro(true);
  }

  function handleCorrect(){
    setStreak(prev=>prev+1);

    if(streak+1 >= 3){
      setLevel(prev=>prev+1);
      setStreak(0);
    }

    next();
  }

  function handleWrong(){
    setLives(prev=>prev-1);
    setStreak(0);

    if(lives-1 <= 0){
      setScreen("menu");
      setLives(3);
      return;
    }

    if(level > 1) setLevel(prev=>prev-1);

    next();
  }

  function check(ans){
    if(ans == question.a) handleCorrect();
    else handleWrong();
  }

  // ⌨️ ENTER
  useEffect(()=>{
    const key = (e)=>{
      if(e.key==="Enter" && question.type==="input"){
        check(answer);
      }
    };
    window.addEventListener("keydown",key);
    return ()=>window.removeEventListener("keydown",key);
  },[answer,question]);

  // 🔐 ESCOLHA
  if(screen==="choice"){
    return(
      <div className="container">
        <h1> Math Game CEM 01</h1>

        <button className="btn" onClick={()=>setScreen("login")}>
          Entrar
        </button>

        <button className="btn" onClick={()=>setScreen("register")}>
          Criar Conta
        </button>
      </div>
    );
  }

  // LOGIN
  if(screen==="login"){
    return(
      <div className="container">
        <h2>Entrar</h2>

        <input placeholder="Nome" onChange={e=>setUsername(e.target.value)}/>
        <input type="password" placeholder="Senha" onChange={e=>setPassword(e.target.value)}/>

        <button className="btn" onClick={login}>Entrar</button>
        <button className="btn" onClick={()=>setScreen("choice")}>Voltar</button>

        <p>{error}</p>
      </div>
    );
  }

  // REGISTER
  if(screen==="register"){
    return(
      <div className="container">
        <h2>Criar Conta</h2>

        <input placeholder="Nome" onChange={e=>setUsername(e.target.value)}/>
        <input type="password" placeholder="Senha" onChange={e=>setPassword(e.target.value)}/>

        <button className="btn" onClick={register}>Criar</button>
        <button className="btn" onClick={()=>setScreen("choice")}>Voltar</button>

        <p>{error}</p>
      </div>
    );
  }

  // MENU
  if(screen==="menu"){
    return(
      <div className="container">
        <h1>🏠 Menu</h1>
<h3>👤 {user}</h3>
<h3>XP: {xp}</h3>
<h3>Nível: {level}</h3>

<h2>🏆 Ranking</h2>

{ranking.map((r,i)=>(
  <p key={i}>{i+1}. {r.name} - {r.xp}</p>
))}
        <button className="btn" onClick={()=>setScreen("game")}>
          Jogar
        </button>
      </div>
    );
  }

  // GAME
  return(
    <div className="container">

      <h3>👤 {user}</h3>
      <h3>❤️ {lives} | 🔥 {streak} | 📈 {level}</h3>

      {intro ? (
        <div className="intro">
          <h2>
            {question.type==="input" && "✍️ Digite"}
            {question.type==="vf" && "✅ V ou F"}
            {question.type==="mc" && "🎯 Escolha"}
          </h2>
          <p>{time}</p>
        </div>
      ) : (
        <>
          <h2>{question.q}</h2>
          <p>⏱️ {time}</p>

<div className="overlay">
  <h1>🎉 Resultado</h1>

  <p>XP total: {xp}</p>
  <p>Streak: {streak}</p>
  <p>Nível: {level}</p>

  <button onClick={()=>setScreen("menu")}>
    Voltar ao menu
  </button>
</div>

{question.type==="input" && (
  <>
    <input value={answer} onChange={e=>setAnswer(e.target.value)}/>
    <button className="btn" onClick={()=>check(answer)}>OK</button>
  </>
)}

{question.type==="vf" && (
            <>
              <button className="btn" onClick={()=>check("true")}>V</button>
              <button className="btn" onClick={()=>check("false")}>F</button>
            </>
          )}

          {question.type==="mc" &&
            question.options.map((o,i)=>(
              <button key={i} className="btn" onClick={()=>check(String(o))}>
                {o}
              </button>
            ))
          }
        </>
      )}
    </div>
  );
}