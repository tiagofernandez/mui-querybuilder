import { dequal } from "dequal";
import { memo, useEffect, useMemo, useReducer, useRef } from "react";

import RuleGroup from "./RuleGroup";
import Context from "./context";
import type {
    CustomOperator,
    Filter,
    FilterOption,
    FlattenedFilter,
    OperatorDef,
    OperatorOption,
    Query,
    QueryAction,
    QueryBuilderContextValue,
    Rule,
} from "./context";
import defaultOperators from "./operators";

/**
 * Allows retrieving filters by value, in O(1) time.
 */
export function generateFiltersByValue(filters: Filter[]): Record<string, FilterOption> {
    const map: Record<string, FilterOption> = {};
    for (const filter of filters) {
        const options = filter.options || [];
        for (const option of options) {
            const { value } = option;
            if (Object.prototype.hasOwnProperty.call(map, value)) {
                throw new Error(`Duplicated filter: ${value}`);
            }
            map[value] = { ...option };
        }
    }
    return map;
}

/**
 * Flattens filters for autocomplete fields.
 */
export function generateFlattenedFilters(filters: Filter[]): FlattenedFilter[] {
    const list: FlattenedFilter[] = [];
    for (const filter of filters) {
        for (const option of filter.options) {
            list.push({
                group: filter.label ?? "",
                ...option,
            });
        }
    }
    return list;
}

/**
 * Sorts filters within their own groups.
 */
export function sortFilterGroupsByLabel(filters: Filter[]): Filter[] {
    for (const filter of filters) {
        filter.options = filter.options.sort((a, b) => a.label.localeCompare(b.label));
    }
    return filters;
}

/**
 * Allows retrieving operators by type, in O(1) time.
 */
export function generateOperatorsByType(
    operators: OperatorDef[],
    customOperators?: Record<string, CustomOperator>,
): Record<string, OperatorOption[]> {
    const map: Record<string, OperatorOption[]> = {};
    const types = [...new Set(operators.flatMap((operator) => operator.types))].sort();

    for (const type of types) {
        if (!Object.prototype.hasOwnProperty.call(map, type)) {
            map[type] = [];
        }
        for (const operator of operators) {
            if (operator.types.includes(type)) {
                map[type].push({
                    label: operator.label,
                    value: operator.value,
                });
            }
        }
    }
    for (const [key, value] of Object.entries(customOperators ?? {})) {
        map[key] = value.options;
    }
    for (const key of Object.keys(map)) {
        map[key] = map[key].sort((a, b) => a.label.localeCompare(b.label));
    }
    return map;
}

/**
 * Allows retrieving operators by value, in O(1) time.
 */
export function generateOperatorsByValue(
    operators: OperatorDef[],
    customOperators?: Record<string, CustomOperator>,
): Record<string, OperatorDef> {
    const map: Record<string, OperatorDef> = {};
    for (const operator of operators) {
        const { value } = operator;
        if (Object.prototype.hasOwnProperty.call(map, value)) {
            throw new Error(`Duplicated operator: ${value}`);
        }
        map[value] = { ...operator };
    }
    for (const customOp of Object.values(customOperators ?? {})) {
        for (const option of customOp.options) {
            if (!Object.prototype.hasOwnProperty.call(map, option.value)) {
                map[option.value] = { types: [], label: option.label, value: option.value };
            }
            map[option.value] = {
                ...map[option.value],
                label: option.label,
                value: option.value,
            };
            const { types } = map[option.value];
            if (!types.includes(customOp.type)) {
                types.push(customOp.type);
            }
        }
    }
    return map;
}

/**
 * Finds a node by ID.
 */
