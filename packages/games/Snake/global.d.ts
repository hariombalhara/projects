import type {STATES} from "./snake";

export interface Snake {
    // List of all keys that are pending processing
    key_queue: number[];
    // interval ID obtained from setInterval 
    // FIXME: Why is Timeout showing as any ?
    interval: Timeout;
    paused: boolean;
    state:  STATES;
    // TODO: What are these width and height ?
    width: number;
    height: number;
    original_cfg: {
        body: {
            style: Record<string, string>;
            onbeforeunload: Function|null
        };
        document;
    }
    food: {
        el: HTMLElement
    };
}

declare global {
    interface Window {
        snake: Snake
    }
}