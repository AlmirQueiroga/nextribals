// src/types.ts
export interface Mapa {
    id: string;
    name: string;
    game_mode: string;
    full_name?: string;
    location?: string;
    images?: string[];
    heroes?:{
        [key: HeroID]: HeroInMap;
    }
    posicao?: string[];
    sub_map?: submap[];
  }

  type submap = {
    id: string;
    name?: string;
  }

  export type HeroID = string; 

  export type Percentage = {
    partidas: number;
    vitorias: number;
  };

  export type Relacao = {
    [key: HeroID]: Percentage
  };

  export type HeroInMap = {
    general: Percentage
    aliados: Relacao;
    inimigos: Relacao;
  };
  
  export interface Heroi {
    id: HeroID;
    name: string;
    imageUrl?: string;
    role: Classe;
    attack_type?: string;
    team?: string[];
    difficulty?: number;
    playersGrade?: number[];
    counters?: Heroi[];
    countered?: Heroi[];
  }

  export enum Classe {
    Vanguard = 'Vanguard',
    Duelist = 'Duelist',
    Strategist = 'Strategist',
  }

  export enum WebGet {
    Heroes = 'Heroes',
    Maps = 'Maps',
    Comps = 'Comps',
  }
  
  export interface CompList {
    herois: Heroi[];
    tipo: string;
    mapa: Mapa;
    posicao?: string;
    submapa?: string;
    formacao?: string;
    sinergia: number;
    eficacia: number;
  }
  
  export interface AppContextType {
    herois: Heroi[];
    mapas: Mapa[];
    tipoJogo: string[];
    formacao: string[];
  }