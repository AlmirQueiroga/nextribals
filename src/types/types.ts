// src/types.ts
export interface Mapa {
    id: string;
    name: string;
    game_mode: string;
    is_competitve: boolean;
    full_name?: string;
    location?: string;
    images?: string[];
    stats?: HeroDict;
    posicao?: string[];
    sub_map?: submap[];
  }

  export type HeroDict = {
    heroes:{
      [key: HeroID]: HeroInMap;
    }
  }

  export type CounterGroups = {
    groupName: string;
    heroes: Heroi[];
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

  export type Teamups = {
    teamName: string;
    id:string;
    captain: HeroID;
    members: Heroi[];
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

  export type ClassType = {
     [id: string]: string 
  }

  export type ClassComp = {
    'Vanguard': number,
    'Duelist': number,
    'Strategist': number,
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
    Teamups = 'Teamups',
  }
  
  export interface CompList {
    herois: string[];
    tipo: string;
    mapa: Mapa;
    pontuacao:number;
    posicao?: string;
    submapa?: string;
    formacao?: string;
    sinergia?: number;
    eficacia?: number;
  }
  
  export interface AppContextType {
    herois: Heroi[];
    mapas: Mapa[];
    tipoJogo: string[];
    formacao: string[];
    counterGroups: CounterGroups[];
    teamups: Teamups[];
    comps: CompList[];
  }