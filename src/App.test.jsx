import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock fetch
global.fetch = vi.fn()

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('renders the application header', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<App />)
    expect(screen.getByText(/Trial Logs/i)).toBeInTheDocument()
    // Use getAllByText or a more specific role/selector to avoid ambiguity
    expect(screen.getByRole('button', { name: /Bloodpoints/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Trial Stats/i })).toBeInTheDocument()
  })

  it('switches between Bloodpoints and Trial Stats views', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })

    render(<App />)
    
    // Default view is Bloodpoints
    expect(screen.getByText(/Bloodpoint Analysis/i)).toBeInTheDocument()
    
    // Switch to Stats view
    const statsBtn = screen.getByRole('button', { name: /Trial Stats/i })
    fireEvent.click(statsBtn)
    
    expect(screen.getByText(/Performance Metrics/i)).toBeInTheDocument()
    expect(screen.getByText(/Avg Kills\/Match/i)).toBeInTheDocument()
  })

  it('shows loading state initially', async () => {
    fetch.mockReturnValue(new Promise(() => {})) // Never resolves
    render(<App />)
    expect(screen.getByText(/Connecting to the fog/i)).toBeInTheDocument()
  })

  it('displays matches fetched from API', async () => {
    const mockMatches = [
      { id: '1', character: 'The Trapper', bloodpoints: 25000, role: 'killer', isEvent: false, timestamp: new Date().toISOString() }
    ]
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatches,
    })

    render(<App />)
    const characterCell = await screen.findByText(/The Trapper/i)
    expect(characterCell).toBeInTheDocument()
    const bpElements = screen.getAllByText(/25,000/i)
    expect(bpElements.length).toBeGreaterThanOrEqual(1)
    
    // Check for role in the table
    const roles = screen.getAllByText(/killer/i)
    expect(roles.some(el => el.tagName === 'SPAN')).toBe(true)
  })

  it('submits a new match and updates history', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial fetch
    
    const newMatch = { id: '2', character: 'Meg Thomas', bloodpoints: 32000, role: 'survivor', isEvent: true, timestamp: new Date().toISOString() }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newMatch,
    })

    render(<App />)
    
    const survivorBtn = screen.getByRole('button', { name: /^Survivor$/i })
    const charInput = screen.getByPlaceholderText(/E.G. DWIGHT FAIRFIELD/i)
    const bpInput = screen.getByPlaceholderText(/000,000/i)
    const eventToggle = screen.getByText(/10th Anniversary Event Trial/i)
    const submitBtn = screen.getByText(/Submit to Entity/i)

    fireEvent.click(survivorBtn)
    fireEvent.change(charInput, { target: { value: 'Meg Thomas' } })
    fireEvent.change(bpInput, { target: { value: '32000' } })
    fireEvent.click(eventToggle)
    fireEvent.click(submitBtn)

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/matches'), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ character: 'Meg Thomas', bloodpoints: 32000, role: 'survivor', isEvent: true, escaped: false })
    }))

    const newCharCell = await screen.findByText(/Meg Thomas/i)
    expect(newCharCell).toBeInTheDocument()
    expect(screen.getByText(/^EVENT$/)).toBeInTheDocument()
    expect(screen.getByText(/Sacrificed/i)).toBeInTheDocument()
  })

  it('submits a killer match with kills', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial fetch
    
    const newMatch = { id: '3', character: 'The Huntress', bloodpoints: 28000, role: 'killer', isEvent: false, kills: 3, timestamp: new Date().toISOString() }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newMatch,
    })

    render(<App />)
    
    const killerBtn = screen.getByRole('button', { name: /^Killer$/i })
    fireEvent.click(killerBtn)

    const charInput = screen.getByPlaceholderText(/E.G. THE TRAPPER/i)
    const bpInput = screen.getByPlaceholderText(/000,000/i)
    const submitBtn = screen.getByText(/Submit to Entity/i)

    fireEvent.change(charInput, { target: { value: 'The Huntress' } })
    fireEvent.change(bpInput, { target: { value: '28000' } })
    
    // Select 3 kills
    const killBtn = screen.getByRole('button', { name: /^3$/ })
    fireEvent.click(killBtn)

    fireEvent.click(submitBtn)

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/matches'), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ character: 'The Huntress', bloodpoints: 28000, role: 'killer', isEvent: false, kills: 3 })
    }))

    const newCharCell = await screen.findByText(/The Huntress/i)
    expect(newCharCell).toBeInTheDocument()
    expect(screen.getByText(/3 Kills/i)).toBeInTheDocument()
  })

  it('deletes a match and updates history', async () => {
    const mockMatches = [
      { id: '123', character: 'Wraith', bloodpoints: 15000, role: 'killer', isEvent: false, timestamp: new Date().toISOString() }
    ]
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatches,
    })

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Deleted' })
    })

    render(<App />)
    
    const charCell = await screen.findByText(/Wraith/i)
    expect(charCell).toBeInTheDocument()

    const deleteBtn = screen.getByText(/Discard/i)
    fireEvent.click(deleteBtn)

    expect(confirmSpy).toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/matches/123'), expect.objectContaining({
      method: 'DELETE'
    }))

    await vi.waitFor(() => {
      expect(screen.queryByText(/Wraith/i)).not.toBeInTheDocument()
    })

    confirmSpy.mockRestore()
  })
})
