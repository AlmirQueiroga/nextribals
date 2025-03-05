import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ClassType, CompList, Heroi, Mapa } from '@/types/types';
import { GameContext } from '@/context/context';
import { WorkerMessage } from '@/types/apiTypes';
import { FixedSizeList as List } from 'react-window';
import { Cell, VirtualHeader, RowWrapper, TableWrapper, HeaderCell, LoadMoreButton } from './style';

const CompsPage: React.FC = () => {

    const { state } = useContext(GameContext);
  
    const [comps, setComps] = useState<CompList[]>([]);
    const [tipo, setTipo] = useState<string>('');
    const [mapa, setMapa] = useState<Mapa>();
    const [sub, setSub] = useState<string>('');
    const [pos, setPos] = useState<string>('');
    const [visibleItems, setVisibleItems] = useState(100);

    function useHeroNameById(id: string, herois: Heroi[]): string {
        return useMemo(() => {
            const hero = herois.find((h) => h.id == id);
            return hero?.name || `Hero ${id} desconhecido`;
        }, [id, herois]);
    }

    useEffect(() => {
        if (mapa && mapa.stats) {
            setComps([]); 
            const classeHeroi = state.herois.reduce<ClassType>((acc, h) => {
                acc[h.id] = h.role as string;
                return acc;
              }, {});
            const worker = new Worker(new URL('./worker.ts', import.meta.url));

            worker.postMessage({
                mapa,
                numeroDeHeroisNoTime: 6,
                tipo,
                formacoes: state.formacao,
                classeHeroi
            });

            
            worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
                const { type, data, error } = event.data;

                if (type === 'comp' && data) {

                    handleData(data);
                } else if (type === 'done') {
                    console.log('Processamento concluído');
                    worker.terminate();
                } else if (type === 'error' && error) {
                    console.log("Erro worker funcionamento");
                    worker.terminate();
                }
            };

            
            return () => worker.terminate();
        }
    }, [mapa]);
       

    const handleData = useCallback((comp:CompList[]) => {
        setComps((prev) => [...prev, ...comp]);
    }, []);

    const loadMore = () => {
        setVisibleItems(prev => prev + 100);
      };

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        if (index === visibleItems-1) {
            return (
              <div style={style}>
                <LoadMoreButton onClick={loadMore} disabled={visibleItems >= comps.length}>
                  {visibleItems >= comps.length ? 'Todos os itens carregados' : 'Carregar Mais'}
                </LoadMoreButton>
              </div>
            );
        }

        return (
            <RowWrapper style={style}>
                {comps.length > 0 && comps[index].herois.map((heroi, i) => (
                    <Cell key={i}>
                    {useHeroNameById(heroi, state.herois)}
                    </Cell>
                ))}
            </RowWrapper>
        )
    };



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
            
            <TableWrapper>
            
                <VirtualHeader>
                    <HeaderCell>
                        Person 1
                    </HeaderCell >
                    <HeaderCell>
                        Person 2
                    </HeaderCell >
                    <HeaderCell>
                        Person 3
                    </HeaderCell >
                    <HeaderCell>
                        Person 4
                    </HeaderCell >
                    <HeaderCell>
                        Person 5
                    </HeaderCell >
                    <HeaderCell>
                        Person 6
                    </HeaderCell >
                </VirtualHeader>

                <List
                    height={600} 
                    itemCount={visibleItems}
                    itemSize={75}
                    width={(window.innerWidth - 15)}
                >
                    {Row}
                </List>

            </TableWrapper>
        
        </div>
            
    );
};

export default CompsPage;