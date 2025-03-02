const express = require('express');
const next = require('next');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.use(cors({
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
    }));

    server.use(express.json());

    server.post('/api/calcularTimes', async (req, res) => {
        const {mapa, numeroDeHeroisNoTime, formacoes, classeHeroi} = req.body;

        if (!mapa || !numeroDeHeroisNoTime || !formacoes || !classeHeroi) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const herois = Object.keys(mapa.stats.heroes);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const heroisOrdenados = herois.sort((a, b) => calcularPontuacaoHeroi(b) - calcularPontuacaoHeroi(a));
            
            function calcularPontuacaoHeroi(heroiId) {       
                if(mapa.stats){

                    const stats = mapa.stats.heroes[heroiId].general;
                    if(!stats || !stats?.partidas){
                        return 0;
                    }

                    const vic = stats.vitorias || 0;
                    const part = stats.partidas;

                    const taxaVitoria = (vic / part) * 100;
                    const confianca = 1 - (1 / Math.sqrt(stats.partidas));
                    console.log("aaaaaaaaaaa pontuacao heroi", taxaVitoria * confianca);
                    return taxaVitoria * confianca;
                }
                return 0;
            }

            function calcularPontuacaoAliado(heroiId, aliadoId) {
                if(mapa.stats){

                    const stats = mapa.stats.heroes[heroiId].aliados[aliadoId];
                    if(!stats || !stats?.partidas){
                        return 0;
                    }

                    const vic = stats.vitorias || 0;
                    const part = stats.partidas;
                    
                    const taxaVitoria = (vic / part) * 100;
                    const confianca = 1 - (1 / Math.sqrt(part));

                    console.log("bbbbbbbbbbbbbb pontuacao aliado", taxaVitoria * confianca);
                    return taxaVitoria * confianca;
                }
                return 0;
            }

            function calcularPontuacaoAliadoDisponivel(team, aliadoId) {
                let pontuacao = calcularPontuacaoHeroi(aliadoId);
                let pontuacaoAliado = 0;

                if(team.length > 1){
                    for( const teamember of team){
                        pontuacaoAliado += calcularPontuacaoAliado(teamember, aliadoId)
                        console.log("ccccccccccccc pontuacao aliado extra", pontuacaoAliado);
                    }
                    const confianca = 1 - (1 / Math.sqrt(pontuacao));
                    
                    console.log("ddddddddddddd pontuacao aliado extra confianca", pontuacaoAliado * confianca);
                    return pontuacaoAliado * confianca
                }

                return pontuacao;
            }


            const formacoesValidas = formacoes.map((formacao) => {
                const [vanguard, duelist, strategist] = formacao.split(' - ').map(Number);
                return { "Vanguard": vanguard, "Duelist": duelist, "Strategist": strategist };
            });


            function allowedRole(team) {
                for (const pos of formacoesValidas) {
                    if (team["Vanguard"] <= pos["Vanguard"] && team["Duelist"] <= pos["Duelist"] && team["Strategist"] <= pos["Strategist"]) {
                        return true;
                    }
                }
                return false;
            }

            async function* gerarCombinacoes(tamanho) {
                function* combinar(
                    lista,
                    comeco,
                    combinacaoAtual,
                    contadoresClasses,
                    pontuacaoAtual,
                ) {
                    if (combinacaoAtual.length == tamanho) {
                        yield { herois: [...combinacaoAtual], pontuacao: pontuacaoAtual };
                        return;
                    }
            
                    const listaRestante = lista.slice(comeco);
                    
                    listaRestante.sort((a, b) => 
                        calcularPontuacaoAliadoDisponivel(combinacaoAtual, b) - 
                        calcularPontuacaoAliadoDisponivel(combinacaoAtual, a)
                    );
            
                    let haNumerosValidos = false;
            
                    for (let i = 0; i < listaRestante.length; i++) {
                        const id = listaRestante[i];
                        const novaClasse = classeHeroi[id];
                        const novosContadores = { 
                            ...contadoresClasses, 
                            [novaClasse]: contadoresClasses[novaClasse] + 1 
                        };
            
                        if (allowedRole(novosContadores)) {
                            haNumerosValidos = true;
                            combinacaoAtual.push(id);
                            
                            const valorHeroi = calcularPontuacaoAliadoDisponivel(combinacaoAtual, id);
                            const novaPontuacao = pontuacaoAtual + valorHeroi;
            
                            const indiceOriginal = lista.indexOf(id, comeco);
            
                            yield* combinar(
                                lista,
                                indiceOriginal + 1,
                                combinacaoAtual,
                                novosContadores,
                                novaPontuacao
                            );
            
                            combinacaoAtual.pop();
                            novosContadores[novaClasse]--;
            
                            if (combinacaoAtual.length % 10 == 0) {
                                yield;
                                //yield new Promise(resolve => setImmediate(resolve));
                            }
                        }
                    }
            
                    if (!haNumerosValidos) return;
                }

                for (const time of combinar(heroisOrdenados,0,[],{ "Vanguard": 0, "Duelist": 0, "Strategist": 0 },0)) {
                    yield time; 
                    await new Promise(resolve => setImmediate(resolve));
                }
            
                
            }

        try {
            const generator = gerarCombinacoes(numeroDeHeroisNoTime);
            for await (const time of generator) {
                if (!time?.herois) continue;
                const resultado = { herois: time.herois, pontuacao: time.pontuacao };
                console.log("eeeeeeeeeeeee", resultado);
                res.write(JSON.stringify(resultado) + '\n');
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).end();
        }
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(3001, (err) => {
        if (err) throw err;
        console.log('> Servidor Express pronto em http://localhost:3001');
    });
});
