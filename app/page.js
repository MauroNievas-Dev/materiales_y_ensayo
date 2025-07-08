"use client"
import { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import questionsData from '../data/questions.json';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Mezclar y cargar un máximo de 10 preguntas
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrent(shuffled[0]);
  }, []);

  function handleAnswer(selected) {
    if (selected === current.ansower) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { ...current, selected }]);
    const nextIdx = questions.indexOf(current) + 1;
    if (nextIdx < questions.length) {
      setCurrent(questions[nextIdx]);
    } else {
      setFinished(true);
    }
  }

  if (!current && !finished) return <p>Cargando preguntas...</p>;

  return (
    <div className="container">
      <h1>Materiales y Ensayo</h1>
      {finished ? (
        <div className="results">
          <p>Terminaste! Puntaje: {score} / {questions.length}</p>
          <h2>Respuestas:</h2>
          <ul>
            {answers.map((q, i) => (
              <li key={i} style={{ marginBottom: '1rem' }}>
                <strong>{q.quest}</strong><br />
                Tu respuesta: {q[q.selected]} {q.selected === q.ansower ? '✅' : '❌'}<br />
                Respuesta correcta: {q[q.ansower]}
              </li>
            ))}
          </ul>
          <button onClick={() => window.location.reload()}>Jugar de nuevo</button>
        </div>
      ) : (
        <QuestionCard question={current} onAnswer={handleAnswer} />
      )}
    </div>
  );
}