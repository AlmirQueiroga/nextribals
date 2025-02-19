export interface Hero {
    id: string;
    name: string;
    imageUrl: string;
    role: string;
    attack_type?: string;
    team: string[];
    difficulty: number;
    playersGrade?: number[];
}

type HeroID = string; 

type Relacao = {
  [key: HeroID]: string;
};

type HeroInMap = {
  aliados: Relacao;
  inimigos: Relacao;
};

export interface Map {
    id: string;
    sub_map: {
        id: string;
        name: string;
    }
    name: string;
    full_name: string;
    location: string;
    game_mode: string;
    images: string[];
    heroes?:{
        [key: HeroID]: HeroInMap;
    }
}

