
export class Loader {
    static async loadGeoJson(path: URL | string): Promise<any> {
        const response = await fetch(path, { method: "GET" });
        const json = await response.json();
        return json;
    }
}