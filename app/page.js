"use client"
import { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import questionsData from '../data/questions.json';
import Image from 'next/image'


export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const shuffled = [...questionsData].sort(()=>0.5-Math.random()).slice(0,10);
    setQuestions(shuffled);
    setCurrent(shuffled[0]);
  }, []);

  function handleAnswer(selected) {
    if (selected === current.ansower) setScore(s=>s+1);
    setAnswers(prev=>[...prev,{...current, selected}]);
    const nextIdx = questions.indexOf(current)+1;
    nextIdx<questions.length ? setCurrent(questions[nextIdx]) : setFinished(true);
  }

  if (!current && !finished) return <p>Cargando preguntas...</p>;

  return (
    <div className="container">
      <h1>Materiales y Ensayos</h1>
      {finished ? (
        <div className="results">
          <p>Terminaste! Puntaje: {score} / {questions.length}</p>
          <h2>Respuestas detalladas:</h2>
          <ul>
            {answers.map((q,i)=>(
              <li key={i} className="review">
                <strong>{q.quest}</strong><br/>
                <br/>
                <b>Tu respuesta</b>: {q[q.selected]} {q.selected===q.ansower?'✅':'❌'}<br/><br/>
                <b>Respuesta correcta</b>: {q[q.ansower]}<br/><br/>
               
                {q.img && <Image src={q.img} 
                  width={500}
                  height={500}
                alt="Referencia PDF" className="ref-img" />}
                 <em>{q.text}</em><br/>
                <small>{q.ref}</small> {"      "} {q.link &&  <a href={q.link}>RECURSO</a>}<br/>
              </li>
            ))}
          </ul>
          <button onClick={()=>window.location.reload()}>Jugar de nuevo</button>
        </div>
      ) : (
        <QuestionCard question={current} onAnswer={handleAnswer} />
      )}
    </div>
  );
}