import { createContext } from "react";

export interface QueryBuilderContextValue {
    customOperators: Record<string, CustomOperator>;
    dispatch: React.Dispatch<QueryAction>;
    filters: Filter[];
    filtersByValue: Record<string, FilterOption>;
    flattenedFilters: FlattenedFilter[];
    maxLevels: number;
    operators: OperatorDef[];
    operatorsByType: Record<string, OperatorOption[]>;
    operatorsByValue: Record<string, OperatorDef>;
}

export interface Filter {
    label?: string;
    options: FilterOption[];
}

export interface FilterOption {
    group?: string;
    label: string;
    type: string;
    value: string;
    options?: { label: string; value: string | number }[];
}

export interface FlattenedFilter extends FilterOption {
    group: string;
}

export interface OperatorDef {
    label: string;
    value: string;
    types: string[];
}

export interface OperatorOption {
    label: string;
    value: string;
}

export interface CustomOperator {
    options: OperatorOption[];
    type: string;
}

export interface Rule {
    id?: number;
    field: string | null;
    operator: string | null;
    value: unknown;
    combinator?: string;
    rules?: Rule[];
}

export interface Query {
    id?: number;
    combinator: string;
    rules: Rule[];
}

export type QueryAction =
    | { type: "add-group"; id: number }
    | { type: "add-rule"; id: number }
    | { type: "move-rule"; id: number; removedIndex: number; addedIndex: number }
    | { type: "remove-node"; id: number }
    | { type: "reset-query"; query: Query }
    | { type: "set-combinator"; id: number; value: string }
    | { type: "set-field"; id: number; value: string | null; operator: string | null }
    | { type: "set-operator"; id: number; value: string }
    | { type: "set-value"; id: number; value: unknown };

export default createContext<QueryBuilderContextValue>({
    customOperators: {},
    dispatch: () => {},
    filters: [],
    filtersByValue: {},
    flattenedFilters: [],
    maxLevels: 1,
    operators: [],
    operatorsByType: {},
    operatorsByValue: {},
});
