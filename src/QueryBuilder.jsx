import arrayMove from "array-move";
import { dequal } from "dequal";
import PropTypes from "prop-types";
import React from "react";

import Context from "./context";
import operators from "./operators";
import RuleGroup from "./RuleGroup";

/**
 * Allows retrieving filters by value, in O(1) time.
 *
 * @param {Array} filters The data descriptions.
 * @returns {Object} Filters map.
 */
export function generateFiltersByValue(filters) {
    const map = {};
    filters.forEach((filter) => {
        const options = filter.options || [];
        options.forEach((option) => {
            const { value } = option;
            if (Object.prototype.hasOwnProperty.call(map, value)) {
                throw new Error(`Duplicated filter: ${value}`);
            }
            map[value] = { ...option };
        });
    });
    return map;
}

/**
 * Flattens filters for autocomplete fields.
 *
 * @param {Array} filters The data descriptions.
 * @returns {List} Filters list.
 */
export function generateFlattenedFilters(filters) {
    const list = [];
    filters.forEach((filter) => {
        filter.options.forEach((option) => {
            list.push({
                group: filter.label,
                ...option,
            });
        });
    });
    return list;
}

/**
 * Sorts filters within their own groups.
 *
 * @param {Array} filters The data descriptions.
 * @returns {Array} The sorted filters.
 */
export function sortFilterGroupsByLabel(filters) {
    filters.forEach((filter) => {
        filter.options = filter.options.sort((a, b) => a.label.localeCompare(b.label));
    });
    return filters;
}

/**
 * Allows retrieving operators by type, in O(1) time.
 *
 * @param {Array} operators cf. `operators.js`.
 * @param {Object} customOperators Custom operators to be used, if any.
 * @returns {Object} Operators map.
 */
export function generateOperatorsByType(operators, customOperators) {
    const map = {};
    const types = [...new Set([].concat(...operators.map((operator) => operator.types)))].sort();

    types.forEach((type) => {
        if (!Object.prototype.hasOwnProperty.call(map, type)) {
            map[type] = [];
        }
        operators.forEach((operator) => {
            if (operator.types.includes(type)) {
                map[type].push({
                    label: operator.label,
                    value: operator.value,
                });
            }
        });
    });
    Object.entries(customOperators || {}).forEach(([key, value]) => {
        map[key] = value.options;
    });
    Object.keys(map).forEach((key) => {
        map[key] = map[key].sort((a, b) => a.label.localeCompare(b.label));
    });
    return map;
}

/**
 * Allows retrieving operators by value, in O(1) time.
 *
 * @param {Array} operators cf. `operators.js`.
 * @param {Object} customOperators Custom operators to be used, if any.
 * @returns {Object} Operators map.
 */
export function generateOperatorsByValue(operators, customOperators) {
    const map = {};
    operators.forEach((operator) => {
        const { value } = operator;
        if (Object.prototype.hasOwnProperty.call(map, value)) {
            throw new Error(`Duplicated operator: ${value}`);
        }
        map[value] = { ...operator };
    });
    Object.values(customOperators || {}).forEach((value) => {
        value.options.forEach((option) => {
            if (!Object.prototype.hasOwnProperty.call(map, option.value)) {
                map[option.value] = { types: [] };
            }
            map[option.value] = {
                ...map[option.value],
                label: option.label,
                value: option.value,
            };
            const { types } = map[option.value];
            if (!types.includes(value.type)) {
                types.push(value.type);
            }
        });
    });
    return map;
}

/**
 * Finds a node by ID.
 *
 * @param {Number} id The node ID.
 * @param {Object} node The starting node.
 * @returns {Object} The node with the given ID, or null if not found.
 */
