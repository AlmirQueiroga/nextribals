import React, { useState, useContext } from 'react';
import { GameContext } from '../context/context';
import { Mapa } from '../types/types';

export const AddMapaForm: React.FC = () => {
  const { state, addMapa } = useContext(GameContext);
  const [id, setId] = useState('');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [posicao, setPosicao] = useState('');
  const [submapa, setSubmapa] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMapa: Mapa = {
      id,
      name: nome,
      game_mode: tipo,
      is_competitve: true
      // posicao: posicao ? posicao.split(',') : undefined,
      // submapa: submapa ? submapa.split(',') : undefined,
    };
    addMapa(newMapa);
    setNome('');
    setTipo('');
    setPosicao('');
    setSubmapa('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Id do Mapa"
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Nome do Mapa"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        required
      >
        <option value="">Selecione um tipo de jogo</option>
        {state.tipoJogo.map((tipo, index) => (
          <option key={index} value={tipo}>
            {tipo}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Posições (separadas por vírgula)"
        value={posicao}
        onChange={(e) => setPosicao(e.target.value)}
      />
      <input
        type="text"
        placeholder="Submapas (separados por vírgula)"
        value={submapa}
        onChange={(e) => setSubmapa(e.target.value)}
      />
      <button type="submit">Adicionar Mapa</button>
    </form>
  );
};