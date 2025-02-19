import React, { useState, useContext } from 'react';
import { GameContext } from '../context/context';

export const AddGameModeForm: React.FC = () => {
  const { addTipoJogo } = useContext(GameContext);
  const [tipo, setTipo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipo.trim()) {
      addTipoJogo(tipo);
      setTipo('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Novo Tipo de Jogo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        required
      />
      <button type="submit">Adicionar Tipo de Jogo</button>
    </form>
  );
};