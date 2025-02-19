import { HeroInMap, Relacao } from "@/types/types";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  maps: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  
  switch(req.method){
    case 'GET': {
      await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/hero-leaderboard/${req.query.heroId}?device=1`, {
      }).then(async function (response) {
        const {players} = response.data;

        for(var i = 0; i < 3; i++){
            const playerId = players[i].player_uid
            await axios.get(`${process.env.NEXT_PUBLIC_MR_META}/player/${playerId}?skip=0&game_mode_id=2&hero_id=${req.query.heroId}&season=2`, {
            }).then(function (response){
                makeMapCalculations(response.data, playerId, req.query.heroId)
            }).catch((e) => {
                res.status(400).json({ maps: `erro ao chamar api ${e}` });
            })
        }

        res.status(200).json({ maps: response.data });
      }).catch((e) => {
        res.status(400).json({ maps: `erro ao chamar api ${e}` });
      })
    }
    default: {
      res.status(404).json({ maps: "erro mapa" });
    }
  }
}

async function makeMapCalculations(history: any, playerId: string, heroId: any){
    const vic = "0%"
    const matches = 0;
    for(var j = 0; j < 20; j++){
        const match = history[j]

    }

    const allyRelation: Relacao = {
        
    }

    const enemyRelation: Relacao = {
        
    }

    const status: HeroInMap = {
        aliados: allyRelation,
        inimigos: enemyRelation
    }
    makeAlliesAndEnimiesCalculations()
}

function makeAlliesAndEnimiesCalculations(){

}
