export async function loadImage(modulePath: string): Promise<string | null> {
    try {
        const {default: path} = await import(/* webpackMode: "eager" */ '@/' + modulePath + '.png');
        return path;
    } catch (error) {
        console.log('Error loading module.', modulePath, error);
        return null;
    }
}