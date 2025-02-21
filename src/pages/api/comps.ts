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
  
      // Retorna o objeto atualizado
      return updatedMaps;
    } catch (e) {
      console.error(`Erro ao fazer cálculo de mapa: ${e}`);
      return maps; // Retorna o objeto original em caso de erro
    }
  }
  
  async function validMatchCalc(matchDet: FullMatch, curMaps: Maps, mapId: string, heroId: string, mainPlayerId: string): Promise<Maps> {
    try {
      // Cria uma cópia do objeto curMaps para evitar mutação direta
      let updatedMaps = { ...curMaps };
  
      // Incrementa o número de partidas jogadas
      updatedMaps[mapId].heroes[heroId].general.partidas += 1;
      console.log(`Partida geral + 1. Total: ${updatedMaps[mapId].heroes[heroId].general.partidas}`);
  
      // Verifica se o jogador principal venceu a partida
      const isWin = matchDet.data.match_players.find((elp) => elp.player_uid === mainPlayerId)?.is_win;
  
      if (isWin) {
        updatedMaps[mapId].heroes[heroId].general.vitorias += 1;
        console.log(`Vitória geral + 1. Total: ${updatedMaps[mapId].heroes[heroId].general.vitorias}`);
      }
  
      // Retorna o objeto atualizado
      return updatedMaps;
    } catch (e) {
      console.error(`Erro ao calcular partida válida: ${e}`);
      return curMaps; // Retorna o objeto original em caso de erro
    }
  }

// await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/hero-leaderboard/${req.query.heroId}?device=1`, {
// }).then(async function (lb : TopPlayers) {
//   const {players} = lb.data;
//   let playerData = {};
//   let privProfiles = 0

//   for(let i = 0; i < (5 + privProfiles); i++){
//   console.log(`entrando no perfil do jogador ${i}`)
//       const playerId = players[i].player_uid
//       for(let j = 0; j < 10; j++){
//           console.log(`entrando em ?skip=${j*20}`)
//           await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/player/${playerId}?skip=${j*20}&game_mode_id=2&hero_id=${req.query.heroId}&season=2`, {
//           }).then(async function (hj : PlayerHistoryProfile){
//               if(!hj.data.match_history){
//                   privProfiles++;
//                   console.log(`perfil do jogador ${i} é privado, indo até o ${(5 + privProfiles)}`)
//                   j = 10;
//               } else if(hj.data.match_history.length > 0){
//                   console.log(`encontrou historico do jogador ${i}`)
//                   let heroId = req.query.heroId as string;
//                   await makeMapCalculations(hj.data.match_history, playerId, heroId, playerData).then((mapsCalc : Maps)=>{
//                       playerData = {...mapsCalc};
//                   }).catch((e) => {
//                       res.status(400).json({ erro: `erro ao chamar api ka ${e}` });
//                   });
//               } else {
//                   j=10;
//               }
//           }).catch((e) => {
//               res.status(400).json({ erro: `erro ao chamar api 2 ${e}` });
//           })
//       }
//   }
//   res.status(200).json({ mapsWinHate: playerData });

// }).catch((e) => {
//   res.status(400).json({ erro: `erro ao chamar api 3 ${e}` });
// })

// async function makeMapCalculations(history: Match[], playerId: string, heroId: string, maps: Maps): Promise<Maps> {
//     let dodgeCount = 0;
//     let mapAux = { ...maps };

//     for (let k = 0; k < history.length; k++) {
//         console.log(`entrando na partida ${k}`);
//         const match = history[k];
//         const mapId = match.match_map_id;
//         const isWin = match.match_player.is_win;

//         if (!mapAux[mapId]) {
//             console.log(`criando mapa ${mapId} pela primeira vez`);
//             mapAux[mapId] = {
//                 heroes: {},
//             };
//         }

//         if (!mapAux[mapId].heroes[heroId]) {
//             console.log(`criando heroi atual pela primeira vez`);
//             mapAux[mapId].heroes[heroId] = {
//                 general: {
//                     partidas: 0,
//                     vitorias: 0,
//                 },
//                 inimigos: {},
//                 aliados: {},
//             };
//         }

//         try {
//             const fmResponse = await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/matches/${match.match_uid}`);
//             const fm = fmResponse.data;

//             const hasInvalidPlayer = fm.match_players.some((pl: FullMatchPlayer) =>
//                 pl.player_heroes == null ||
//                 pl.player_heroes == undefined ||
//                 pl.player_heroes.length < 1
//             );

//             if (hasInvalidPlayer) {
//                 console.log(`Partida teve Dodge, indo até ${(20 + dodgeCount)}`);
//                 dodgeCount++;
//                 continue; // Pula para a próxima partida
//             }

//             // Atualiza contagem geral
//             mapAux[mapId].heroes[heroId].general.partidas += 1;
//             console.log(`partida geral + 1. Total: ${mapAux[mapId].heroes[heroId].general.partidas}`);
//             if (isWin) {
//                 mapAux[mapId].heroes[heroId].general.vitorias += 1;
//                 console.log(`vitoria geral + 1. Total: ${mapAux[mapId].heroes[heroId].general.vitorias}`);
//             }

//             // Processa aliados e inimigos
//             for (const pl of fm.match_players) {
//                 if (pl.player_uid !== playerId) {
//                     const isAlly = pl.is_win === isWin;
//                     const target = isAlly ? mapAux[mapId].heroes[heroId].aliados : mapAux[mapId].heroes[heroId].inimigos;

//                     for (const h of pl.player_heroes) {
//                         if (!target[h.hero_id]) {
//                             console.log(`criando heroi ${h.hero_id} pela primeira vez`);
//                             target[h.hero_id] = {
//                                 partidas: 0,
//                                 vitorias: 0,
//                             };
//                         }

//                         target[h.hero_id].partidas += 1;
//                         console.log(`partidas com ${h.hero_id} de ${isAlly ? 'aliado' : 'inimigo'} +1. Total: ${target[h.hero_id].partidas}`);
//                         if (isWin) {
//                             target[h.hero_id].vitorias += 1;
//                             console.log(`vitorias com ${h.hero_id} de ${isAlly ? 'aliado' : 'inimigo'} +1. Total: ${target[h.hero_id].vitorias}`);
//                         }
//                     }
//                 }
//             }
//         } catch (e) {
//             console.log(`erro ao chamar api kaka ${e}`);
//         }
//     }

//     return mapAux;
// }