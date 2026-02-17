import { ReactNode } from 'react'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return <div className={`animate-fadeInUp ${className}`}>{children}</div>
}
