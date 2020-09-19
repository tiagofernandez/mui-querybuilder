import {
    cloneQuery,
    formatQuery,
    generateFiltersByValue,
    generateOperatorsByType,
    generateOperatorsByValue,
    findNodeById,
    findParentById,
    isGroupValid,
    isRuleValid,
    resetNodeIds,
    sortFilterGroupsByLabel,
} from "../src/QueryBuilder";

import operators from "../src/operators";

const filters = [
    {
        label: "Fruits",
        options: [
            {
                label: "Citrus",
                type: "multiselect",
                options: [
                    {
                        label: "Lime",
                        value: "lime",
                    },
                    {
                        label: "Orange",
                        value: "orange",
                    },
                ],
                value: "citrus",
            },
            {
                label: "Tropical",
                type: "multiselect",
                options: [
                    {
                        label: "Banana",
                        value: "banana",
                    },
                    {
                        label: "Mango",
                        value: "mango",
                    },
                ],
                value: "tropical",
            },
            {
                label: "Keyword",
                type: "keyword",
                value: "madrid",
            },
        ],
    },
];

const query = {
    id: 1,
    combinator: "and",
    rules: [
        {
            id: 2,
            field: "citrus",
            operator: "in",
            value: ["lime"],
        },
        {
            id: 3,
            field: "tropical",
            operator: "not_in",
            value: "banana",
        },
    ],
};

const customOperators = {
    keyword: {
        options: [
            {
                label: "is exactly",
                value: "exactly"
            },
            {
                label: "is not exactly",
                value: "not_exactly"
            }
        ],
        type: "text",
    },
};

test("clones an existing query", async () => {
    const result = cloneQuery(query);
    expect(result).not.toBe(query);
});

test("formats the current query", async () => {
    const clonedQuery = cloneQuery(query);
    const result = formatQuery(clonedQuery);
    expect(result.id).toBeUndefined();
});

test("generates filters by value", async () => {
    const result = generateFiltersByValue(filters);
    expect(result).toEqual({
        citrus: {
            label: "Citrus",
            options: [
                { label: "Lime", value: "lime" },
                { label: "Orange", value: "orange" },
            ],
            type: "multiselect",
            value: "citrus",
        },
        tropical: {
            label: "Tropical",
            options: [
                { label: "Banana", value: "banana" },
                { label: "Mango", value: "mango" },
            ],
            type: "multiselect",
            value: "tropical",
        },
        madrid: {
            label: "Keyword",
            type: "keyword",
            value: "madrid",
        },
    });
});

test("sorts grouped filters by label", async () => {
    expect(sortFilterGroupsByLabel([
        { options: [{ label: "B" }, { label: "A" }] },
        { options: [{ label: "Z" }, { label: "X" }, { label: "Y" }] },
    ])).toEqual([
        { options: [{ label: "A" }, { label: "B" }] },
        { options: [{ label: "X" }, { label: "Y" }, { label: "Z" }] },
    ]);
});

