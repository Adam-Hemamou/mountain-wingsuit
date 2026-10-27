import { useState } from 'react';
import { Header } from './components/Header';
import { AutoPanel, BetPanel, HistoryPanel, PortraitCard } from './components/Panels';
import { RulesDialog } from './components/RulesDialog';
import { Scene } from './components/Scene';
import { useGame } from './game/useGame';
import { useBreakpoint } from './hooks/useBreakpoint';

export default function App() {
  const { state, dispatch, jump } = useGame();
  const bp = useBreakpoint();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="app">
      <Header
        balance={state.balance}
        canReset={state.phase !== 'FLYING'}
        onRules={() => setRulesOpen(true)}
        onResetBalance={() => dispatch({ type: 'RESET_BALANCE' })}
      />
      <Scene
        state={state}
        bp={bp}
        onJump={jump}
        onCashOut={() => dispatch({ type: 'CASH_OUT' })}
        onStopAuto={() => dispatch({ type: 'SET_AUTO_PLAY', value: false })}
        onFairness={() => setRulesOpen(true)}
      />
      <section className="dashboard" aria-label="Tableau de bord">
        <BetPanel state={state} dispatch={dispatch} />
        <AutoPanel state={state} dispatch={dispatch} />
        <HistoryPanel history={state.history} />
        <PortraitCard />
      </section>
      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
