import { SimpleRenderer } from "../../index";
import { FeatureClass } from "../element/FeatureClass";
import { GeometryType } from "../geometry/Geometry";
import { FeatureLayer } from "../layer/FeatureLayer";
import { Renderer } from "../render/renderer/Renderer";
import { Loader } from "./Loader";

interface configURL {
    url: URL,
    name?: string,
    type: GeometryType
    description?: string,
    alias?: string,
    renderer?: Renderer
}

interface configObj {
    data: any,
    name?: string,
    type: GeometryType
    description?: string,
    alias?: string,
    renderer?: Renderer
}


export async function createElementByURL(obj: configURL): Promise<FeatureLayer> {
    const fc = FeatureClass.fromGeoJson({
        name: obj.name ? obj.name : "",
        type: obj.type,
        data: await Loader.loadGeoJson(obj.url),
        alias: obj.alias ? obj.alias : "",
        description: obj.description ? obj.description : ""
    });
    const renderer = obj.renderer ? obj.renderer : new SimpleRenderer(obj.type);
    const fl = new FeatureLayer(fc, renderer);
    
    fl.name = obj.name;
    fl.description = obj.description;
    return fl;
}

export async function createElementByObj(obj: configObj): Promise<FeatureLayer> {
    const fc = FeatureClass.fromGeoJson({
        name: obj.name ? obj.name : "",
        type: obj.type,
        data: obj.data,
        alias: obj.alias ? obj.alias : "",
        description: obj.description ? obj.description : ""
    });
    const renderer = obj.renderer ? obj.renderer : new SimpleRenderer(obj.type);
    const fl = new FeatureLayer(fc, renderer);
    fl.name = obj.name;
    fl.description = obj.description;
    return fl;
}