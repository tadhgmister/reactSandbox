import { ObjectKeys } from "./lib/util";

export default null;

// class MyArray<T> {
//     getElemAtIndex(index: number) {
//         return (null as any) as T;
//     }
//     map<U>(fn: (elem: T) => U): MyArray<U> {
//         return null as any;
//     }
// }
// // interface MyArray<T> {
// //     getElem: (index: number) => T;
// // }

// declare const array: MyArray<string>;

// let x = array.map((str) => Number(str));

// /**
//  * takes an object and a function to convert each key: value to a new value
//  * function takes value as first argument so passing functions like `Number` will take value as first argument.
//  */
// // fn<U>: (thing: T) => U
// function ObjectMap1<K extends string, T, U>(oldObj: Record<K, T>, fn: (thing: T, key: K) => U) {
//     const newObj = {} as Record<K, U>;
//     for (const propertyName of ObjectKeys(oldObj)) {
//         newObj[propertyName] = fn(oldObj[propertyName], propertyName);
//     }
//     return newObj;
// }
// function ObjectMap2<T, U>(oldObj: T, fn: (value: T[keyof T], key: keyof T) => U) {
//     const newObj = {} as Record<keyof T, U>;
//     for (const propertyName of ObjectKeys(oldObj)) {
//         newObj[propertyName] = fn(oldObj[propertyName], propertyName);
//     }
//     return newObj;
// }
// const data = { a: "1", b: "2", c: "3" };
// const result1 = ObjectMap1(data, Number);
// const result2 = ObjectMap2(data, Number);
