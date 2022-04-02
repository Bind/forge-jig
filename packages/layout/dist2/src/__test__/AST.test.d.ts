declare type SlotAssertion = {
    name: string;
    offset?: number;
    slot?: number;
    children?: SlotAssertion[];
};
declare type Assertions = {
    [key: string]: {
        name: string;
        storage: boolean;
        expectedSlots: number;
        variables: string[];
        explicitSlotChecks: SlotAssertion[];
    };
};
export declare const assertions: Assertions;
export {};
//# sourceMappingURL=AST.test.d.ts.map