import { useEffect, useState } from 'react'
import type { AppView } from '../types'

const TOOL_HASH = '#tool'

export function useHashView() {
  const [view, setView] = useState<AppView>(() => getViewFromHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => {
      setView(getViewFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function goToLanding() {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    setView('landing')
  }

  function goToTool() {
    window.location.hash = TOOL_HASH
  }

  return {
    goToLanding,
    goToTool,
    view,
  }
}

function getViewFromHash(hash: string): AppView {
  return hash === TOOL_HASH ? 'tool' : 'landing'
}
