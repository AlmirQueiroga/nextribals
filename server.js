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

    server.use(express.json({ limit: '50mb' }));
    server.use(express.urlencoded({ extended: true }));

    server.post('/api/calcularTimes', async (req, res) => {
        const {mapa, numeroDeHeroisNoTime, formacoes, classeHeroi} = req.body;

        if (!mapa || !numeroDeHeroisNoTime || !formacoes || !classeHeroi) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        const herois = Object.keys(mapa.stats.heroes);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        function wilsonLower(p, n, z = 1.96) {
            const denominator = 1 + (z ** 2) / n;
            const centre = p + (z ** 2) / (2 * n);
            const std = z * Math.sqrt((p * (1 - p) / n) + (z ** 2) / (4 * (n ** 2)));
            const lower = (centre - std) / denominator;
            return lower;
        }

            
        function calcularPontuacaoHeroi(heroiId) {       
            if(mapa.stats){

                const stats = mapa.stats.heroes[heroiId].general;
                if(!stats || !stats?.partidas){
                    return 0;
                }

                const vic = stats.vitorias || 0;
                const part = stats.partidas;

                const taxaVitoria = vic / part;
                const lowerBound = wilsonLower(taxaVitoria, part);

                return lowerBound* 100;
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
                
                const taxaVitoria = vic / part;
                const lowerBound = wilsonLower(taxaVitoria, part);

                return lowerBound * 100;
            }
            return 0;
        }

        function calcularPontuacaoAliadoDisponivel(team, aliadoId) {
            let pontuacao = calcularPontuacaoHeroi(aliadoId);
            let pontuacaoAliado = 0;

            if(team.length > 1){
                for( const teamember of team){
                    if(pontuacao == 0) {
                        pontuacaoAliado += calcularPontuacaoAliado(teamember, aliadoId)
                    } else {
                        pontuacaoAliado = (pontuacaoAliado+calcularPontuacaoAliado(teamember, aliadoId))/2
                    }
                }

                return (pontuacaoAliado*0.3) + (pontuacao*0.7)
            }

            return pontuacao;
        }

        // const calcularPontuacaoContraInimigo = (heroiId, inimigoId) => {
        //     try {
        //         const stats = mapa.stats.heroes[heroiId]?.inimigos?.[inimigoId];
        //         if (!stats?.partidas || stats.partidas === 0) return 0;
    
        //         const vic = stats.vitorias || 0;
        //         const part = stats.partidas;
                
        //         // Fórmula Wilson Score para intervalo de confiança
        //         const z = 1.96;
        //         const p = vic / part;
        //         const adjustment = (z * z) / (2 * part);
        //         const center = p + adjustment;
        //         const spread = z * Math.sqrt((p * (1 - p) + adjustment) / part);
                
        //         return Math.max(0, center - spread) * 100;
        //     } catch (error) {
        //         console.error(`Erro cálculo inimigo ${inimigoId} para herói ${heroiId}:`, error);
        //         return 0;
        //     }
        // };
    
        // // 2. Função para cálculo do mapa de inimigos com cache
        // const calcularMapaInimigosTime = (time) => {
        //     const mapaInimigos = {};
        //     const inimigosIds = Object.keys(mapa.stats.heroes);
    
        //     for (const inimigoId of inimigosIds) {
        //         let total = 0;
        //         let validHeroes = 0;
                
        //         for (const heroiId of time) {
        //             if (mapa.stats.heroes[heroiId]) {
        //                 total += calcularPontuacaoContraInimigo(heroiId, inimigoId);
        //                 validHeroes++;
        //             }
        //         }
                
        //         mapaInimigos[inimigoId] = validHeroes > 0 ? total / validHeroes : 0;
        //     }
    
        //     return mapaInimigos;
        // };

        const formacoesValidas = formacoes.map((formacao) => ({
            "Vanguard": +formacao.split(' - ')[0],
            "Duelist": +formacao.split(' - ')[1],
            "Strategist": +formacao.split(' - ')[2]
        }));
    
        function allowedRole(contadores) {
            return formacoesValidas.some(pos => 
                contadores.Vanguard <= pos.Vanguard &&
                contadores.Duelist <= pos.Duelist &&
                contadores.Strategist <= pos.Strategist
            );
        }
    
        async function* gerarCombinacoes(tamanho) {
            const heroisComPontuacao = herois.map(id => ({
                id,
                score: calcularPontuacaoHeroi(id),
            })).sort((a, b) => b.score - a.score);
    
            // Usamos um heap máximo para eficiência
            const queue = new MaxHeap((a, b) => a.upperBound - b.upperBound);
            queue.insert({
                current: [],
                index: 0,
                contadores: { Vanguard: 0, Duelist: 0, Strategist: 0 },
                pontuacao: 0,
                upperBound: heroisComPontuacao
                    .slice(0, tamanho)
                    .reduce((sum, h) => sum + h.score, 0)
            });
    
            let count = 0;
            
            while (!queue.isEmpty()) {
                const state = queue.extract();
                
                if (state.current.length === tamanho) {
                    yield { herois: state.current, pontuacao: state.pontuacao, /*points_inimigos: calcularMapaInimigosTime(state.current)*/ };
                    if (++count % 10 === 0) await new Promise(resolve => setImmediate(resolve));
                    continue;
                }
    
                const remaining = tamanho - state.current.length;
                const startIndex = state.index;
                
                for (let i = startIndex; i < heroisComPontuacao.length; i++) {
                    const hero = heroisComPontuacao[i];
                    const classe = classeHeroi[hero.id];
                    
                    const novosContadores = {
                        ...state.contadores,
                        [classe]: (state.contadores[classe] || 0) + 1
                    };
                    
                    if (!allowedRole(novosContadores)) continue;
    
                    const pontuacaoReal = calcularPontuacaoAliadoDisponivel(state.current, hero.id);
                    const novaPontuacao = state.pontuacao + pontuacaoReal;

                    const remainingHerois = heroisComPontuacao
                        .slice(i + 1, i + 1 + remaining - 1);
                    const upperBound = novaPontuacao + 
                        remainingHerois.reduce((sum, h) => sum + h.score, 0);
    
                    queue.insert({
                        current: [...state.current, hero.id],
                        index: i + 1,
                        contadores: novosContadores,
                        pontuacao: novaPontuacao,
                        upperBound: upperBound
                    });
                }
            }
        }
    
        try {
            const generator = gerarCombinacoes(numeroDeHeroisNoTime);
            for await (const time of generator) {
                res.write(JSON.stringify(time) + '\n');
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


class MaxHeap {
    constructor(compareFn) {
        this.heap = [];
        this.compare = compareFn || ((a, b) => a - b);
    }

    insert(value) {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    extract() {
        const max = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return max;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (this.compare(element, parent) <= 0) break;
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = element;
    }

    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let swap = null;
            
            if (leftChildIndex < length) {
                if (this.compare(this.heap[leftChildIndex], element) > 0) {
                    swap = leftChildIndex;
                }
            }
            
            if (rightChildIndex < length) {
                if (
                    (swap === null && this.compare(this.heap[rightChildIndex], element) > 0) ||
                    (swap !== null && this.compare(this.heap[rightChildIndex], this.heap[leftChildIndex]) > 0)
                ) {
                    swap = rightChildIndex;
                }
            }
            
            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            index = swap;
        }
        this.heap[index] = element;
    }
}