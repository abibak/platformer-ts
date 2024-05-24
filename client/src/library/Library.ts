import AudioManager from "@/library/AudioManager";
import {SoundEntity, Sounds} from "@/types/main";

export default class Library implements Library {
    private _sounds: Sounds;

    public constructor() {
        this._sounds = {
            player: {
                jump: new AudioManager('jump1.wav', 0.4),
                attack: new AudioManager('attack_sword1.mp3'),
                run: new AudioManager('walk_stone1.mp3'),
                hit: new AudioManager('attack_sword1.mp3'),
                'sword_miss': new AudioManager('sword_miss1.wav', 0.4),
            },
            enemies: {
                'fire-worm': {
                    jump: new AudioManager('jump1.wav', 0.4),
                    attack: new AudioManager('attack_sword1.mp3'),
                    run: new AudioManager('attack_sword1.mp3'),
                }
            }
        }
    }

    public sounds(entity: string): SoundEntity {
        return this._sounds[entity];
    }
}