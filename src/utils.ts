import { Percentage } from "./types/types";

export function calcularPorcentagemVitoria(stats: Percentage): number {
    return stats.partidas === 0 ? 0 : (stats.vitorias / stats.partidas) * 100;
}

export function encodeBase64(data: string): string {
    return btoa(data);
}

export function decodeBase64(data: string): string {
    return atob(data);
}