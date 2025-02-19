import React, { useState, useContext } from 'react';
import { GameContext } from '../context/context';

export const AddFormacaoForm: React.FC = () => {
  const { addFormacao } = useContext(GameContext);
  const [tanks, setTanks] = useState(0);
  const [dps, setDps] = useState(0);
  const [sup, setSup] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se a soma dos valores é menor ou igual a 6
    if (tanks + dps + sup <= 6) {
      const formacao = `${tanks} - ${dps} - ${sup}`;
      addFormacao(formacao);
      // Reseta os campos após adicionar
      setTanks(0);
      setDps(0);
      setSup(0);
    } else {
      alert('A soma de Tanks, DPS e Suportes não pode ser maior que 6.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          N.º Tanks:
          <input
            type="number"
            min="0"
            max="6"
            value={tanks}
            onChange={(e) => setTanks(parseInt(e.target.value, 10))}
            required
          />
        </label>
      </div>
      <div>
        <label>
          N.º DPS:
          <input
            type="number"
            min="0"
            max="6"
            value={dps}
            onChange={(e) => setDps(parseInt(e.target.value, 10))}
            required
          />
        </label>
      </div>
      <div>
        <label>
          N.º Suportes:
          <input
            type="number"
            min="0"
            max="6"
            value={sup}
            onChange={(e) => setSup(parseInt(e.target.value, 10))}
            required
          />
        </label>
      </div>
      <button type="submit">Adicionar Formação</button>
    </form>
  );
};