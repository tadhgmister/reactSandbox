export function assert(cond: any, mes: string): asserts cond {
    if(!cond){
        throw new Error(mes)
    }
}
export function Record<K extends keyof any, V>(keys: K[], value: V){
    const result = {} as Record<K, V>;
    for(const k of keys){
        result[k] = value;
    }
    return result;
}