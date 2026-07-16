import { LandingPage } from './components/LandingPage'
import { ToolWorkspace } from './components/ToolWorkspace'
import { useHashView } from './hooks/useHashView'

function App() {
  const { goToLanding, goToTool, view } = useHashView()

  return view === 'tool'
    ? <ToolWorkspace onBack={goToLanding} />
    : <LandingPage onEnterTool={goToTool} />
}

export default App
