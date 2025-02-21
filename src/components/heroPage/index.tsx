import React, { useState, useContext, useEffect, useRef } from 'react';
import { GameContext } from '../../context/context';
import { Heroi, Classe, Mapa } from '../../types/types';
import { SelectedItemsContainer, SelectedItem, RemoveButton, SelectMulti, FilterInput, AddButton, GameStatusTable } from './style';

interface AddHeroiFormProps {
  heroiToEdit?: Heroi;
  setHeroEdit?: React.Dispatch<React.SetStateAction<Heroi | undefined>>
}

export const AddHeroiForm: React.FC<AddHeroiFormProps> = ({ heroiToEdit, setHeroEdit }) => {
  const { state, addHeroi, editHeroi } = useContext(GameContext);

  const [isEditing, setIsEditing] = useState(!!heroiToEdit);
  const [editingMap, setEditingMap] = useState<number>(-1);
  
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [classe, setClasse] = useState<Classe>(Classe.Vanguard);
  const [counters, setCounters] = useState<Heroi[]>([]);
  const [countered, setCountered] = useState<Heroi[]>([]);
  const [counterFilter, setCounterFilter] = useState('');
  const [counteredFilter, setCounteredFilter] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [mapa, setMapa] = useState<Mapa>();
  const [sub, setSub] = useState<string>('');
  const [pos, setPos] = useState<string>('');
  const [aliados, setAliados] = useState<Heroi[]>([]);
  const [aliadosFilter, setAliadosFilter] = useState<string>('');
  const [inimigos, setInimigos] = useState<Heroi[]>([]);
  const [inimigosFilter, setInimigosFilter] = useState<string>('');

  const ref = useRef<HTMLInputElement>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHeroi: Heroi = {
      id,
      name,
      role: classe,
      ...(counters && { counters: counters }),
      ...(countered && { countered: countered }),
    };

    if(isEditing){
      editHeroi(newHeroi);
    } else {
      addHeroi(newHeroi);
    }
    resetForm();
  };

  const handleCancelEdit = () => {
    setHeroEdit && setHeroEdit(undefined);
    resetForm();
  }

  const resetForm = () => {
    setName('');
    setClasse(Classe.Vanguard);
    setCounters([]);
    setCountered([]);
    setCounterFilter('');
    setCounteredFilter('');
    resetMapsForm();
  };

  const resetMapsForm = () => {
    setTipo('')
    setPos('')
    setSub('')
    setAliados([]);
    setAliadosFilter('');
    setInimigos([]);
    setCounterFilter('');
  };


  const handleAddMaps = () => {
    // if(!tipo || !mapa || (!pos && !sub)) return

    // const gameStatus = {
    //   tipo: tipo,
    //   mapa: mapa,
    //   ...(pos && { posicao: pos }),
    //   ...(sub && { submapa: sub }),
    //   ...(aliados && { aliados: aliados }),
    //   ...(inimigos && { inimigos: inimigos }),
    // }

    // setMaps((prev) => (prev.concat(gameStatus)))

    // resetMapsForm();
  }

  const handleInimigosSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.name === option.value)!
    ).filter((heroi) => !counters.some((h) => h.name === heroi.name));
    
    setInimigos((prev) => (selectedOptions.concat(prev)));
  };

  const handleCounterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.name === option.value)!
    ).filter((heroi) => !countered.some((h) => h.name === heroi.name));
    
    setCounters((prev) => (selectedOptions.concat(prev)));
  };

  const handleCounteredSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.name === option.value)!
    ).filter((heroi) => !countered.some((h) => h.name === heroi.name));
    
    setCountered((prev) => (selectedOptions.concat(prev)));
  };

  const handleAllySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.name === option.value)!
    ).filter((heroi) => !aliados.some((h) => h.name === heroi.name));
    
    setAliados((prev) => (selectedOptions.concat(prev)));
  };

  // const handleEditMap = (index: number, mapEdit: Mapa) => {
  //   setEditingMap(index)

  //   setTipo(mapEdit.game_mode);
  //   setPos(mapEdit.posicao || '');
  //   setSub(mapEdit.sub_map || '');
  //   setAliados(mapEdit.heroes. || []);
  //   setInimigos(mapEdit.inimigos || []);
  // }

  const handleCancelEditMaps = (e: React.FormEvent) => {
    e.preventDefault();

    setEditingMap(-1);
    resetMapsForm();
  };

  const handleSubmitMapsEdit = (e: React.FormEvent) => {
    // e.preventDefault();

    // if(editingMap == -1) return
    // handleAddMaps();

    // const row = maps;
    // row.splice(editingMap, 1);
    // setEditingMap(-1);
    // setMaps(row);
  };

  const removeCounter = (heroi: Heroi) => {
    setCounters(counters.filter((h) => h.name !== heroi.name));
  };

  const removeCountered = (heroi: Heroi) => {
    setCountered(countered.filter((h) => h.name !== heroi.name));
  };

  const removeAlly = (heroi: Heroi) => {
    setAliados(aliados.filter((h) => h.name !== heroi.name));
  };

  const removeInimigo = (heroi: Heroi) => {
    setInimigos(inimigos.filter((h) => h.name !== heroi.name));
  };

  const filteredCounters = state.herois.filter((heroi) =>
    heroi.name.toLowerCase().includes(counterFilter.toLowerCase())
  );

  const filteredCountered = state.herois.filter((heroi) =>
    heroi.name.toLowerCase().includes(counteredFilter.toLowerCase())
  );

  const filteredAllys = state.herois.filter((heroi) =>
    heroi.name.toLowerCase().includes(aliadosFilter.toLowerCase())
  );

  const filteredInimigos = state.herois.filter((heroi) =>
    heroi.name.toLowerCase().includes(inimigosFilter.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Id:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            ref={ref}
            required
          />
        </label>
        <label>
          Nome:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Classe:
          <select
            value={classe}
            onChange={(e) => setClasse(e.target.value as Classe)}
            required
          >
            {Object.values(Classe).map((classeOption) => (
              <option key={classeOption} value={classeOption}>
                {classeOption}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div style={{minWidth: "20rem"}} >
          <h3>Counter de:</h3>
          <FilterInput
            type="text"
            value={counterFilter}
            onChange={(e) => setCounterFilter(e.target.value)}
            placeholder="Hero"
          />
          <SelectMulti
            multiple
            value={counters.map((counter) => counter.name)}
            onChange={handleCounterSelect}
          >
            {filteredCounters.map((heroi) => (
              <option key={heroi.name} value={heroi.name}>
                {heroi.name}
              </option>
            ))}
          </SelectMulti>
          <SelectedItemsContainer>
            {counters.map((heroi) => (
              <SelectedItem key={heroi.name}>
                {heroi.name}
                <RemoveButton type="button" onClick={() => removeCounter(heroi)}>
                  X
                </RemoveButton>
              </SelectedItem>
            ))}
          </SelectedItemsContainer>
        </div>
        <div style={{minWidth: "20rem"}}>
          <h3>Counterado por:</h3>
          <FilterInput
            type="text"
            value={counteredFilter}
            onChange={(e) => setCounteredFilter(e.target.value)}
            placeholder="Hero"
          />
          <SelectMulti
            multiple
            value={countered.map((counter) => counter.name)}
            onChange={handleCounteredSelect}
          >
            {filteredCountered.map((heroi) => (
              <option key={heroi.name} value={heroi.name}>
                {heroi.name}
              </option>
            ))}
          </SelectMulti>
          <SelectedItemsContainer>
            {countered.map((heroi) => (
              <SelectedItem key={heroi.name}>
                {heroi.name}
                <RemoveButton type="button" onClick={() => removeCountered(heroi)}>
                  X
                </RemoveButton>
              </SelectedItem>
            ))}
          </SelectedItemsContainer>
        </div>
      </div>
      <div>
          <h3>Mapas</h3>
          {state.mapas && state.mapas.map((gm, i) => (
            gm.is_competitve &&
            <>
              <p>{gm.name}</p>
              <GameStatusTable>
                <thead> 
                  <tr>
                    <th>{id ? `${id}` : ''}  {name ? `-${name}` : ''}</th>
                    {state.herois.map((hero) => (
                      <th>{hero.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Como aliado</th>
                    {state.herois.map((hero) => (
                      gm.stats && gm.stats.heroes[id] ?
                      <td>{(gm.stats.heroes[id].aliados[hero.id].partidas*100)/gm.stats.heroes[id].aliados[hero.id].partidas}%</td>
                      :
                      <td> --- </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Como Inimigo</th>
                    {state.herois.map((hero) => (
                      gm.stats && gm.stats.heroes[id] ?
                      <td>{(gm.stats.heroes[id].inimigos[hero.id].partidas*100)/gm.stats.heroes[id].inimigos[hero.id].partidas}%</td>
                      :
                      <td> --- </td>
                    ))}
                  </tr>
                </tbody>
              </GameStatusTable>
            </>
          ))}
          <select
            value={tipo}
            onChange={(e) => {setTipo(e.target.value); setPos(''); setSub('');}}
            style={{ margin:"1rem 1rem 1rem 8rem"}}
          >
            <option value="">Selecione um tipo de jogo</option>
            {state.tipoJogo.map((tipo, index) => (
              <option key={index} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {tipo &&
            <select
              value={mapa?.name}
              onChange={(e) => setMapa(state.mapas.find((mapa) => mapa.name == e.target.value))}
              style={{ margin:"1rem 1rem 1rem 1rem"}}
              required
            >
              <option value="">Selecione um mapa</option>
              {state.mapas.filter((mapa) => mapa.game_mode == tipo).map((mapa, index) => (
                <option key={index} value={mapa.name}>
                  {mapa.name}
                </option>
              ))}
            </select>
          }
          {mapa &&
            <>
              {
                mapa.game_mode == "Domination" ?
                (
                  <select
                    value={sub}
                    onChange={(e) => setSub(e.target.value)}
                    style={{ margin:"1rem 1rem 1rem 1rem"}}
                    required
                  >
                    <option value="">Selecione um submapa</option>
                    {mapa.sub_map && 
                      mapa.sub_map.map((sub, index) => (
                        sub.name &&<option key={index} value={sub.id}>
                          {sub.name}
                        </option>                      
                    ))}
                  </select>
                )
                :
                (
                  <select
                    value={pos}
                    onChange={(e) => setPos(e.target.value)}
                    style={{ margin:"1rem 1rem 1rem 1rem"}}
                    required
                  >
                    <option value="">Selecione uma posição</option>
                    {mapa.posicao && 
                      mapa.posicao.map((pos, index) => (
                        <option key={index} value={pos}>
                          {pos}
                        </option>
                    ))}
                  </select>
                )
              }
            </>
          }
          <div style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
            <div style={{minWidth: "20rem"}}>
              <h5>Aliados</h5>
              <FilterInput
                type="text"
                value={aliadosFilter}
                onChange={(e) => setAliadosFilter(e.target.value)}
                placeholder="Hero"
              />
              <SelectMulti
                multiple
                value={aliados.map((ali) => ali.name)}
                onChange={handleAllySelect}
              >
                {filteredAllys.map((heroi) => (
                  <option key={heroi.name} value={heroi.name}>
                    {heroi.name}
                  </option>
                ))}
              </SelectMulti>
              <SelectedItemsContainer>
                {aliados.map((heroi) => (
                  <SelectedItem key={heroi.name}>
                    {heroi.name}
                    <RemoveButton type="button" onClick={() => removeAlly(heroi)}>
                      X
                    </RemoveButton>
                  </SelectedItem>
                ))}
              </SelectedItemsContainer>
            </div>
          
            <div style={{minWidth: "20rem"}}>
              <h5>Inimigos</h5>
              <FilterInput
                type="text"
                value={inimigosFilter}
                onChange={(e) => setInimigosFilter(e.target.value)}
                placeholder="Hero"
              />
              <SelectMulti
                multiple
                value={inimigos.map((ali) => ali.name)}
                onChange={handleInimigosSelect}
              >
                {filteredInimigos.map((heroi) => (
                  <option key={heroi.name} value={heroi.name}>
                    {heroi.name}
                  </option>
                ))}
              </SelectMulti>
              <SelectedItemsContainer>
                {inimigos.map((heroi) => (
                  <SelectedItem key={heroi.name}>
                    {heroi.name}
                    <RemoveButton type="button" onClick={() => removeInimigo(heroi)}>
                      X
                    </RemoveButton>
                  </SelectedItem>
                ))}
              </SelectedItemsContainer>
            </div>
          </div>
          {editingMap == -1 ?
            (
              <AddButton type="button" onClick={() => handleAddMaps()}>
                +
              </AddButton>
            ) :
            (
              <>
                <AddButton type="button" onClick={(e) => handleSubmitMapsEdit(e)}>
                  ✔
                </AddButton>
                <AddButton type="button" onClick={(e) => handleCancelEditMaps(e)}>
                  X
                </AddButton>
              </>
            )
          }
          
          
      </div>
      {heroiToEdit ? (
        <>  
          <button style={{ margin:"5rem 5rem 5rem 5rem", background:'#1fff'}} type="submit">Editar Herói</button>
          <button style={{ margin:"5rem 5rem 5rem 5rem", background:'#f11f'}} onClick={() => {handleCancelEdit()}}>Cancelar edição</button>
        </>
      ) : (
        <button style={{ margin:"5rem 5rem 5rem 5rem", background:'#1fff'}} type="submit">Adicionar Herói</button>
      )}
      
    </form>
  );
};