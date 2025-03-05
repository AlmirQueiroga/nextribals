import { Classe, ClassType, CompList, HeroID } from "@/types/types";
import { encodeBase64 } from "@/utils";

interface WorkerMessage {
    type: 'comp' | 'done' | 'error';
    data?: CompList[];
    error?: string;
}

self.onmessage = async (event: MessageEvent<{ mapa: any; numeroDeHeroisNoTime: number; tipo: string; formacoes: string[], classeHeroi: ClassType }>) => {
    const { mapa, numeroDeHeroisNoTime, tipo, formacoes, classeHeroi } = event.data;

    try {
        const response = await fetch('http://localhost:3001/api/calcularTimes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mapa, numeroDeHeroisNoTime, formacoes, classeHeroi }),
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let batch: CompList[] = [];

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const partes = buffer.split('\n');
                for (let i = 0; i < partes.length - 1; i++) {
                    try {
                        const resultado = JSON.parse(partes[i]);

                        const comp: CompList = {
                            herois: resultado.herois,
                            pontuacao: resultado.pontuacao,
                            inimigos: resultado.points_inimigos,
                            tipo,
                            mapa,
                        };

                        batch.push(comp);

                        if (batch.length >= 1500) {
                            self.postMessage({ type: 'comp', data: batch } as WorkerMessage);
                            batch = [];
                        }

                    } catch (error) {
                        console.error('Erro ao processar JSON:', error);
                    }
                }

                buffer = partes[partes.length - 1];
            }

            if (batch.length > 0) {
                self.postMessage({ type: 'comp', data: batch } as WorkerMessage);
            }

            self.postMessage({ type: 'done' } as WorkerMessage);
        }
    } catch (error:any) {
        console.error('Erro no Worker:', error);
        self.postMessage({ type: 'error', error: error.message } as WorkerMessage);
    }
};