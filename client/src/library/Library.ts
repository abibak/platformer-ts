import AudioManager from "@/library/AudioManager";
import {SoundEntity, Sounds} from "@/types/main";

export default class Library implements Library {
    private _sounds: Sounds;

    public constructor() {
        this._sounds = {
            player: {
                jump: new AudioManager('player/jump1.wav', 0.4),
                attack: new AudioManager('player/attack_sword1.mp3'),
                run: new AudioManager('player/run1.wav'),
                hit: new AudioManager('player/attack_sword1.mp3'),
                'sword_miss': new AudioManager('player/sword_miss1.wav', 0.3),
            },
            enemies: {
                'fire-worm': {
                    jump: new AudioManager('player/jump1.wav', 0.4),
                }
            },
            world: {
                'light_ambient1': new AudioManager('world/light_ambience1.wav'),
                'light_ambient2': new AudioManager('world/light_ambience2.wav'),
            }
        }
    }

    public sounds(entity: string): SoundEntity {
        return this._sounds[entity];
    }
}