
export = RadixRouter;

declare class RadixRouter {
    constructor(options?: RadixRouter.Options);

    insert(route: RadixRouter.Route): void;

    lookup(path: string): RadixRouter.Lookup | null;

    remove(path: string): boolean;

    startsWith(path: String): RadixRouter.Route[];
}


declare namespace RadixRouter {

    export interface Options {
        strict?: boolean;
        routes: Route[];
    }

    export interface Route {
        path: string;
        [x: string]: any;
    }

    export interface Lookup extends Route {
        params: { [k: string]: string };
    }

}