export const findNodeById = (id: number, node: Query | Rule): (Query | Rule) | null => {
    if (node.id === id) {
        return node;
    }
    if ("rules" in node && node.rules) {
        for (const rule of node.rules) {
            const found = findNodeById(id, rule as Query);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

/**
 * Finds a node's parent node by ID.
 */
export const findParentById = (id: number, node: Query | Rule, parent?: Query | Rule): (Query | Rule) | null => {
    const currentParent = parent ?? node;
    if (node.id === id) {
        return currentParent;
    }
    if ("rules" in node && node.rules) {
        for (const rule of node.rules) {
            const found = findParentById(id, rule as Query, node);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

/**
 * Resets a query's node IDs.
 */
export function resetNodeIds(query: Query, mode?: string): Query {
    const random = mode === "random";
    if (random) {
        query.id = query.id ?? Math.random();
    } else {
        query.id = undefined;
    }
    for (const rule of query.rules) {
        if (random) {
            rule.id = rule.id ?? Math.random();
        } else {
            rule.id = undefined;
        }
        if (rule.rules) {
            resetNodeIds(rule as Query, mode);
        }
    }
    return query;
}

/**
 * Deep clones a query.
 */
export function cloneQuery(query: Query): Query {
    return JSON.parse(JSON.stringify(query));
}

/**
 * Formats a query by deleting IDs from all nodes.
 */
export function formatQuery(query: Query): Query {
    let cloned = cloneQuery(query);
    cloned = resetNodeIds(cloned);
    return cloned;
}

/**
 * Verifies if a group is valid, i.e. all rules and nested groups are filled.
 */
export function isGroupValid(group: Query | Rule): boolean {
    if (Object.getOwnPropertyNames(group).length === 0) {
        return false;
    }
    if (!("rules" in group) || !group.rules) {
        return false;
    }
    for (const rule of group.rules) {
        if (rule.rules) {
            if (!isGroupValid(rule)) {
                return false;
            }
        } else if (!isRuleValid(rule)) {
            return false;
        }
    }
    return true;
}

/**
 * Verifies if a rule is valid.
 */
export function isRuleValid(rule: Rule): boolean {
    if (!rule.field || !rule.operator) {
        return false;
    }
    if (/null/gi.test(rule.operator)) {
        return true;
    }
    const { value } = rule;

    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (typeof value === "string") {
        return Boolean(value.trim());
    }
    return value !== null && value !== undefined;
}

/**
 * Verifies if all fields have a corresponding filter.
 */
function verifyFilters(group: Query | Rule, filtersByValue: Record<string, FilterOption>): boolean {
    if (!("rules" in group) || !group.rules) {
        return true;
    }
    for (const rule of group.rules) {
        if (rule.rules) {
            if (!verifyFilters(rule, filtersByValue)) {
                return false;
            }
        } else if (rule.field && !Object.prototype.hasOwnProperty.call(filtersByValue, rule.field)) {
            return false;
        }
    }
    return true;
}

/**
 * Checks if all fields have a corresponding filter.
 */
function isQueryValid(query: Query, context: { filtersByValue?: Record<string, FilterOption> } | null): boolean {
    let valid = isGroupValid(query);
    if (valid && context?.filtersByValue) {
        valid = verifyFilters(query, context.filtersByValue);
    }
    return valid;
}

const emptyRule = (): Rule => ({
    field: null,
    id: Math.random(),
    operator: null,
    value: null,
});

const emptyGroup = (): Rule => ({
    combinator: "and",
    field: null,
    id: Math.random(),
    operator: null,
    value: null,
    rules: [emptyRule()],
});

function reducer(state: Query, action: QueryAction): Query {
    const query = { ...state };

    switch (action.type) {
        case "add-group": {
            const group = findNodeById(action.id, query) as Query;
            group.rules.push(emptyGroup());
            return query;
        }
        case "add-rule": {
            const group = findNodeById(action.id, query) as Query;
            group.rules.push(emptyRule());
            return query;
        }
        case "move-rule": {
            const { addedIndex, id, removedIndex } = action;
            const group = findNodeById(id, query) as Query;
            const item = group.rules[removedIndex];
            group.rules.splice(removedIndex, 1);
            group.rules.splice(addedIndex, 0, item);
            return query;
        }
        case "remove-node": {
            const parent = findParentById(action.id, query) as Query;
            parent.rules = parent.rules.filter((rule) => rule.id !== action.id);
            return query;
        }
        case "reset-query": {
            let { query: newQuery } = action;
            newQuery = resetNodeIds(newQuery, "random");
            return newQuery;
        }
        case "set-combinator": {
            const node = findNodeById(action.id, query) as Query;
            node.combinator = action.value;
            return query;
        }
        case "set-field": {
            const node = findNodeById(action.id, query) as Rule;
            node.field = action.value;
            node.operator = action.operator;
            node.value = null;
            return query;
        }
        case "set-operator": {
            const node = findNodeById(action.id, query) as Rule;
            node.operator = action.value;
            if (/null/.test(action.value)) {
                node.value = null;
            }
            return query;
        }
        case "set-value": {
            const node = findNodeById(action.id, query) as Rule;
            node.value = action.value;
            return query;
        }
        default: {
            return query;
        }
    }
}

interface QueryBuilderProps {
    customOperators?: Record<string, CustomOperator>;
    debug?: boolean;
    filters?: Filter[];
    maxLevels?: number;
    operators?: OperatorDef[];
    onChange?: (query: Query, valid: boolean) => void;
    query?: Query;
    sortFilters?: boolean;
}

const QueryBuilder = memo(
    (props: QueryBuilderProps) => {
        const {
            customOperators = {},
            debug = false,
            filters = [],
            maxLevels = 1,
            operators = [...defaultOperators],
            onChange = null,
            query: queryProp,
            sortFilters = true,
        } = props;

        const initQuery = (q: Query): Query => resetNodeIds({ ...q }, "random");

        const [state, dispatch] = useReducer(
            reducer,
            queryProp ?? {
                combinator: "and",
                rules: [],
            },
            initQuery,
        );

        // Generate the context synchronously with useMemo to avoid re-render loops.
        const context = useMemo<QueryBuilderContextValue>(
            () => ({
                customOperators,
                dispatch,
                filters: sortFilters ? sortFilterGroupsByLabel(filters) : filters,
                filtersByValue: generateFiltersByValue(filters),
                flattenedFilters: generateFlattenedFilters(filters),
                maxLevels,
                operators,
                operatorsByValue: generateOperatorsByValue(operators, customOperators),
                operatorsByType: generateOperatorsByType(operators, customOperators),
            }),
            [dispatch, customOperators, filters, maxLevels, operators, sortFilters],
        );

        // Keep a ref to context for the onChange effect to avoid circular dependencies.
        const contextRef = useRef(context);
        contextRef.current = context;

        // Reset the query if it was changed externally.
        useEffect(() => {
            if (queryProp && !queryProp.id) {
                dispatch({ type: "reset-query", query: queryProp });
            }
        }, [queryProp]);

        // Propagate the change if the query is modified.
        useEffect(() => {
            if (onChange) {
                const valid = isQueryValid(state, contextRef.current);
                onChange(state, valid);
            }
        }, [onChange, state]);

        return state.id && context ? (
            <Context.Provider value={context}>
                <RuleGroup combinator={state.combinator} id={state.id} level={0} rules={state.rules} />
                {debug && (
                    <>
                        <pre>{JSON.stringify(formatQuery(state), null, 4)}</pre>
                        <pre>Valid? {isQueryValid(state, context) ? "true" : "false"}</pre>
                    </>
                )}
            </Context.Provider>
        ) : (
            <span />
        );
    },
    (prevProps, nextProps) => dequal(prevProps.query, nextProps.query),
);

// Static methods attached to the component for public API.
const QueryBuilderWithStatics = QueryBuilder as typeof QueryBuilder & {
    formatQuery: typeof formatQuery;
    isQueryValid: typeof isGroupValid;
    operators: typeof defaultOperators;
};
QueryBuilderWithStatics.formatQuery = formatQuery;
QueryBuilderWithStatics.isQueryValid = isGroupValid;
QueryBuilderWithStatics.operators = defaultOperators;

export default QueryBuilderWithStatics;
