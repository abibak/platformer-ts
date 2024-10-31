import Character from "@/objects/characters/Character";
import {GameObject} from "@/types/game";

export async function loadImage(modulePath: string): Promise<string | null> {
    try {
        const {default: path} = await import(/* webpackMode: "eager" */ '@/' + modulePath + '.png');
        return path;
    } catch (error) {
        console.log('Error loading module.', modulePath, error);
        return null;
    }
}

export function filterAliveEntities(entities: GameObject[]): GameObject[] {
    return entities.filter((obj: Character) => {
        return !obj.isDead;
    });
}