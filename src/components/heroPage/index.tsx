import React, { useState, useContext, useEffect, useRef } from 'react';
import { GameContext } from '../../context/context';
import { Heroi, Classe, Mapa, Relacao, Percentage } from '../../types/types';
import { SelectedItemsContainer, SelectedItem, RemoveButton, SelectMulti, FilterInput, AddButton, GameStatusTable, SelectedRelacItem, Divider } from './style';
import { calcularPorcentagemVitoria } from '@/utils';

interface AddHeroiFormProps {
  heroiToEdit?: Heroi | undefined;
  setHeroEdit?: React.Dispatch<React.SetStateAction<Heroi | undefined>>
}

export const AddHeroiForm: React.FC<AddHeroiFormProps> = ({ heroiToEdit, setHeroEdit }) => {
  const { state, addHeroi, editHeroi, editMapa } = useContext(GameContext);
  
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [classe, setClasse] = useState<Classe>(Classe.Vanguard);
  const [counters, setCounters] = useState<Heroi[]>([]);
  const [countered, setCountered] = useState<Heroi[]>([]);
  const [counterFilter, setCounterFilter] = useState('');
  const [counteredFilter, setCounteredFilter] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [mapa, setMapa] = useState<Mapa>();
  const [mapsAddInfo, setMapsAddInfo] = useState<Mapa[]>([]);
  const [sub, setSub] = useState<string>('');
  const [pos, setPos] = useState<string>('');
  const [aliados, setAliados] = useState<Relacao>({});
  const [aliadosSelected, setAliadosSelected] = useState<Heroi[]>([]);
  const [aliadosFilter, setAliadosFilter] = useState<string>('');
  const [inimigos, setInimigos] = useState<Relacao>({});
  const [inimigosSelected, setInimigosSelected] = useState<Heroi[]>([]);
  const [inimigosFilter, setInimigosFilter] = useState<string>('');

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() =>{
    if(heroiToEdit){
      setName(heroiToEdit.name);
      setId(heroiToEdit.id);
      setClasse(heroiToEdit.role);
      setCounters(heroiToEdit.counters || [])
      setCountered(heroiToEdit.countered || [])
    }
  },[heroiToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHeroi: Heroi = {
      id,
      name,
      role: classe,
      ...(counters && { counters: counters }),
      ...(countered && { countered: countered }),
    };

    if(heroiToEdit){
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
    setAliados({});
    setAliadosFilter('');
    setInimigos({});
    setCounterFilter('');
  };


  const handleAddMaps = () => {
    if(!tipo || !mapa ) return

    const newMap: Mapa = {
      ...mapa,
      stats:{
        heroes:{
          [id]: {
            general:{
              partidas: 0,
              vitorias:0
            },
            aliados,
            inimigos
          }
        }
      }
      // ...(aliados && { aliados: aliados }),
      // ...(inimigos && { inimigos: inimigos }),
    }

    setMapsAddInfo((prev) => (prev.concat(newMap)));

    resetMapsForm();
  }

  const handleInimigosSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.id == option.value)!
    ).filter((heroi) => !inimigosSelected.some((h) => h.id == heroi.id));
    
    let inimigosMult = inimigosSelected.concat(selectedOptions);

    setInimigosSelected(inimigosMult);

    let inimigosRel :Percentage = {
      partidas: 0,
      vitorias: 0
    }

    selectedOptions.map((her) => {
        if(mapa && mapa.stats && mapa.stats.heroes[id] && mapa.stats.heroes[id].inimigos[her.id]){
          inimigosRel.partidas = mapa.stats.heroes[id].inimigos[her.id].partidas
          inimigosRel.vitorias = mapa.stats.heroes[id].inimigos[her.id].vitorias
        }

        setInimigos((prev) => ({...prev, [her.id]: inimigosRel}))
      }
    )
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
      (option) => state.herois.find((h) => h.id == option.value)!
    ).filter((heroi) => !aliadosSelected.some((h) => h.id == heroi.id));
    
    let aliadosMult = aliadosSelected.concat(selectedOptions);

    setAliadosSelected(aliadosMult);

    let aliadosRel :Percentage = {
      partidas: 0,
      vitorias: 0
    }

    selectedOptions.map((her) => {
        if(mapa && mapa.stats && mapa.stats.heroes[id] && mapa.stats.heroes[id].aliados[her.id]){
          aliadosRel.partidas = mapa.stats.heroes[id].aliados[her.id].partidas
          aliadosRel.vitorias = mapa.stats.heroes[id].aliados[her.id].vitorias
        }

        setAliados((prev) => ({...prev, [her.id]: aliadosRel}))
      }
    )
  };

  // const handleEditMap = (index: number, mapEdit: Mapa) => {
  //   setEditingMap(index)

  //   setTipo(mapEdit.game_mode);
  //   setPos(mapEdit.posicao || '');
  //   setSub(mapEdit.sub_map || '');
  //   setAliados(mapEdit.heroes. || []);
  //   setInimigos(mapEdit.inimigos || []);
  // }

  const removeCounter = (heroi: Heroi) => {
    setCounters(counters.filter((h) => h.name !== heroi.name));
  };

  const removeCountered = (heroi: Heroi) => {
    setCountered(countered.filter((h) => h.name !== heroi.name));
  };

  const removeAlly = (heroid: string) => {

    setAliadosSelected(aliadosSelected.filter((h) => h.id !== heroid));
  
    let aliadosAux = {...aliados}
    delete aliadosAux[heroid]
    setAliados(aliadosAux);
  };

  const removeInimigo = (heroid: string) => {
    setInimigosSelected(inimigosSelected.filter((h) => h.id !== heroid));

    let inimigosAux = {...inimigos}
    delete inimigosAux[heroid]
    setInimigos(inimigosAux);
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let findExist = state.herois.find((h) => h.id == e.target.value)
    if(findExist){
      setHeroEdit && setHeroEdit(findExist)
    }

    setId(e.target.value)
  }

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
            onChange={handleIdChange}
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
                      (gm.stats && gm.stats.heroes[id] && gm.stats.heroes[id].aliados[hero.id]) ?
                      <td>{calcularPorcentagemVitoria(gm.stats.heroes[id].aliados[hero.id]).toFixed(2)}%</td>
                      :
                      <td> --- </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Como Inimigo</th>
                    {state.herois.map((hero) => (
                      (gm.stats && gm.stats.heroes[id] && gm.stats.heroes[id].inimigos[hero.id]) ?
                      <td>{calcularPorcentagemVitoria(gm.stats.heroes[id].inimigos[hero.id]).toFixed(2)}%</td>
                      :
                      <td> --- </td>
                    ))}
                  </tr>
                </tbody>
              </GameStatusTable>
            </>
          ))}
          <Divider/>
          {mapsAddInfo.length > 0 && mapsAddInfo.map((gm, i) => (
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
                      (gm.stats && gm.stats.heroes[id] && gm.stats.heroes[id].aliados[hero.id]) ?
                      <td>{calcularPorcentagemVitoria(gm.stats.heroes[id].aliados[hero.id]).toFixed(2)}%</td>
                      :
                      <td> --- </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Como Inimigo</th>
                    {state.herois.map((hero) => (
                      (gm.stats && gm.stats.heroes[id] && gm.stats.heroes[id].inimigos[hero.id]) ?
                      <td>{calcularPorcentagemVitoria(gm.stats.heroes[id].inimigos[hero.id]).toFixed(2)}%</td>
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
              {state.mapas.filter((mapa) => (mapa.game_mode == tipo && !mapsAddInfo.includes(mapa))).map((mapa, index) => (
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
                value={aliadosSelected.map((ali) => ali.name)}
                onChange={handleAllySelect}
              >
                {filteredAllys.map((heroi) => (
                  <option key={heroi.id} value={heroi.id}>
                    {heroi.name}
                    {mapa && mapa.stats && mapa.stats.heroes[id] &&  mapa.stats.heroes[id].aliados[heroi.id].partidas > 0 &&
                      <p>✔</p>
                    }
                  </option>
                ))}
              </SelectMulti>
              <SelectedItemsContainer>
                {aliadosSelected.map((heroi) => (
                  <SelectedRelacItem key={heroi.id}>
                    <div>
                      <RemoveButton type="button" onClick={() => removeAlly(heroi.id)}>
                        X
                      </RemoveButton>
                      <p>{heroi.name}</p>
                    </div>
                    <div className='inputs'>
                      <input
                        type="number"
                        value={aliados[heroi.id].partidas}
                        onChange={(e) => setAliados((prev) => ({...prev, [heroi.id]: {...aliados[heroi.id], partidas: parseInt(e.target.value) }}))}
                        placeholder='Partidas'
                        required
                      />
                      <input
                        type="number"
                        value={aliados[heroi.id].vitorias}
                        onChange={(e) => setAliados((prev) => ({...prev, [heroi.id]: {...aliados[heroi.id], vitorias: parseInt(e.target.value) }}))}
                        placeholder='Vitórias'
                        required
                      />
                    </div>
                  </SelectedRelacItem>
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
                value={inimigosSelected.map((ali) => ali.name)}
                onChange={handleInimigosSelect}
              >
                {filteredInimigos.map((heroi) => (
                  <option key={heroi.id} value={heroi.id}>
                    {heroi.name}
                    {mapa && mapa.stats && mapa.stats.heroes[id] &&  mapa.stats.heroes[id].inimigos[heroi.id].partidas > 0 &&
                      <p>✔</p>
                    }
                  </option>
                ))}
              </SelectMulti>
              <SelectedItemsContainer>
                {inimigosSelected.map((heroi) => (
                  <SelectedItem key={heroi.name}>
                    <div>
                    <RemoveButton type="button" onClick={() => removeInimigo(heroi.id)}>
                      X
                    </RemoveButton>
                    <p>{heroi.name}</p>
                    </div>
                    <div className='inputs'>
                      <input
                        type="number"
                        value={inimigos[heroi.id].partidas}
                        onChange={(e) => setInimigos((prev) => ({...prev, [heroi.id]: {...inimigos[heroi.id], partidas: parseInt(e.target.value) }}))}
                        placeholder='Partidas'
                        required
                      />
                      <input
                        type="number"
                        value={inimigos[heroi.id].vitorias}
                        onChange={(e) => setInimigos((prev) => ({...prev, [heroi.id]: {...inimigos[heroi.id], vitorias: parseInt(e.target.value) }}))}
                        placeholder='Vitórias'
                        required
                      />
                    </div>
                  </SelectedItem>
                ))}
              </SelectedItemsContainer>
            </div>
          </div>
          <AddButton type="button" onClick={handleAddMaps}>
                +
          </AddButton>

          {/* {state.herois.find((h) => h.id == id) && 
            <>
              <AddButton type="button" onClick={handleSubmitMaps}>
                ✔
              </AddButton>
              <AddButton type="button" onClick={resetMapsForm}>
                X
              </AddButton>
            </>
          } */}
          
      </div>
       
          <button style={{ margin:"5rem 5rem 5rem 5rem", background:'#1fff'}} type="submit">{heroiToEdit ? "Editar Herói" : "Adicionar Herói"}</button>
          {heroiToEdit && <button style={{ margin:"5rem 5rem 5rem 5rem", background:'#f11f'}} onClick={() => {handleCancelEdit()}}>Cancelar edição</button>}
        
      
    </form>
  );
};