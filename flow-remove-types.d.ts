declare module "flow-remove-types" {
    function flowRemoveTypes(source: string): { toString(): string };
    export default flowRemoveTypes;
}