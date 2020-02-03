function wrap<C extends new()=>any>(Cls: C ){
    // do stuff...
}
function deco(proto: any, field: string, desc?: any){
    // do stuff...
}
export class ClassName {
    public static E = wrap(ClassName);
    @deco
    x = "hello"
}