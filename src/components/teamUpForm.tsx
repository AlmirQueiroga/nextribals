import React, { useState, useContext } from 'react';
import { GameContext } from '../context/context';
import { Heroi, Teamups } from '../types/types';
import { FilterInput, SelectMulti, SelectedItemsContainer, SelectedItem, RemoveButton, AddButton, PillContainer, Divider } from '@/styles';


export const TeamUpForm: React.FC = () => {
  const { state, addTeamup, editTeamup } = useContext(GameContext);
  
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [captain, setCaptain] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [members, setMembers] = useState<Heroi[]>([]);
  const [membersFilter, setMembersFilter] = useState('');

  const handleMemberselect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => state.herois.find((h) => h.name === option.value)!
    ).filter((heroi) => !members.some((h) => h.name === heroi.name));
    
    setMembers((prev) => (selectedOptions.concat(prev)));
  };

  const removeCounter = (heroi: Heroi) => {
    setMembers(members.filter((h) => h.name !== heroi.name));
  };

  const filteredMembers = state.herois.filter((heroi) =>
    heroi.name.toLowerCase().includes(membersFilter.toLowerCase())
  );

  const resetForm = () =>{
    setEditing(false);
    setName('');
    setId('');
    setCaptain('');
    setMembersFilter('');
    setMembers([]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if(!name || (state.teamups.some((tu) => tu.teamName == name) && !editing)) return;

    if(editing){
      editTeamup({
          teamName: name,
          members,
          captain,
          id: id ? id : "00"
      })
    } else {
      addTeamup({
        teamName: name,
          members,
          captain,
          id: id ? id : "00"
      })
    }

    resetForm()
  }

  const editGroup = (tu:Teamups) => {
    setEditing(true);
    setName(tu.teamName);
    setMembers(tu.members);
    setCaptain(tu.captain);
    setId(tu.id);
  }

  return (
    <>
        <form onSubmit={handleSubmit}>
            
            <div>
                <label>
                    {editing  ? "Editando " : "Nome do "}
                    time:
                <input
                    type="text"
                    value={name}
                    disabled={editing}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                </label>
            </div>
            <div>
                <label>
                    id:
                <input
                    type="text"
                    value={id}
                    disabled={editing}
                    onChange={(e) => setId(e.target.value)}
                />
                </label>
            </div>
            <div>
                    <label>
                      Capitão:
                      <select
                        value={captain}
                        onChange={(e) => setCaptain(e.target.value)}
                        required
                      >
                        {state.herois.map((hero) => (
                          <option key={hero.id} value={hero.id}>
                            {hero.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
                <div style={{minWidth: "20rem"}} >
                <h3>Membros:</h3>
                <FilterInput
                    type="text"
                    value={membersFilter}
                    onChange={(e) => setMembersFilter(e.target.value)}
                    placeholder="Hero"
                />
                <SelectMulti
                    multiple
                    value={members.map((heroi) => heroi.name)}
                    onChange={handleMemberselect}
                >
                    {filteredMembers.map((heroi) => (
                    <option key={heroi.name} value={heroi.name}>
                        {heroi.name}
                    </option>
                    ))}
                </SelectMulti>
                <SelectedItemsContainer>
                    {members.map((heroi) => (
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
          {state.teamups.map((team) => (
              <PillContainer onClick={() => {editGroup(team)}}>
                  {team.teamName}
              </PillContainer>
          ))}
        </div>
    </>
  );
};