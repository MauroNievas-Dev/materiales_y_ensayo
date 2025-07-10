"use client"
import { useState, useEffect } from 'react';
import QuestionCard from '../components/QuestionCard';
import Image from 'next/image';

// Import all JSON files under /data using webpack require.context
const context = require.context('../data', true, /\.json$/);
const modules = {};
context.keys().forEach(key => {
  const mod = context(key);
  modules[key] = mod.default || mod;
});

// Helper to format folder/file names into display names
function formatName(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Build subjects -> topics -> questions map
const subjectsData = {};
for (const rawPath in modules) {
  // rawPath e.g. './materiales_y_ensayos/control_de_calidad_y_normalizacion.json'
  const cleaned = rawPath.replace(/^\.\//, '');
  const parts = cleaned.split('/');
  if (parts.length < 2) {
    // Skip files not inside a subject folder
    continue;
  }
  const subjectKey = parts[0];
  const fileName = parts[1];
  const topicKey = fileName.replace(/\.json$/, '');
  const subjectName = formatName(subjectKey);
  const topicName = formatName(topicKey);
  const data = modules[rawPath];
  if (!subjectsData[subjectName]) subjectsData[subjectName] = {};
  subjectsData[subjectName][topicName] = data;
}

export default function Home() {
  const [step, setStep] = useState('config'); // 'config', 'quiz', 'finished'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topicCounts, setTopicCounts] = useState({});
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  const subjectNames = Object.keys(subjectsData);

  // Load selected subject from localStorage on mount
  useEffect(() => {
    const savedSubject = localStorage.getItem('selectedSubject');
    if (savedSubject) setSelectedSubject(savedSubject);
  }, []);

  // Initialize counts when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const stored = localStorage.getItem(`counts-${selectedSubject}`);
      if (stored) {
        setTopicCounts(JSON.parse(stored));
      } else {
        const topics = Object.keys(subjectsData[selectedSubject]);
        const init = {};
        topics.forEach(t => { init[t] = 0; });
        setTopicCounts(init);
      }
      localStorage.setItem('selectedSubject', selectedSubject);
    }
  }, [selectedSubject]);

  // Persist topic counts
  useEffect(() => {
    if (selectedSubject) {
      localStorage.setItem(`counts-${selectedSubject}`, JSON.stringify(topicCounts));
    }
  }, [topicCounts, selectedSubject]);

  function handleCountChange(topic, value) {
    setTopicCounts(prev => ({ ...prev, [topic]: Number(value) }));
  }

  function startQuiz(e) {
    e.preventDefault();
    const selected = [];
    Object.entries(topicCounts).forEach(([topic, count]) => {
      const pool = subjectsData[selectedSubject][topic];
      const slice = [...pool]
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(q => ({ ...q, topic }));
      selected.push(...slice);
    });
    const shuffled = selected.sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    setCurrent(shuffled[0] || null);
    setStep('quiz');
  }

  function handleAnswer(selected) {
    if (selected === current.answer) setScore(s => s + 1);
    setAnswers(prev => [...prev, { ...current, selected }]);
    console.log(JSON.stringify(answers,null,2));
    const idx = questions.indexOf(current) + 1;
    if (idx < questions.length) {
      setCurrent(questions[idx]);
    } else {
      setStep('finished');
    }
  }

  // Configuration step
  if (step === 'config') {
    return (
      <div className="containerCustom">
        <h1>Configurar Quiz</h1>
        <form onSubmit={startQuiz}>
          <div className="option">
            <label>Materia:</label>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="">-- Elige una materia --</option>
              {subjectNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          {selectedSubject && Object.keys(subjectsData[selectedSubject]).map(topic => (
            <div key={topic} className="option">
              <label>{topic}:</label>
              <input
                type="number"
                min="0"
                max={subjectsData[selectedSubject][topic].length}
                value={topicCounts[topic] || 0}
                onChange={e => handleCountChange(topic, e.target.value)}
              />
              <span> de {subjectsData[selectedSubject][topic].length}</span>
            </div>
          ))}
          <button type="submit" disabled={
            !selectedSubject || Object.values(topicCounts).every(v => v === 0)
          }>
            Comenzar Quiz
          </button>
        </form>
      </div>
    );
  }

  // Quiz step
  if (step === 'quiz') {
    return (
      <div className="container">
        <h1>{selectedSubject}</h1>
        {current && <h2>{current.topic}</h2>}
        {current
          ? <QuestionCard question={current} onAnswer={handleAnswer} />
          : <p>Cargando preguntas...</p>
        }
      </div>
    );
  }

  // Finished step
  return (
    <div className="container results">
      <h1>{selectedSubject}</h1>
      <p>Terminaste! Puntaje: {score} / {questions.length}</p>
      <h2>Respuestas detalladas:</h2>
      <ul>
        {answers.map((q, i) => (
          <li key={i} className="review">
            <strong>{q.quest}</strong><br/>
            <em>{q.topic}</em><br/><br/>
            <b>Tu respuesta</b>: {q[q.selected]} {q.selected === q.answer ? '✅' : '❌'}<br/><br/>
            <b>Respuesta correcta</b>: {q[q.answer]}<br/><br/>
            {q.img && <Image src={q.img} width={500} height={500} alt="Referencia PDF" className="ref-img" />}<br/>
            <em>{q.text}</em><br/>
            <small>{q.ref}</small> {q.link && <a href={q.link}>RECURSO</a>}
          </li>
        ))}
      </ul>
      <button onClick={() => window.location.reload()}>Jugar de nuevo</button>
    </div>
  );
}
