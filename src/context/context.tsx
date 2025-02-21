import React, { createContext, useState, ReactNode } from 'react';
import { AppContextType, Heroi, Mapa, WebGet } from '../types/types';
import axios from 'axios';

const defaultState: AppContextType = {
  herois: [],
  mapas: [],
  tipoJogo: [],
  formacao: [],
};

export const GameContext = createContext<{
  state: AppContextType;
  addHeroi: (heroi: Heroi) => void;
  editHeroi: (heroi: Heroi) => void;
  addMapa: (mapa: Mapa) => void;
  addTipoJogo: (tipo: string) => void;
  addFormacao: (formacao: string) => void;
  saveToJson: () => void;
  loadFromJson: () => void;
  loadFromWeb: (select : WebGet, query?: string) => void;
}>({
  state: defaultState,
  addHeroi: () => {},
  editHeroi: () => {},
  addMapa: () => {},
  addTipoJogo: () => {},
  addFormacao: () => {},
  saveToJson: () => {},
  loadFromJson: () => {},
  loadFromWeb: () => {}
});


export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppContextType>(defaultState);

  const addHeroi = (heroi: Heroi) => {
    setState((prevState) => ({
      ...prevState,
      herois: [...prevState.herois, heroi],
    }));
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
    setState((prevState) => ({
      ...prevState,
      mapas: [...prevState.mapas, mapa],
    }));
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
    setState((prevState) => ({
      ...prevState,
      tipoJogo: [...prevState.tipoJogo, tipo],
    }));
  };

  const addFormacao = (formacao: string) => {
    setState((prevState) => ({
      ...prevState,
      formacao: [...prevState.formacao, formacao],
    }));
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
        await axios.get(`${process.env.NEXT_PUBLIC_LOCAL}/heroes`).then(function (response) {
          if(response.data){
            setState((prevState) => ({
              ...prevState,
              herois: [],
            }));
            response.data.heroes.map((h: any) =>{
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
            })
          }
        }).catch((e) => {
          console.log("Erro ao pegar herois", e);
        });
        break;
      }
      case WebGet.Maps:{
        await axios.get(`${process.env.NEXT_PUBLIC_LOCAL}/maps`).then(function (response) {
          if(response.data){
            setState((prevState) => ({
              ...prevState,
              maps: [],
            }));
            response.data.maps.maps.map((m: any) =>{
              const { id, name, game_mode, full_name, location, images, sub_map } = m;
    
              const newMap: Mapa = {
                    id,
                    name,
                    game_mode,
                    full_name,
                    location,
                    images,
                    sub_map
                };
                
              if(!state.tipoJogo.includes(game_mode)){
                addTipoJogo(game_mode);
              }
              addMapa(newMap);
            })
          }
        }).catch((e) => {
          console.log("Erro ao pegar mapas", e);
        });
        break;
      }
      case WebGet.Comps:{
        await axios.get(`${process.env.NEXT_PUBLIC_LOCAL}/comps?heroId=${query}`,).then(function (response) {
          if(response.data){
            
            Object.keys(response.data.mapsWinHate).map((mW: any) =>{

              const edMap = state.mapas.find((m) => m.id == mW);

              if(edMap && query){
                edMap.heroes = {
                  [query]: response.data.mapsWinHate[mW]
                }
                editMapa(edMap);
              } else {
                console.log("Map not found");
              }

            })
          }
        }).catch((e) => {
          console.log("Erro ao pegar comps", e);
        });
        break;
      }

    }
  };

  return (
    <GameContext.Provider
      value={{
        state,
        addHeroi,
        editHeroi,
        addMapa,
        addTipoJogo,
        addFormacao,
        saveToJson,
        loadFromJson,
        loadFromWeb
      }}
    >
      {children}
    </GameContext.Provider>
  );
};