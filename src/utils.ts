import { Percentage } from "./types/types";

export function calcularPorcentagemVitoria(stats: Percentage): number {
    return stats.partidas === 0 ? 0 : (stats.vitorias / stats.partidas) * 100;
}