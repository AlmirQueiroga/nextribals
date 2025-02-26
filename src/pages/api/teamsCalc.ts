// import { Mapa } from '@/types/types';
// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Método não permitido' });
//     }

//     const { mapa, numeroDeHeroisNoTime } = req.body;

//     if (!mapa || !numeroDeHeroisNoTime) {
//         return res.status(400).json({ message: 'Dados inválidos' });
//     }

//     // Configura o cabeçalho para streaming de dados
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Transfer-Encoding', 'chunked');

//     // Cria um ReadableStream para enviar dados incrementalmente
//     const stream = new ReadableStream({
//         async start(controller) {
//             const herois = Object.keys(mapa.stats.heroes);

//             // Função para gerar combinações de heróis
//             function* gerarCombinacoes(herois: string[], tamanho: number): Generator<string[]> {
//                 function* combinar(inicio: number, combinacao: string[]): Generator<string[]> {
//                     if (combinacao.length === tamanho) {
//                         yield combinacao;
//                         return;
//                     }
//                     for (let i = inicio; i < herois.length; i++) {
//                         yield* combinar(i + 1, [...combinacao, herois[i]]);
//                     }
//                 }
//                 yield* combinar(0, []);
//             }

//             // Envia cada combinação incrementalmente
//             for (const time of gerarCombinacoes(herois, numeroDeHeroisNoTime)) {
//                 const pontuacao = calcularPontuacaoTime(time, mapa);
//                 const resultado = {
//                     herois: time.map((id) => id ), // Exemplo de nomeação dos heróis
//                     tipo: 'time',
//                     mapa,
//                     pontuacao,
//                     sinergia: pontuacao * 0.8, // Exemplo de cálculo de sinergia
//                     eficacia: pontuacao * 0.9, // Exemplo de cálculo de eficácia
//                 };

//                 // Envia o resultado como um chunk
//                 controller.enqueue(JSON.stringify(resultado) + '\n');
//             }

//             // Finaliza o stream
//             controller.close();
//         },
//     });

//     // Pipe do ReadableStream para a resposta
//     const reader = stream.getReader();
//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         res.write(value);
//     }

//     res.end();
// }

// // Função para calcular a pontuação de um time
// function calcularPontuacaoTime(time: string[], mapa: Mapa): number {
//     let pontuacao = 0;
//     for (const heroId of time) {
//         if(mapa.stats){
//         pontuacao += (mapa.stats.heroes[heroId].general.vitorias / mapa.stats.heroes[heroId].general.partidas) * 100;
//         for (const aliadoId of time) {
//             if (heroId !== aliadoId && mapa.stats.heroes[heroId].aliados[aliadoId]) {
//                 pontuacao += (mapa.stats.heroes[heroId].aliados[aliadoId].vitorias / mapa.stats.heroes[heroId].aliados[aliadoId].partidas) * 100;
//             }
//         }
//         }
//     }
//     return pontuacao;
// }