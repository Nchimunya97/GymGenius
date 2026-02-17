import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardHeader } from '@/components/DashboardHeader'
import type { User as FirebaseUser } from '@repo/shared'

describe('DashboardHeader Component', () => {
  const mockProfile: FirebaseUser = {
    uid: 'user123',
    email: 'user@example.com',
    displayName: 'John Athlete',
    role: 'trainee',
    createdAt: Date.now(),
  }

  it('should display welcome message with user name', () => {
    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    expect(screen.getByText(/Welcome back, John Athlete!/)).toBeInTheDocument()
  })

  it('should display "Athlete" as default name when displayName is not provided', () => {
    const profileWithoutName: FirebaseUser = {
      ...mockProfile,
      displayName: '',
    }

    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={profileWithoutName} onLogOut={handleLogOut} />)

    expect(screen.getByText(/Welcome back, Athlete!/)).toBeInTheDocument()
  })

  it('should apply Amber-500 color theme to welcome heading', () => {
    const handleLogOut = vi.fn()

    const { container } = render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    const heading = screen.getByText(/Welcome back, John Athlete!/)
    // Check that the heading has the amber-500 class
    expect(heading).toHaveClass('text-amber-500')
  })

  it('should display trainee message for trainee role', () => {
    const traineeProfile: FirebaseUser = {
      ...mockProfile,
      role: 'trainee',
    }

    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={traineeProfile} onLogOut={handleLogOut} />)

    expect(
      screen.getByText('Track your workouts and progress your fitness journey')
    ).toBeInTheDocument()
  })

  it('should display trainer message for trainer role', () => {
    const trainerProfile: FirebaseUser = {
      ...mockProfile,
      role: 'trainer',
    }

    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={trainerProfile} onLogOut={handleLogOut} />)

    expect(
      screen.getByText('Manage your clients and build their training programs')
    ).toBeInTheDocument()
  })

  it('should render three action buttons', () => {
    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    expect(screen.getByLabelText('Start workout')).toBeInTheDocument()
    expect(screen.getByLabelText('View history')).toBeInTheDocument()
    expect(screen.getByLabelText('Check progress')).toBeInTheDocument()
  })

  it('should have correct button styling', () => {
    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    const startButton = screen.getByLabelText('Start workout')
    const historyButton = screen.getByLabelText('View history')
    const progressButton = screen.getByLabelText('Check progress')

    // Check button styling
    expect(startButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white')
    expect(historyButton).toHaveClass('bg-purple-600', 'hover:bg-purple-700', 'text-white')
    expect(progressButton).toHaveClass('bg-green-600', 'hover:bg-green-700', 'text-white')
  })

  it('should have Amber-500 border with proper styling', () => {
    const handleLogOut = vi.fn()

    const { container } = render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    const card = container.querySelector('.border-amber-500')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('bg-gradient-to-r', 'from-amber-500/10', 'to-orange-500/10')
  })

  it('should render emoji in heading', () => {
    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    const heading = screen.getByText(/Welcome back, John Athlete!/)
    expect(heading.textContent).toContain('🎯')
  })

  it('should handle profile with undefined displayName', () => {
    const profileWithUndefined: FirebaseUser = {
      ...mockProfile,
      displayName: undefined,
    }

    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={profileWithUndefined} onLogOut={handleLogOut} />)

    expect(screen.getByText(/Welcome back, Athlete!/)).toBeInTheDocument()
  })

  it('should have responsive grid layout', () => {
    const handleLogOut = vi.fn()

    const { container } = render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    const grid = container.querySelector('.grid-cols-1.md\\:grid-cols-3')
    expect(grid).toBeInTheDocument()
  })

  it('should render all buttons with correct text content', () => {
    const handleLogOut = vi.fn()

    render(<DashboardHeader profile={mockProfile} onLogOut={handleLogOut} />)

    expect(screen.getByText('Start Workout')).toBeInTheDocument()
    expect(screen.getByText('View History')).toBeInTheDocument()
    expect(screen.getByText('Check Progress')).toBeInTheDocument()
  })
})
