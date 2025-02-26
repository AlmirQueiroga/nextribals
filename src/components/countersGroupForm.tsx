import React, { useState, useContext, useRef } from 'react';
import { GameContext } from '../context/context';
import { Heroi, CounterGroups } from '../types/types';
import { FilterInput, SelectMulti, SelectedItemsContainer, SelectedItem, RemoveButton, AddButton, PillContainer, Divider } from '@/styles';


export const CountersGroupForm: React.FC = () => {
  const { state, addCounterGroup, editCounterGroup } = useContext(GameContext);
  
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [counters, setCounters] = useState<Heroi[]>([]);
  const [counterFilter, setCounterFilter] = useState('');

  const handleCounterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.name === option.value)!
    ).filter((heroi) => !counters.some((h) => h.name === heroi.name));
    
    setCounters((prev) => (selectedOptions.concat(prev)));
  };

  const removeCounter = (heroi: Heroi) => {
    setCounters(counters.filter((h) => h.name !== heroi.name));
  };

  const filteredCounters = state.herois.filter((heroi) =>
    heroi.name.toLowerCase().includes(counterFilter.toLowerCase())
  );

  const resetForm = () =>{
    setEditing(false);
    setName('');
    setCounterFilter('');
    setCounters([]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!name || (state.counterGroups.some((cg) => cg.groupName == name) && !editing)) return;

    if(editing){
      editCounterGroup({
        groupName: name,
        heroes: counters
    })
    } else {
      addCounterGroup({
          groupName: name,
          heroes: counters
      })
    }

    resetForm()
  }

  const editGroup = (gr:CounterGroups) => {
    setEditing(true);
    setName(gr.groupName);
    setCounters(gr.heroes);
  }

  return (
    <>
        <form onSubmit={handleSubmit}>
            
            <div>
              <label>
                  {editing  ? "Editando " : "Nome do "}
                  grupo:
              <input
                  type="text"
                  value={name}
                  disabled={editing}
                  onChange={(e) => setName(e.target.value)}
                  required
              />
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
            </div>
            <AddButton type="submit">
                ✔
            </AddButton>
            <AddButton type="button" onClick={resetForm}>
                X
            </AddButton>
                   
        </form>
        <Divider/>
        <div style={{ display: 'flex', flexDirection: 'row', overflowX: 'scroll', gap: '1rem'}}>
          {state.counterGroups.map((group) => (
            <PillContainer onClick={() => {editGroup(group)}}>
              {group.groupName}
            </PillContainer>
          ))}
        </div>
    </>
  );
};