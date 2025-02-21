import { MapsDict, Match, MatchPlayer } from "@/types/apiTypes";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{mapsWinHate: MapsDict} | {erro: string}>,
) {
  
  switch(req.method){
    case 'GET': {
        let hid = req.query.heroId as string
        const lb = await axios.get<{ players: MatchPlayer[]}>(`${process.env.NEXT_PUBLIC_MR_META}/hero-leaderboard/${hid}?device=1`, {})
  
        if(lb.data && lb.data.players.length > 0){
            const allMaps = await insideHeroLeaderboard(lb.data.players, hid);
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

async function insideHeroLeaderboard(leaderboard: MatchPlayer[], currHeroId: string): Promise<MapsDict> {
    
    let updatedMaps = {};
  
    for (const [index, p] of leaderboard.entries()) {
      if (index > 5) break;
  
      for (let j = 0; j < 7; j++) {
        try {
          console.log(`Fetching player profile for ${p.player_uid}, skip=${j * 20}`);
          const playerProfile = await axios.get<Match[]>(`${process.env.NEXT_PUBLIC_MR_META}/player-match-history/${p.player_uid}?skip=${j * 20}&game_mode_id=2&hero_id=${currHeroId}&season=2`);
  
          if (playerProfile.data && playerProfile.data.length > 0) {
            updatedMaps = await makeMapCalculations(playerProfile.data, p.player_uid, currHeroId, updatedMaps);
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
  
  async function makeMapCalculations(history: Match[], playerId: string, heroId: string, maps: MapsDict): Promise<MapsDict> {
    try {
      let updatedMaps = { ...maps };
  
      for (const match of history) {
        if(match.game_mode_id == 2 && match.match_map_id && match.match_play_duration){
            const mapId = match.match_map_id;
            const matchTime = match.match_play_duration

            if (!updatedMaps[mapId]) {
              console.log(`Criando mapa ${mapId} pela primeira vez`);
              updatedMaps[mapId] = {
                heroes: {},
              };
            }

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

            console.log(`Buscando detalhes da partida ${match.match_uid}`);
            const fmResponse = await axios.get<Match>(`${process.env.NEXT_PUBLIC_MR_META}/matches/${match.match_uid}`);
      
            if (fmResponse.data && fmResponse.data.match_players && fmResponse.data.match_players.length > 0) {

              if (!fmResponse.data.match_players.some((mpl) => !mpl.player_heroes || mpl.player_heroes.length < 1)) {
                updatedMaps = await validMatchCalc(fmResponse.data, updatedMaps, mapId, heroId, playerId, matchTime);
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
  
  async function validMatchCalc(matchDet: Match, curMaps: MapsDict, mapId: string, heroId: string, mainPlayerId: string, matchDur: number): Promise<MapsDict> {
    try {
      if(!matchDet.match_players || matchDet.match_players.length < 1) throw new ReferenceError();
      let updatedMaps = { ...curMaps };
  
      updatedMaps[mapId].heroes[heroId].general.partidas += 1;
      console.log(`Partida geral + 1. Total: ${updatedMaps[mapId].heroes[heroId].general.partidas}`);
  
      const isWin = matchDet.match_players.find((elp) => elp.player_uid === mainPlayerId)?.is_win;
  
      if (isWin) {
        updatedMaps[mapId].heroes[heroId].general.vitorias += 1;
        console.log(`Vitória geral + 1. Total: ${updatedMaps[mapId].heroes[heroId].general.vitorias}`);
      }
      updatedMaps = await calcOtherMatchPlayers(matchDet.match_players, !!isWin, mainPlayerId, updatedMaps, mapId, heroId, matchDur);
  
      return updatedMaps;
    } catch (e) {
      console.error(`Erro ao calcular partida válida: ${e}`);
      return curMaps;
    }
  }

  async function calcOtherMatchPlayers( playerList : MatchPlayer[], win: boolean, mPlayerId: string, mapsObj: MapsDict, matchMapId: string, mainHeroId: string, matchPlayTime: number): Promise<MapsDict> {
    try {
        let mapsList = { ...mapsObj };

        for(const pl of playerList){
          if(pl.player_heroes){
            if (pl.player_uid !== mPlayerId) {

              if(pl.is_win == win){
                  for( const heros of pl.player_heroes){
                      if(heros.play_time > (matchPlayTime/3.5)){
                        if (!mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id]) {
                          console.log(`Criando herói ${heros.hero_id} como aliado de ${mainHeroId} pela primeira vez no mapa ${matchMapId}`);
                          mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id] = {
                              partidas: 0,
                              vitorias: 0,          
                          };
                        }
  
                        mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].partidas += 1;
                        console.log(`Partidas com aliado ${heros.hero_id} + 1. Total: ${mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].partidas}`);
                    
                        if (win) {
                            mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].vitorias += 1;
                            console.log(`Vitória com aliado ${heros.hero_id} + 1. Total: ${mapsList[matchMapId].heroes[mainHeroId].aliados[heros.hero_id].vitorias}`);
                        }
                      }
                  }
              } else {
                  for( const heros of pl.player_heroes){
                    if(heros.play_time > (matchPlayTime/3.5)){
                      if (!mapsList[matchMapId].heroes[mainHeroId].inimigos[heros.hero_id]) {
                        console.log(`Criando herói ${heros.hero_id} como inimigo de ${mainHeroId} pela primeira vez no mapa ${matchMapId}`);
                        mapsList[matchMapId].heroes[mainHeroId].inimigos[heros.hero_id] = {
                            partidas: 0,
                            vitorias: 0,          
                        };
                      }

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
          }
        }
        return mapsList;
    } catch (e) {
        console.error(`Erro ao calcular aliados e inimigos: ${e}`);
        return mapsObj;
    }
  }
