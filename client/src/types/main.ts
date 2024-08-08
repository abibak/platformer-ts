import AudioManager from "@/library/AudioManager";
import Character from "@/objects/Character";
import {GameObject} from "@/types/game";

/* Event Bus */
export type Callback = (arg?: any) => void;
export type Subscriber = Record<string, {[key: string | number]: Callback}>
/* */

export interface SoundEntity {
    [key: string]: AudioManager
}

export interface Library {
    sounds: SoundEntity,
}

export interface AutomatedCharacter {
    character: Character;
    reachedLeftBorder: boolean;
    reachedRightBorder: boolean;
    targetSide: string;
    target?: Character;
}

export interface StructureMap {
    [key: string]: {
        background: string;
        x: number;
        y: number;
        w: number;
        h: number;
        nextLine: number;
        tiles: {
            [key: string]: {
                w: number;
                h: number;
                name?: string;
                image?: string;
            }
        };
        data: (number)[][];
        objects: GameObject[];
    }
}

export interface Sprite {
    w: number;
    h: number;
    xOffset: number;
    yOffset: number;
    scaleOffsetX: number;
    step: number;
    frameCount: number;
    attackFrame: number;
}

export interface SpriteList {
    frames: {
        [key: string]: Sprite;
    }
}

