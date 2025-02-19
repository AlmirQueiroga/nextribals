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
      await axios.get(`${process.env.NEXT_PUBLIC_MR_API}/maps?page=1&limit=50`, {
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_XAPI,
        }
      }).then(function (response) {
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
