import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import QuestionCard from '../components/QuestionCard'

describe('QuestionCard', () => {
  it('calls onAnswer when selecting option via keyboard', () => {
    const question = {
      quest: '¿Capital de Francia?',
      a: 'París',
      b: 'Londres',
      c: 'Berlín',
      d: 'Roma'
    }
    const onAnswer = jest.fn()
    render(<QuestionCard question={question} onAnswer={onAnswer} />)
    fireEvent.keyDown(window, { key: '1' })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onAnswer).toHaveBeenCalledWith('a')
  })
})
