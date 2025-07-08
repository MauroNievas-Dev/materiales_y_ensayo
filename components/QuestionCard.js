"use client"
import { useState, useEffect } from 'react';

export default function QuestionCard({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (selected) onAnswer(selected);
  }

  useEffect(() => {
    function handleKeyPress(e) {
      const keyMap = {
        '1': 'a',
        '2': 'b',
        '3': 'c',
        '4': 'd'
      };
      if (keyMap[e.key]) {
        setSelected(keyMap[e.key]);
      } else if (e.key === 'Enter') {
        if (selected) onAnswer(selected);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selected, onAnswer]);

  return (
    <div className="card">
      <h2>{question.quest}</h2>
      <form onSubmit={handleSubmit}>
        {['a','b','c','d'].map((opt, index) => (
          <label key={opt} className="option">
            <input
              type="radio"
              name="answer"
              value={opt}
              checked={selected === opt}
              onChange={() => setSelected(opt)}
            />
            <span>{`   ${index + 1}   . ${question[opt]}`}</span>
          </label>
        ))}
        <button type="submit" disabled={!selected}>Enviar</button>
      </form>
    </div>
  );
}