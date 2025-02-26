import React, { createContext, useState, ReactNode } from 'react';
import { AppContextType, CompList, CounterGroups, Heroi, Mapa, Teamups, WebGet } from '../types/types';
import axios from 'axios';
import { MapsDict } from '@/types/apiTypes';

const defaultState: AppContextType = {
  herois: [],
  mapas: [],
  tipoJogo: [],
  formacao: [],
  counterGroups: [],
  teamups: [],
  comps: []
};

export const GameContext = createContext<{
  state: AppContextType;
  addHeroi: (heroi: Heroi) => void;
  editHeroi: (heroi: Heroi) => void;
  addMapa: (mapa: Mapa) => void;
  editMapa: (mapa: Mapa) => void;
  addTipoJogo: (tipo: string) => void;
  addFormacao: (formacao: string) => void;
  addCounterGroup: (group: CounterGroups) => void;
  editCounterGroup: (group: CounterGroups) => void;
  addTeamup: (team: Teamups) => void;
  editTeamup: (team: Teamups) => void;
  calcTeams:(mapa: Mapa, numeroDeHeroisNoTime: number) => void;
  addComps:(comp: CompList) => void;
  saveToJson: () => void;
  loadFromJson: () => void;
  loadFromWeb: (select : WebGet, query?: string) => void;
  loadAllPercentages: () => void;
  
}>({
  state: defaultState,
  addHeroi: () => {},
  editHeroi: () => {},
  addMapa: () => {},
  editMapa: () => {},
  addTipoJogo: () => {},
  addFormacao: () => {},
  addCounterGroup: () => {},
  editCounterGroup: () => {},
  addTeamup: () => {},
  editTeamup: () => {},
  calcTeams:() => {},
  addComps:() => {},
  saveToJson: () => {},
  loadFromJson: () => {},
  loadFromWeb: () => {},
  loadAllPercentages: () => {},
});


