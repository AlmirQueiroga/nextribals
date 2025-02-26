import { AppContextType, Heroi, Percentage } from "./types/types";

export function calcularPorcentagemVitoria(stats: Percentage): number {
    return stats.partidas === 0 ? 0 : (stats.vitorias / stats.partidas) * 100;
}

export function heroNameById(id: string, herois: Heroi[]): string {
    const hero = herois.find((h) => h.id == id);
    console.log("aaaaaaaaaaa", id)
    const name = hero?.name || `Hero ${id} desconhecido`
    return name
}