import React, { useContext } from 'react';
import { GameContext } from '../context/context';
import { Heroi } from '../types/types';

interface HeroiListProps {
  onEdit: (heroi: Heroi) => void;
  loadComps: (heroi: Heroi) => void;
}

export const HeroiList: React.FC<HeroiListProps> = ({ onEdit, loadComps }) => {
  const { state } = useContext(GameContext);

  return (
    <div>
      <h2>Heróis</h2>
      <ul>
        {state.herois.map((heroi, index) => (
          <li style={{ margin:"1rem 1rem 1rem 1rem"}} key={index}>{heroi.name} - {heroi.role} <button onClick={() => onEdit(heroi)} >editar</button> <button onClick={() => loadComps(heroi)} >carregar comps</button> </li>
        ))}
      </ul>
    </div>
  );
};