import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  heroes: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  
  switch(req.method){
    case 'GET': {
      await axios.get(`${process.env.NEXT_PUBLIC_MR_API}/heroes`, {
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_XAPI,
        }
      }).then(function (response) {
        res.status(200).json({ heroes: response.data });
      }).catch((e) => {
        res.status(400).json({ heroes: `erro ao chamar api ${e}` });
      })
    }
    default: {
      res.status(404).json({ heroes: "erro hero" });
    }
  }
}