export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppContextType>(defaultState);

  const addHeroi = (heroi: Heroi) => {
    setState((prevState) => {
      const heroiExiste = prevState.herois.some((e) => e.name === heroi.name && e.id === heroi.id);
      if (!heroiExiste) {
        return {
          ...prevState,
          herois: [...prevState.herois, heroi],
        };
      }

      return prevState;
    });
  };

  const editHeroi = (updatedHeroi: Heroi) => {
    setState((prevState) => ({
      ...prevState,
      herois: prevState.herois.map((heroi) =>
        heroi.id === updatedHeroi.id ? updatedHeroi : heroi
      ),
    }));
  };

  const addMapa = (mapa: Mapa) => {
    setState((prevState) => {
      const mapaExiste = prevState.mapas.some((e) => e.name === mapa.name && e.id === mapa.id);
      if (!mapaExiste) {
        return {
          ...prevState,
          mapas: [...prevState.mapas, mapa],
        };
      }

      return prevState;
    });
  };

  const editMapa = (updatedMapa: Mapa) => {
    setState((prevState) => ({
      ...prevState,
      mapas: prevState.mapas.map((mapa) =>
        mapa.id === updatedMapa.id ? updatedMapa : mapa
      ),
    }));
  };

  const addTipoJogo = (tipo: string) => {
    setState((prevState) => {
      const tipoExiste = prevState.tipoJogo.includes(tipo);
      if (!tipoExiste) {
        return {
          ...prevState,
          tipoJogo: [...prevState.tipoJogo, tipo],
        };
      }

      return prevState;
    });
  };

  const addFormacao = (formacao: string) => {
    setState((prevState) => {
      const formExiste = prevState.tipoJogo.includes(formacao);
      if (!formExiste) {
        return {
          ...prevState,
          formacao: [...prevState.formacao, formacao],
        };
      }

      return prevState;
    });
  };

  const addCounterGroup = (group: CounterGroups) => {
    setState((prevState) => {
      const formExiste = prevState.counterGroups.includes(group);
      if (!formExiste) {
        return {
          ...prevState,
          counterGroups: [...prevState.counterGroups, group],
        };
      }

      return prevState;
    });
  };

  const editCounterGroup = (group: CounterGroups) => {
    setState((prevState) => ({
      ...prevState,
      counterGroups: prevState.counterGroups.map((gr) =>
        gr.groupName === group.groupName ? group : gr
      ),
    }));
  };

  const addTeamup = (team: Teamups) => {
    setState((prevState) => {
      const formExiste = prevState.teamups.includes(team);
      if (!formExiste) {
        return {
          ...prevState,
          teamups: [...prevState.teamups, team],
        };
      }

      return prevState;
    });
  };

  const editTeamup = (team: Teamups) => {
    setState((prevState) => ({
      ...prevState,
      teamups: prevState.teamups.map((t) =>
        t.teamName === team.teamName ? team : t
      ),
    }));
  };

  const addComps = (comp: CompList) => {
    setState((prevState) => {
      const formExiste = prevState.comps.includes(comp);
      if (!formExiste) {
        return {
          ...prevState,
          comps: [...prevState.comps, comp],
        };
      }

      return prevState;
    });
  };

  const saveToJson = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'game-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadFromJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const loadedState = JSON.parse(content) as Partial<AppContextType>;
          setState((prev) => ({...prev, ...loadedState}));
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const loadFromWeb = async (select: WebGet, query?: string) => {
    switch(select){
      case WebGet.Heroes: {
        await axios.get<{heroes: Heroi[]}>(`${process.env.NEXT_PUBLIC_LOCAL}/heroes`).then((response) => {
          if(response.data && response.data.heroes){
            for(const h of response.data.heroes){
              const { id, name, imageUrl, role, attack_type, team, difficulty } = h;
    
              const newHeroi: Heroi = {
                    id,
                    name,
                    imageUrl,
                    role,
                    attack_type,
                    team,
                    difficulty
                };
    
              addHeroi(newHeroi);
            }
          }
        }).catch((e) => {
          console.log("Erro ao pegar herois", e);
        });
        break;
      }
      case WebGet.Maps:{
        await axios.get<{maps: Mapa[]}>(`${process.env.NEXT_PUBLIC_LOCAL}/maps`).then(function (response) {
          if(response.data && response.data.maps){
            for( const m of response.data.maps){
              const { id, name, game_mode, is_competitve ,full_name, location, images, sub_map } = m;
    
              const newMap: Mapa = {
                    id,
                    name,
                    game_mode,
                    is_competitve,
                    full_name,
                    location,
                    images,
                    sub_map,
                };
              
              if(newMap.is_competitve) addTipoJogo(game_mode);

              addMapa(newMap);
            }
          }
        }).catch((e) => {
          console.log("Erro ao pegar mapas", e);
        });
        break;
      }
      case WebGet.Comps:{

          const mapsMap = await axios.get<{mapsWinHate: MapsDict}>(`${process.env.NEXT_PUBLIC_LOCAL}/comps?heroId=${query}`,)
          if(mapsMap.data && mapsMap.data.mapsWinHate){
            
            for(const mW of Object.keys(mapsMap.data.mapsWinHate)){

              const edMap = state.mapas.find((m) => m.id == mW);
              
              if(edMap && query){
                if(!edMap.stats) edMap.stats = {heroes: {}}
                edMap.stats.heroes[query] = mapsMap.data.mapsWinHate[mW].heroes[query]
                editMapa(edMap);
              } else {
                console.log("Map not found");
              }

            }
          }
        
        break;
      }
      case WebGet.Teamups: {
        break;
      }

    }
  };

  const loadAllPercentages = () => {
    let allHeroes = state.herois;
    Promise.all(allHeroes.map( heroi => axios.get<{mapsWinHate: MapsDict}>(`${process.env.NEXT_PUBLIC_LOCAL}/comps?heroId=${heroi.id}`))).then((results) => {
      for( const [index, heroi] of allHeroes.entries()){
        if(results[index].data && results[index].data.mapsWinHate){
              
          for(const mW of Object.keys(results[index].data.mapsWinHate)){
  
            const edMap = state.mapas.find((m) => m.id == mW);
            
            if(edMap){
              if(!edMap.stats) edMap.stats = {heroes: {}}
              edMap.stats.heroes[heroi.id] = results[index].data.mapsWinHate[mW].heroes[heroi.id];
              editMapa(edMap);
            } else {
              console.log("Map not found");
            }
  
          }
        }
      }
    }).catch((e) => {
      console.log("Promise all erro maps");
    })
  }

  const calcTeams = async (mapa: Mapa, numeroDeHeroisNoTime: number) => {
    const response = await fetch('/api/teamsCalc', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mapa, numeroDeHeroisNoTime }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    if (reader) {
      while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const partes = buffer.split('\n');
          for (const parte of partes.slice(0, -1)) {
              try {
                  const resultado: CompList = JSON.parse(parte);
                  console.log('Dado recebido:', resultado);
                  addComps(resultado);
                  // setComps((prevComps) => [...prevComps, resultado]);
              } catch (error) {
                  console.error('Erro ao processar dados:', error);
              }
          }
          buffer = partes[partes.length - 1];
      }
    }
  }

  return (
    <GameContext.Provider
      value={{
        state,
        addHeroi,
        editHeroi,
        addMapa,
        editMapa,
        addTipoJogo,
        addFormacao,
        addCounterGroup,
        editCounterGroup,
        addTeamup,
        editTeamup,
        calcTeams,
        addComps,
        saveToJson,
        loadFromJson,
        loadFromWeb,
        loadAllPercentages
      }}
    >
      {children}
    </GameContext.Provider>
  );
};