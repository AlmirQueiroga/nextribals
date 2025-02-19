import React, { useContext } from 'react';
import { GameContext } from '../context/context';

export const ContextDisplay: React.FC = () => {
  const { state } = useContext(GameContext);

  return (
    <div>
      <h2>Estado do Contexto</h2>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};