export function assert(cond: any, mes: string): asserts cond {
    if(!cond){
        throw new Error(mes)
    }
}