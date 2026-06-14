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
    expect(screen.getByText(/Match History Tracker/i)).toBeInTheDocument()
  })

  it('shows loading state initially', async () => {
    fetch.mockReturnValue(new Promise(() => {})) // Never resolves
    render(<App />)
    expect(screen.getByText(/Connecting to the fog/i)).toBeInTheDocument()
  })

  it('displays matches fetched from API', async () => {
    const mockMatches = [
      { id: '1', character: 'The Trapper', bloodpoints: 25000, timestamp: new Date().toISOString() }
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
  })

  it('submits a new match and updates history', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial fetch
    
    const newMatch = { id: '2', character: 'Meg Thomas', bloodpoints: 32000, timestamp: new Date().toISOString() }
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newMatch,
    })

    render(<App />)
    
    const charInput = screen.getByPlaceholderText(/The Trapper, Meg Thomas, etc./i)
    const bpInput = screen.getByPlaceholderText(/Amount Earned.../i)
    const submitBtn = screen.getByText(/Add to History/i)

    fireEvent.change(charInput, { target: { value: 'Meg Thomas' } })
    fireEvent.change(bpInput, { target: { value: '32000' } })
    fireEvent.click(submitBtn)

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/matches'), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ character: 'Meg Thomas', bloodpoints: 32000 })
    }))

    const newCharCell = await screen.findByText(/Meg Thomas/i)
    expect(newCharCell).toBeInTheDocument()
  })

  it('deletes a match and updates history', async () => {
    const mockMatches = [
      { id: '123', character: 'Wraith', bloodpoints: 15000, timestamp: new Date().toISOString() }
    ]
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMatches,
    })

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    fetch.mockResolvedValueOnce({
      ok: true,
    })

    render(<App />)
    
    const charCell = await screen.findByText(/Wraith/i)
    expect(charCell).toBeInTheDocument()

    const deleteBtn = screen.getByText(/Delete/i)
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
