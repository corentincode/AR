"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import FallbackView from "@/app/fallback"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AR application error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <FallbackView />
    }

    return this.props.children
  }
}

export default ErrorBoundary

