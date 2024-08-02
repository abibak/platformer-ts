import Character from "@/objects/Character";
import {Tile} from "@/types/main";

export async function loadImage(modulePath: string): Promise<string | null> {
    try {
        const {default: path} = await import(/* webpackMode: "eager" */ '@/' + modulePath + '.png');
        return path;
    } catch (error) {
        console.log('Error loading module.', modulePath, error);
        return null;
    }
}

export function filterAliveEntities(entities: Character[]): Character[] {
    return entities.filter((obj: Character) => {
        return !obj.isDead;
    });
}

export function filterMapObjects(objs: (Tile | Character)[]): (Tile | Character)[] {
    return objs.filter((obj: (Tile | Character)) => {
        if (obj instanceof Character) {
            return !obj.isDead;
        }

        return true;
    })
}