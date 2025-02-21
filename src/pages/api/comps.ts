import { HeroID, HeroInMap, Relacao } from "@/types/types";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  mapsWinHate?: Maps;
  erro?: string;
};

type Maps = {
    [mapId : string]:  {
        heroes:{
                [key: HeroID]: HeroInMap;
        }
    };
  };

type TopPlayers = {
    data: {
        players: Player[];
    }
}

type Player ={
    player_uid: string;
}

type PlayerHistoryProfile = {
    data: Match[];
    
}

type Match = {
    match_map_id: string;
    match_uid: string;
    match_player: MatchPlayer;
    game_mode_id: number;
}

type MatchPlayer = {
    is_win: boolean;
}

type FullMatch = {
    data:{
        match_uid: string;
        match_players: FullMatchPlayer[]
    }
}

type FullMatchPlayer ={
    player_uid: string;
    is_win: boolean;
    player_heroes: PlayerHero[]
}

type PlayerHero = {
    hero_id: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  
  switch(req.method){
    case 'GET': {
        let hid = req.query.heroId as string
        const lb: TopPlayers = await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/hero-leaderboard/${hid}?device=1`, {})
        if(lb.data && lb.data.players.length > 0){
            const allMaps = await insideHeroLeaderboard(lb, hid);
            res.status(200).json({ mapsWinHate: allMaps });
        } else {
            res.status(400).json({ erro: "erro no data" });
        }
        break;
    }
    default: {
      res.status(404).json({ erro: "erro, sem type" });
      break;
    }
  }
}

async function insideHeroLeaderboard(leaderboard: TopPlayers, currHeroId: string): Promise<Maps> {
    
    let updatedMaps = {};
  
    for (const [index, p] of leaderboard.data.players.entries()) {
      if (index > 5) break;
  
      for (let j = 0; j < 7; j++) {
        try {
          console.log(`Fetching player profile for ${p.player_uid}, skip=${j * 20}`);
          const url = `${process.env.NEXT_PUBLIC_MR_META}/player-match-history/${p.player_uid}?skip=${j * 20}&game_mode_id=2&hero_id=${currHeroId}&season=2`
          const playerProfile: PlayerHistoryProfile = await axios.get(url);
  
          if (playerProfile.data && playerProfile.data.length > 0) {
            updatedMaps = await makeMapCalculations(playerProfile.data, p.player_uid, currHeroId, updatedMaps, url);
            console.log("Mapa retornado do makeMapCalculations:", updatedMaps);
          } else {
            console.log("Perfil privado");
            break;
          }
        } catch (error) {
          console.error(`Error fetching player profile for ${p.player_uid}:`, error);
        }
      }
    }
  
    return updatedMaps;
  }
  
  async function makeMapCalculations(history: Match[], playerId: string, heroId: string, maps: Maps, url: any): Promise<Maps> {
    try {
      // Cria uma cópia do objeto maps para evitar mutação direta
      console.log(`aaaaaaaaaquiii111`);
      let updatedMaps = { ...maps };
  
      // Usando for...of para iterar e aguardar operações assíncronas
      for (const match of history) {
        console.log(`aaaaaaaaaquii222`, url);
        if(match.game_mode_id == 2){
            const mapId = match.match_map_id;
      
            // Inicializa o mapa se não existir
            if (!updatedMaps[mapId]) {
              console.log(`Criando mapa ${mapId} pela primeira vez`);
              updatedMaps[mapId] = {
                heroes: {},
              };
            }
      
            // Inicializa o herói no mapa se não existir
            console.log(`aaaaaaaaaquii3333`);
            if (!updatedMaps[mapId].heroes[heroId]) {
              console.log(`Criando herói ${heroId} pela primeira vez no mapa ${mapId}`);
              updatedMaps[mapId].heroes[heroId] = {
                general: {
                  partidas: 0,
                  vitorias: 0,
                },
                inimigos: {},
                aliados: {},
              };
            }
            
            // Busca detalhes da partida
            console.log(`Buscando detalhes da partida ${match.match_uid}`);
            const fmResponse: FullMatch = await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/matches/${match.match_uid}`);
      
            if (fmResponse.data && fmResponse.data.match_players && fmResponse.data.match_players.length > 0) {
              // Verifica se a partida é válida (sem dodges)
              if (!fmResponse.data.match_players.some((mpl) => !mpl.player_heroes || mpl.player_heroes.length < 1)) {
                updatedMaps = await validMatchCalc(fmResponse, updatedMaps, mapId, heroId, playerId);
                console.log("Mapa retornado do validMatchCalc:", updatedMaps);
              } else {
                console.log("Partida com dodge");
              }
            }
        }
      }
  
      return updatedMaps;
    } catch (e) {
      console.error(`Erro ao fazer cálculo de mapa: ${e}`);
      return maps; // Retorna o objeto original em caso de erro
    }
  }
  
  async function validMatchCalc(matchDet: FullMatch, curMaps: Maps, mapId: string, heroId: string, mainPlayerId: string): Promise<Maps> {
    try {
      let updatedMaps = { ...curMaps };
  
      updatedMaps[mapId].heroes[heroId].general.partidas += 1;
      console.log(`Partida geral + 1. Total: ${updatedMaps[mapId].heroes[heroId].general.partidas}`);
  
      const isWin = matchDet.data.match_players.find((elp) => elp.player_uid === mainPlayerId)?.is_win;
  
      if (isWin) {
        updatedMaps[mapId].heroes[heroId].general.vitorias += 1;
        console.log(`Vitória geral + 1. Total: ${updatedMaps[mapId].heroes[heroId].general.vitorias}`);
      }
      updatedMaps = await calcOtherMatchPlayers(matchDet.data.match_players, !!isWin, mainPlayerId, updatedMaps, mapId, heroId);
  
      return updatedMaps;
    } catch (e) {
      console.error(`Erro ao calcular partida válida: ${e}`);
      return curMaps; // Retorna o objeto original em caso de erro
    }
  }

  async function calcOtherMatchPlayers( playerList : FullMatchPlayer[], win: boolean, mPlayerId: string, mapsObj: Maps, matchMapId: string, mainHeroId: string): Promise<Maps> {
    try {
        let mapsList = { ...mapsObj };

        for(const pl of playerList){
            if (pl.player_uid !== mPlayerId) {

                if(pl.is_win == win){
                    for( const heros of pl.player_heroes){
                        mapsList[matchMapId].heroes[mainHeroId].aliados

                        mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].partidas += 1;
                        console.log(`Partidas com aliado ${heros.hero_id} + 1. Total: ${mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].partidas}`);
                    
                        if (win) {
                            mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].vitorias += 1;
                            console.log(`Vitória com aliado ${heros.hero_id} + 1. Total: ${mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].vitorias}`);
                        }
                    }
                } else {
                    for( const heros of pl.player_heroes){
                        mapsList[matchMapId].heroes[mainHeroId].inimigos

                        mapsList[matchMapId].heroes[mainHeroId].inimigos[heros.hero_id].partidas += 1;
                        console.log(`Partidas com inimigo ${heros.hero_id} + 1. Total: ${mapsList[matchMapId].heroes[mainHeroId].inimigos[heros.hero_id].partidas}`);
                    
                        if (pl.is_win) {
                            mapsList[matchMapId].heroes[mainHeroId].inimigos[heros.hero_id].vitorias += 1;
                            console.log(`Vitória contra inimigo ${heros.hero_id} + 1. Total: ${mapsList[matchMapId].heroes[mainHeroId].inimigos[heros.hero_id].vitorias}`);
                        }
                    }
                }
                
            }
        }
        return mapsList;
    } catch (e) {
        console.error(`Erro ao calcular aliados e inimigos: ${e}`);
        return mapsObj;
    }
  }
