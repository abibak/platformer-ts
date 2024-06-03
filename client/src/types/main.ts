import AudioManager from "@/library/AudioManager";
import Character from "@/objects/Character";

/* Event Bus */
type Callback = (arg?: any) => void;
type Subscriber = Record<string, {[key: string | number]: Callback}>
/* */

export interface Library {
    sounds: Sounds,
}

export interface SoundEntity {
    [key: string]: AudioManager
}

interface SoundEnemy {
    [key: string]: SoundEntity
}

export type Sounds = {
    player: SoundEntity,
    enemies: SoundEnemy,
    world: SoundEntity,
};

export interface AutomatedCharacter {
    character: Character;
    reachedLeftBorder: boolean;
    reachedRightBorder: boolean;
}

export interface Tile {
    w: number;
    h: number;
    x: number;
    y: number;
    type: string;
    img?: HTMLImageElement;
}

export interface CharacterMap {
    id: number;
    type: string;
    name: string;
    x: number;
    y: number;
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
        objects: CharacterMap[];
    }
}