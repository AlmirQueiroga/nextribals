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

    server.post('/api/calcularTimes', (req, res) => {
        const { mapa, numeroDeHeroisNoTime } = req.body;

        if (!mapa || !numeroDeHeroisNoTime) {
            return res.status(400).json({ message: 'Dados inválidos' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        function* gerarCombinacoes(herois, tamanho) {
            function* combinar(inicio, combinacao) {
                if (combinacao.length === tamanho) {
                    yield combinacao;
                    return;
                }
                for (let i = inicio; i < herois.length; i++) {
                    yield* combinar(i + 1, [...combinacao, herois[i]]);
                }
            }
            yield* combinar(0, []);
        }

        const herois = Object.keys(mapa.stats.heroes);
        for (const time of gerarCombinacoes(herois, numeroDeHeroisNoTime)) {
            const pontuacao = calcularPontuacaoTime(time, mapa);
            const resultado = {
                herois: time, // Exemplo de nomeação dos heróis
                // tipo: 'time',
                // mapa,
                pontuacao,
                // sinergia: pontuacao * 0.8, // Exemplo de cálculo de sinergia
                // eficacia: pontuacao * 0.9, // Exemplo de cálculo de eficácia
            };

            // Envia o resultado como um chunk
            res.write(JSON.stringify(resultado) + '\n');
        }

        // Finaliza a resposta
        res.end();
    });

    // Todas as outras rotas são manipuladas pelo Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Inicia o servidor
    server.listen(3001, (err) => {
        if (err) throw err;
        console.log('> Servidor Express pronto em http://localhost:3001');
    });
});

// Função para calcular a pontuação de um time
function calcularPontuacaoTime(time, mapa) {
    let pontuacao = 0;
    for (const heroId of time) {
        pontuacao += (mapa.stats.heroes[heroId].general.vitorias / mapa.stats.heroes[heroId].general.partidas) * 100;
        for (const aliadoId of time) {
            if (heroId !== aliadoId && mapa.stats.heroes[heroId].aliados[aliadoId]) {
                pontuacao += (mapa.stats.heroes[heroId].aliados[aliadoId].vitorias / mapa.stats.heroes[heroId].aliados[aliadoId].partidas) * 100;
            }
        }
    }
    return pontuacao;
}