test("generates operators by type", async () => {
    const result = generateOperatorsByType(operators, customOperators);
    expect(result).toEqual({
        date: [
            { label: 'after or equal to', value: 'after_equal' },
            { label: 'after than', value: 'after' },
            { label: 'before or equal to', value: 'before_equal' },
            { label: 'before than', value: 'before' },
            { label: 'equal to', value: 'equal' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        integer: [
            { label: 'equal to', value: 'equal' },
            { label: 'greater or equal to', value: 'greater_equal' },
            { label: 'greater than', value: 'greater' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'less or equal to', value: 'less_equal' },
            { label: 'less than', value: 'less' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        multiselect: [
            { label: 'in', value: 'in' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'not in', value: 'not_in' },
        ],
        number: [
            { label: 'equal to', value: 'equal' },
            { label: 'greater or equal to', value: 'greater_equal' },
            { label: 'greater than', value: 'greater' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'less or equal to', value: 'less_equal' },
            { label: 'less than', value: 'less' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        radio: [
            { label: 'equal to', value: 'equal' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        select: [
            { label: 'equal to', value: 'equal' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        switch: [
            { label: 'equal to', value: 'equal' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        text: [
            { label: 'contains', value: 'contains' },
            { label: 'does not contain', value: 'not_contains' },
            { label: 'equal to', value: 'equal' },
            { label: 'is not null', value: 'not_null' },
            { label: 'is null', value: 'null' },
            { label: 'not equal to', value: 'not_equal' },
        ],
        keyword: [
            { label: 'is exactly', value: 'exactly' },
            { label: 'is not exactly', value: 'not_exactly' },
        ],
    });
});

test("generates operators by value", async () => {
    const result = generateOperatorsByValue(operators, customOperators);
    expect(result).toEqual({
        equal: {
            label: "equal to",
            value: "equal",
            types: [
                "date",
                "integer",
                "number",
                "radio",
                "select",
                "switch",
                "text"
            ]
        },
        not_equal: {
            label: "not equal to",
            value: "not_equal",
            types: [
                "date",
                "integer",
                "number",
                "radio",
                "select",
                "switch",
                "text"
            ]
        },
        contains: {
            label: "contains",
            value: "contains",
            types: [
                "text"
            ]
        },
        not_contains: {
            label: "does not contain",
            value: "not_contains",
            types: [
                "text"
            ]
        },
        less: {
            label: "less than",
            value: "less",
            types: [
                "number",
                "integer"
            ]
        },
        before: {
            label: "before than",
            value: "before",
            types: [
                "date"
            ]
        },
        greater: {
            label: "greater than",
            value: "greater",
            types: [
                "number",
                "integer"
            ]
        },
        after: {
            label: "after than",
            value: "after",
            types: [
                "date"
            ]
        },
        less_equal: {
            label: "less or equal to",
            value: "less_equal",
            types: [
                "number",
                "integer"
            ]
        },
        greater_equal: {
            label: "greater or equal to",
            value: "greater_equal",
            types: [
                "number",
                "integer"
            ]
        },
        before_equal: {
            label: "before or equal to",
            value: "before_equal",
            types: [
                "date"
            ]
        },
        after_equal: {
            label: "after or equal to",
            value: "after_equal",
            types: [
                "date"
            ]
        },
        in: {
            label: "in",
            value: "in",
            types: [
                "multiselect",
            ]
        },
        not_in: {
            label: "not in",
            value: "not_in",
            types: [
                "multiselect",
            ]
        },
        null: {
            label: "is null",
            value: "null",
            types: [
                "date",
                "integer",
                "number",
                "multiselect",
                "radio",
                "select",
                "switch",
                "text"
            ]
        },
        not_null: {
            label: "is not null",
            value: "not_null",
            types: [
                "date",
                "integer",
                "number",
                "multiselect",
                "radio",
                "select",
                "switch",
                "text"
            ]
        },
        exactly: {
            label: "is exactly",
            value: "exactly",
            types: [
                "text"
            ]
        },
        not_exactly: {
            label: "is not exactly",
            value: "not_exactly",
            types: [
                "text"
            ]
        },
    });
});

test("finds node by id", async () => {
    const result = findNodeById(2, query);
    expect(result).toEqual({
        id: 2,
        field: "citrus",
        operator: "in",
        value: ["lime"],
    });
});

test("finds parent by node id", async () => {
    const result = findParentById(3, query);
    expect(result).toEqual(query);
});

test("resets node ids", async () => {
    const clonedQuery = cloneQuery(query);
    const result = resetNodeIds(clonedQuery);
    expect(result.id).toBeUndefined();
});

test("validates a rule without field", async () => {
    expect(
        isRuleValid({
            field: null,
            operator: "in",
            value: ["value"],
        },
    )).toBe(false);
});

test("validates a rule without operator", async () => {
    expect(
        isRuleValid({
            field: "field",
            operator: null,
            value: null,
        },
    )).toBe(false);
});

test("validates a rule with null operator", async () => {
    expect(
        isRuleValid({
            field: "field",
            operator: "null",
            value: null,
        },
    )).toBe(true);
    expect(
        isRuleValid({
            field: "field",
            operator: "not_null",
            value: null,
        },
    )).toBe(true);
});

test("validates a rule with array value", async () => {
    expect(
        isRuleValid({
            field: "field",
            operator: "in",
            value: ["value"],
        },
    )).toBe(true);
    expect(
        isRuleValid({
            field: "field",
            operator: "in",
            value: [],
        },
    )).toBe(false);
});

test("validates a rule with boolean value", async () => {
    expect(
        isRuleValid({
            field: "field",
            operator: "equal",
            value: true,
        },
    )).toBe(true);
});

test("validates a rule with numeric value", async () => {
    expect(
        isRuleValid({
            field: "field",
            operator: "equal",
            value: -1,
        },
    )).toBe(true);
    expect(
        isRuleValid({
            field: "field",
            operator: "equal",
            value: 0,
        },
    )).toBe(true);
    expect(
        isRuleValid({
            field: "field",
            operator: "equal",
            value: 1.5,
        },
    )).toBe(true);
});

test("validates a rule with string value", async () => {
    expect(
        isRuleValid({
            field: "field",
            operator: "equal",
            value: "1982-08-20",
        },
    )).toBe(true);
});

test("validates an incomplete one-level group", async () => {
    expect(
        isGroupValid({
            combinator: "and",
            rules: [
                {
                    field: "field1",
                    operator: "in",
                    value: ["value"],
                },
                {
                    field: "field2",
                    operator: "not_in",
                    value: [],
                },
            ],
        },
    )).toBe(false);
});

test("validates an incomplete two-level group", async () => {
    expect(
        isGroupValid({
            combinator: "and",
            rules: [
                {
                    field: "field1",
                    operator: "in",
                    value: ["value"],
                },
                {
                    combinator: "and",
                    rules: [
                        {
                            field: "field2",
                            operator: "not_in",
                            value: [],
                        },
                    ],
                },
            ],
        },
    )).toBe(false);
});

test("validates a complete group", async () => {
    expect(
        isGroupValid({
            combinator: "and",
            rules: [
                {
                    field: "field1",
                    operator: "in",
                    value: ["value"],
                },
                {
                    combinator: "and",
                    rules: [
                        {
                            field: "field2",
                            operator: "not_in",
                            value: ["value"],
                        },
                    ],
                },
            ],
        },
    )).toBe(true);
});
