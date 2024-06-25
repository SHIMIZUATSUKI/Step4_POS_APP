declare module 'quagga' {
    export interface QuaggaConfig {
        inputStream: {
            type: string;
            target: any;
        };
        decoder: {
            readers: string[];
        };
    }

    export interface QuaggaData {
        codeResult: {
            code: string;
        };
    }

    export function init(config: QuaggaConfig, callback: (err: any) => void): void;
    export function start(): void;
    export function stop(): void;
    export function onDetected(callback: (data: QuaggaData) => void): void;
}
