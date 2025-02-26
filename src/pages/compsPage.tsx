import React, { useContext, useEffect, useMemo, useState } from 'react';
import { calcularPorcentagemVitoria, heroNameById } from '@/utils';
import { GameStatusTable } from '@/styles';
import { CompList, HeroDict, Heroi, Mapa } from '@/types/types';
import { GameContext } from '@/context/context';
import { ContextDisplay } from '@/components/contextDisplay';

interface HeroRowProps {
    heroIds: string[];
    heroesState: Heroi[];
}

const CompsPage: React.FC = () => {

    const { state } = useContext(GameContext);
  
    const [comps, setComps] = useState<CompList[]>([]);
    const [tipo, setTipo] = useState<string>('');
    const [mapa, setMapa] = useState<Mapa>();
    const [sub, setSub] = useState<string>('');
    const [pos, setPos] = useState<string>('');

    useEffect(() => {
        if (mapa && mapa.stats) {
            setComps([]);
            const buscarTimesIncrementais = async () => {
                const response = await fetch('http://localhost:3001/api/calcularTimes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mapa, numeroDeHeroisNoTime: 6 }),
                });

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let batch = [];

                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });

                        // Processa os dados recebidos
                        const partes = buffer.split('\n');
                        
                        for (let i = 0; i < partes.length - 1; i++) {
                            const parte = partes[i];
                            try {
                                const resultado = JSON.parse(parte);

                                let comp : CompList = {
                                    herois: resultado.herois,
                                    pontuacao: resultado.pontuacao,
                                    tipo,
                                    mapa
                                }
                                batch.push(resultado);

                                if (batch.length >= 25) {

                                    setComps((prev) => [...prev, comp]);
                                    batch = [];
                                }
                            } catch (error) {
                                console.error('Erro ao processar JSON:', error);
                            }
                        }
                        buffer = partes[partes.length - 1];
                    }
                }
            };

            buscarTimesIncrementais();
        }
    }, [mapa, setComps]);



    return (
        <div>
            <select
                value={tipo}
                onChange={(e) => {setTipo(e.target.value); setPos(''); setSub('');}}
                style={{ margin:"1rem 1rem 1rem 8rem"}}
            >
                <option value="">Selecione um tipo de jogo</option>
                {state.tipoJogo.map((tipo, index) => (
                <option key={index} value={tipo}>
                    {tipo}
                </option>
                ))}
            </select>
            {tipo &&
                <select
                value={mapa?.id}
                onChange={(e) => setMapa(state.mapas.find((mapa) => mapa.id == e.target.value))}
                style={{ margin:"1rem 1rem 1rem 1rem"}}
                required
                >
                <option value="">Selecione um mapa</option>
                {state.mapas.filter((mapa) => (mapa.game_mode == tipo && mapa.is_competitve)).map((mapa, index) => (
                    <option key={index} value={mapa.id}>
                    {mapa.name}
                    </option>
                ))}
                </select>
            }
            {mapa &&
                <>
                {
                    mapa.game_mode == "Domination" ?
                    (
                    <select
                        value={sub}
                        onChange={(e) => setSub(e.target.value)}
                        style={{ margin:"1rem 1rem 1rem 1rem"}}
                        required
                    >
                        <option value="">Selecione um submapa</option>
                        {mapa.sub_map && 
                        mapa.sub_map.map((sub, index) => (
                            sub.name &&<option key={index} value={sub.id}>
                            {sub.name}
                            </option>                      
                        ))}
                    </select>
                    )
                    :
                    (
                    <select
                        value={pos}
                        onChange={(e) => setPos(e.target.value)}
                        style={{ margin:"1rem 1rem 1rem 1rem"}}
                        required
                    >
                        <option value="">Selecione uma posição</option>
                        {mapa.posicao && 
                        mapa.posicao.map((pos, index) => (
                            <option key={index} value={pos}>
                            {pos}
                            </option>
                        ))}
                    </select>
                    )
                }
                </>
            }
        
        <GameStatusTable>
            <thead> 
                <tr>
                    <th>Person 1</th>
                    <th>Person 2</th>
                    <th>Person 3</th>
                    <th>Person 4</th>
                    <th>Person 5</th>
                    <th>Person 6</th>
                </tr>
            </thead>
            <tbody>
                {comps.map((c, index) => (
                    <tr key={index}>
                        {
                            c.herois.map((hid) => (
                                <td>{heroNameById(hid, state.herois)}</td>
                            ))
                        }
                    </tr>
                ))}
                
            </tbody>
        </GameStatusTable>
        <ContextDisplay />
        </div>
            
    );
};

export default CompsPage;