export const findNodeById = (id, node) => {
    if (node.id === id) {
        return node;
    }
    if (node.rules) {
        for (const rule of node.rules) {
            const found = findNodeById(id, rule);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

/**
 * Finds a node's parent node by ID.
 *
 * @param {Number} id The node ID.
 * @param {Object} node The starting node.
 * @param {Object} parent The starting parent.
 * @returns {Object} The searched node's parent.
 */
export const findParentById = (id, node, parent) => {
    if (!parent) {
        parent = node;
    }
    if (node.id === id) {
        return parent;
    }
    if (node.rules) {
        parent = node;
        for (const rule of node.rules) {
            const found = findParentById(id, rule, parent);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

/**
 * Resets a query's node IDs.
 *
 * @param {Object} query A query with rules.
 * @param {string} mode "random" to set random IDs, or anything else to delete existing ones.
 * @returns {Object} The processed query instance.
 */
export function resetNodeIds(query, mode) {
    const random = mode === "random";
    if (random) {
        query.id = query.id || Math.random();
    } else {
        delete query.id;
    }
    query.rules.map((rule) => {
        if (random) {
            rule.id = rule.id || Math.random();
        } else {
            delete rule.id;
        }
        if (rule.rules) {
            resetNodeIds(rule, mode);
        }
        return rule;
    });
    return query;
}

/**
 * Deep clones a query.
 *
 * @param {Object} query The query to be cloned.
 * @returns {Object} Another instance of the given query.
 */
export function cloneQuery(query) {
    return JSON.parse(JSON.stringify(query));
}

/**
 * Formats a query by deleting IDs from all nodes.
 *
 * @param {Object} query The query to be formatted.
 * @returns {Object} Another instance of the given query, without IDs.
 */
export function formatQuery(query) {
    query = cloneQuery(query);
    query = resetNodeIds(query);
    return query;
}

/**
 * Verifies if a group is valid, i.e. all rules and nested groups are filled.
 *
 * @param {Object} group The group to validate.
 * @returns {Boolean} True if valid, false otherwise.
 */
export function isGroupValid(group) {
    if (Object.getOwnPropertyNames(group).length === 0) {
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
 *
 * @param {Object} rule The rule to validate.
 * @returns {Boolean} True if valid, false otherwise.
 */
export function isRuleValid(rule) {
    if (!rule.field || !rule.operator) {
        return false;
    }
    if (/null/gi.test(rule.operator)) {
        return true;
    }
    const { value } = rule;

    if (Array.isArray(value)) {
        return value?.length > 0;
    }
    if (/string/.test(typeof value)) {
        return Boolean(value?.trim());
    }
    return value !== null && value !== undefined;
}

/**
 * Verifies if all fields have a corresponding filter.
 *
 * @param {Object} group The group to validate.
 * @param {Object} filtersByValue The filters to check against.
 * @returns {Boolean} True if valid, false otherwise.
 */
function verifyFilters(group, filtersByValue) {
    for (const rule of group.rules) {
        if (rule.rules) {
            if (!verifyFilters(rule, filtersByValue)) {
                return false;
            }
        } else if (!Object.prototype.hasOwnProperty.call(filtersByValue, rule.field)) {
            return false;
        }
    }
    return true;
}

/**
 * Checks if all fields have a corresponding filter.
 *
 * @param {Object} state The query to validate.
 * @param {Object} context The context with filters to check against.
 * @returns {Boolean} True if valid, false otherwise.
 */
function isQueryValid(query, context) {
    let valid = isGroupValid(query);

    // Check the query is consistent with the available filters.
    if (valid && context?.filtersByValue) {
        valid = verifyFilters(query, context.filtersByValue);
    }
    return valid;
}

const emptyRule = function () {
    return {
        field: null,
        id: Math.random(),
        operator: null,
        value: null,
    };
};

const emptyGroup = function () {
    return {
        combinator: "and",
        id: Math.random(),
        rules: [emptyRule()],
    };
};

function reducer(state, action) {
    const query = { ...state };

    switch (action.type) {
        case "add-group": {
            const group = findNodeById(action.id, query);
            group.rules.push(emptyGroup());
            return query;
        }
        case "add-rule": {
            const group = findNodeById(action.id, query);
            group.rules.push(emptyRule());
            return query;
        }
        case "move-rule": {
            const { addedIndex, id, removedIndex } = action;
            const group = findNodeById(id, query);
            group.rules = arrayMove(group.rules, removedIndex, addedIndex);
            return query;
        }
        case "remove-node": {
            const parent = findParentById(action.id, query);
            parent.rules = parent.rules.filter((rule) => rule.id !== action.id);
            return query;
        }
        case "reset-query": {
            let { query } = action;
            query = resetNodeIds(query, "random");
            return query;
        }
        case "set-combinator": {
            const node = findNodeById(action.id, query);
            node.combinator = action.value;
            return query;
        }
        case "set-field": {
            const node = findNodeById(action.id, query);
            node.field = action.value;
            node.operator = action.operator;
            node.value = null;
            return query;
        }
        case "set-operator": {
            const node = findNodeById(action.id, query);
            node.operator = action.value;
            if (/null/.test(action.value)) {
                node.value = null;
            }
            return query;
        }
        case "set-value": {
            const node = findNodeById(action.id, query);
            node.value = action.value;
            return query;
        }
        default: {
            return query;
        }
    }
}

const QueryBuilder = React.memo(
    (props) => {
        const [state, dispatch] = React.useReducer(
            reducer,
            props.query || {
                combinator: "and",
                rules: [],
            }
        );
        const [context, setContext] = React.useState(null);

        // Generate the context only once, or when the properties change.
        React.useEffect(() => {
            const { customOperators, filters, maxLevels, operators } = props;
            setContext({
                customOperators,
                dispatch,
                filters: props.sortFilters ? sortFilterGroupsByLabel(filters) : filters,
                filtersByValue: generateFiltersByValue(filters),
                flattenedFilters: generateFlattenedFilters(filters),
                maxLevels,
                operators,
                operatorsByValue: generateOperatorsByValue(operators, customOperators),
                operatorsByType: generateOperatorsByType(operators, customOperators),
            });
        }, [dispatch, props, props.filters, props.maxLevels, props.operators]);

        // Reset the query if it was changed externally.
        React.useEffect(() => {
            if (!props.query?.id) {
                dispatch({ type: "reset-query", query: props.query });
            }
        }, [props.query]);

        // Propagate the change if the query is modified.
        React.useEffect(() => {
            if (props.onChange) {
                const valid = isQueryValid(state, context);
                props.onChange(state, valid);
            }
        }, [context, props, props.onChange, state]);

        return state.id && context ? (
            <Context.Provider value={context}>
                <RuleGroup combinator={state.combinator} id={state.id} level={0} rules={state.rules} />
                {props.debug && (
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
    (prevProps, nextProps) => {
        // Skip re-rendering if the query didn't change.
        return dequal(prevProps.query, nextProps.query);
    }
);

QueryBuilder.formatQuery = formatQuery;
QueryBuilder.isQueryValid = isGroupValid;
QueryBuilder.operators = operators;

QueryBuilder.defaultProps = {
    customOperators: {},
    debug: false,
    filters: [],
    maxLevels: 1,
    operators: [...operators],
    onChange: null,
    query: emptyGroup(),
    sortFilters: true,
};

QueryBuilder.propTypes = {
    customOperators: PropTypes.object,
    debug: PropTypes.bool,
    filters: PropTypes.array,
    maxLevels: PropTypes.number,
    operators: PropTypes.array,
    onChange: PropTypes.func,
    query: PropTypes.object,
    sortFilters: PropTypes.bool,
};

export default QueryBuilder;
