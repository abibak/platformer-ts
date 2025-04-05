import Character from "@/objects/characters/Character";

export async function loadImage(modulePath: string): Promise<string | null> {
    try {
        const {default: path} = await import(/* webpackMode: "eager" */ '@/' + modulePath + '.png');
        return path;
    } catch (error) {
        console.log('Error loading module.', modulePath, error);
        return null;
    }
}

export function random(max: number, min: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

