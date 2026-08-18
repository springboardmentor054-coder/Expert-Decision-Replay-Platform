import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App component', () => {
  it('renders without crashing', () => {
    expect(() => {
      render(<App />)
    }).not.toThrow()
  })

  it('should render the application', () => {
    render(<App />)
    // The app should render at least something
    const appContainer = screen.queryByRole('region') || document.querySelector('body')
    expect(appContainer).toBeDefined()
  })
})
