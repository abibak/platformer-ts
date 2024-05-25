import AudioManager from "@/library/AudioManager";

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