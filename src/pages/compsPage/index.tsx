import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ClassType, CompList, Heroi, Mapa } from '@/types/types';
import { GameContext } from '@/context/context';
import { WorkerMessage } from '@/types/apiTypes';
import { FixedSizeList as List } from 'react-window';
import { Cell, VirtualHeader, RowWrapper, TableWrapper, HeaderCell, LoadMoreButton } from './style';
import { FilterInput, SelectMulti, SelectedItemsContainer, SelectedItem, RemoveButton } from '@/styles';

const CompsPage: React.FC = () => {

    const { state } = useContext(GameContext);
  
    const [comps, setComps] = useState<CompList[]>([]);
    const [tipo, setTipo] = useState<string>('');
    const [mapa, setMapa] = useState<Mapa>();
    const [sub, setSub] = useState<string>('');
    const [pos, setPos] = useState<string>('');
    const [visibleItems, setVisibleItems] = useState(100);

    const [inimigosSelected, setInimigosSelected] = useState<Heroi[]>([]);
    const [inimigosFilter, setInimigosFilter] = useState<string>('');

    const handleInimigosSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(
            (option) => state.herois.find((h) => h.id == option.value)!
            ).filter((heroi) => !inimigosSelected.some((h) => h.id == heroi.id));
            
        setInimigosSelected((prev) => (selectedOptions.concat(prev)));
    };

    const filteredInimigos = state.herois.filter((heroi) =>
        heroi.name.toLowerCase().includes(inimigosFilter.toLowerCase())
    );

    const removeInimigo = (heroi: Heroi) => {
        setInimigosSelected(inimigosSelected.filter((h) => h.id !== heroi.id));
    };
    function useHeroNameById(id: string, herois: Heroi[]): string {
        return useMemo(() => {
            const hero = herois.find((h) => h.id == id);
            return hero?.name || `Hero ${id} desconhecido`;
        }, [id, herois]);
    }

    const pontuacaoWIni = useCallback((pontuacao: number, team: string[]) => {
        let pontAlterada = pontuacao
        for(const teamember of team){
            for(const ini of inimigosSelected){
                pontAlterada += calcularPontuacaoContraInimigo(teamember, ini.id);
            }
        }
        return pontAlterada;
    }, [inimigosSelected, mapa]);

    const calcularPontuacaoContraInimigo = (heroiId:string, inimigoId: string) => {
        try {
            const stats = mapa?.stats?.heroes[heroiId]?.inimigos?.[inimigoId];
            if (!stats?.partidas || stats.partidas === 0) return 0;

            const vic = stats.vitorias || 0;
            const part = stats.partidas;
            
            const z = 1.96;
            const p = vic / part;
            const adjustment = (z * z) / (2 * part);
            const center = p + adjustment;
            const spread = z * Math.sqrt((p * (1 - p) + adjustment) / part);
            
            return Math.max(0, center - spread) * 100;
        } catch (error) {
            console.error(`Erro cálculo inimigo ${inimigoId} para herói ${heroiId}:`, error);
            return 0;
        }
    };

    const sortedComps = useMemo(() => {
        if (inimigosSelected.length === 0) {
            return comps;
        } else {
            return comps.map(comp => ({
                ...comp,
                adjusted: pontuacaoWIni(comp.pontuacao, comp.herois)
            })).sort((a, b) => b.adjusted - a.adjusted);
        }
    }, [comps, inimigosSelected, pontuacaoWIni]);

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
                    setComps(prev => [...prev].sort((a, b) => b.pontuacao - a.pontuacao));
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

    const Row = memo(({ index, style, data }: { index: number; style: React.CSSProperties, data: typeof sortedComps }) => {
        const team = data[index];

        if (index === visibleItems-1) {
            return (
              <div style={style}>
                <LoadMoreButton onClick={loadMore} disabled={visibleItems >= data.length}>
                  {visibleItems >= data.length ? 'Todos os itens carregados' : 'Carregar Mais'}
                </LoadMoreButton>
              </div>
            );
        }

        return (
            team &&
            <RowWrapper style={style}>
                {team.herois.map((heroi, i) => (
                    <Cell key={i}>
                        {useHeroNameById(heroi, state.herois)}
                    </Cell>
                ))}
                <Cell>
                    {inimigosSelected.length > 0 ? (team as any).adjusted : team.pontuacao}
                </Cell>
                
            </RowWrapper>
        )
    });



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

            <div style={{minWidth: "20rem"}} >
                <h3>Inimigos:</h3>
                <FilterInput
                    type="text"
                    value={inimigosFilter}
                    onChange={(e) => setInimigosFilter(e.target.value)}
                    placeholder="Hero"
                />
                <SelectMulti
                    multiple
                    value={inimigosSelected.map((ini) => ini.id)}
                    onChange={handleInimigosSelect}
                >
                    {filteredInimigos.map((heroi) => (
                    <option key={heroi.id} value={heroi.id}>
                        {heroi.name}
                    </option>
                    ))}
                </SelectMulti>
                <SelectedItemsContainer>
                    {inimigosSelected.map((heroi) => (
                    <SelectedItem key={heroi.id}>
                        {heroi.name}
                        
                        <RemoveButton type="button" onClick={() => removeInimigo(heroi)}>
                            X
                        </RemoveButton>
                        
                    </SelectedItem>
                    ))}
                </SelectedItemsContainer>
                </div>
            
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
                    <HeaderCell>
                        Points
                    </HeaderCell >
                </VirtualHeader>

                <List
                    height={600} 
                    itemCount={visibleItems}
                    itemSize={75}
                    width={(window.innerWidth - 15)}
                    itemData={sortedComps}
                >
                    {Row}
                </List>

            </TableWrapper>
        
        </div>
            
    );
};

export default CompsPage;