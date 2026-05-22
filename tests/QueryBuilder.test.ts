import { describe, expect, test } from "vitest";

import {
    cloneQuery,
    findNodeById,
    findParentById,
    formatQuery,
    generateFiltersByValue,
    generateFlattenedFilters,
    generateOperatorsByType,
    generateOperatorsByValue,
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
                    { label: "Lime", value: "lime" },
                    { label: "Orange", value: "orange" },
                ],
                value: "citrus",
            },
            {
                label: "Tropical",
                type: "multiselect",
                options: [
                    { label: "Banana", value: "banana" },
                    { label: "Mango", value: "mango" },
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
            { label: "is exactly", value: "exactly" },
            { label: "is not exactly", value: "not_exactly" },
        ],
        type: "text",
    },
};

// ─── cloneQuery ─────────────────────────────────────────────────────────────────

describe("cloneQuery", () => {
    test("clones an existing query", () => {
        const result = cloneQuery(query);
        expect(result).not.toBe(query);
        expect(result).toEqual(query);
    });
});

// ─── formatQuery ────────────────────────────────────────────────────────────────

describe("formatQuery", () => {
    test("formats the current query by removing IDs", () => {
        const clonedQuery = cloneQuery(query);
        const result = formatQuery(clonedQuery);
        expect(result.id).toBeUndefined();
        for (const rule of result.rules) {
            expect(rule.id).toBeUndefined();
        }
    });
});

// ─── generateFiltersByValue ─────────────────────────────────────────────────────

describe("generateFiltersByValue", () => {
    test("generates a map of filters keyed by value", () => {
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

    test("throws on duplicated filter values", () => {
        const dupeFilters = [
            {
                label: "Group",
                options: [
                    { label: "A", type: "text", value: "dup" },
                    { label: "B", type: "text", value: "dup" },
                ],
            },
        ];
        expect(() => generateFiltersByValue(dupeFilters)).toThrow("Duplicated filter: dup");
    });

    test("returns empty object for empty filters", () => {
        expect(generateFiltersByValue([])).toEqual({});
    });
});

// ─── generateFlattenedFilters ───────────────────────────────────────────────────

describe("generateFlattenedFilters", () => {
    test("flattens grouped filters with their group label", () => {
        const result = generateFlattenedFilters(filters);
        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({
            group: "Fruits",
            label: "Citrus",
            type: "multiselect",
            options: [
                { label: "Lime", value: "lime" },
                { label: "Orange", value: "orange" },
            ],
            value: "citrus",
        });
    });

    test("uses empty string for groups without a label", () => {
        const result = generateFlattenedFilters([
            { options: [{ label: "X", type: "text", value: "x" }] },
        ]);
        expect(result[0].group).toBe("");
    });
});

// ─── sortFilterGroupsByLabel ────────────────────────────────────────────────────

describe("sortFilterGroupsByLabel", () => {
    test("sorts filters within their groups by label", () => {
        const input = [
            { options: [{ label: "B" }, { label: "A" }] },
            { options: [{ label: "Z" }, { label: "X" }, { label: "Y" }] },
        ] as any;
        const result = sortFilterGroupsByLabel(input);
        expect(result).toEqual([
            { options: [{ label: "A" }, { label: "B" }] },
            { options: [{ label: "X" }, { label: "Y" }, { label: "Z" }] },
        ]);
    });
});

// ─── generateOperatorsByType ────────────────────────────────────────────────────

describe("generateOperatorsByType", () => {
    test("generates operator options grouped by type", () => {
        const result = generateOperatorsByType(operators, customOperators);
        expect(result).toEqual({
            date: [
                { label: "after", value: "after" },
                { label: "after or equal to", value: "after_equal" },
                { label: "before", value: "before" },
                { label: "before or equal to", value: "before_equal" },
                { label: "equal to", value: "equal" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "not equal to", value: "not_equal" },
            ],
            integer: [
                { label: "equal to", value: "equal" },
                { label: "greater or equal to", value: "greater_equal" },
                { label: "greater than", value: "greater" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "less or equal to", value: "less_equal" },
                { label: "less than", value: "less" },
                { label: "not equal to", value: "not_equal" },
            ],
            multiselect: [
                { label: "in", value: "in" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "not in", value: "not_in" },
            ],
            number: [
                { label: "equal to", value: "equal" },
                { label: "greater or equal to", value: "greater_equal" },
                { label: "greater than", value: "greater" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "less or equal to", value: "less_equal" },
                { label: "less than", value: "less" },
                { label: "not equal to", value: "not_equal" },
            ],
            radio: [
                { label: "equal to", value: "equal" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "not equal to", value: "not_equal" },
            ],
            select: [
                { label: "equal to", value: "equal" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "not equal to", value: "not_equal" },
            ],
            switch: [
                { label: "equal to", value: "equal" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "not equal to", value: "not_equal" },
            ],
            text: [
                { label: "contains", value: "contains" },
                { label: "does not contain", value: "not_contains" },
                { label: "equal to", value: "equal" },
                { label: "is not null", value: "not_null" },
                { label: "is null", value: "null" },
                { label: "not equal to", value: "not_equal" },
            ],
            keyword: [
                { label: "is exactly", value: "exactly" },
                { label: "is not exactly", value: "not_exactly" },
            ],
        });
    });

    test("works without custom operators", () => {
        const result = generateOperatorsByType(operators);
        expect(result.text).toBeDefined();
        expect(result.keyword).toBeUndefined();
    });
});

// ─── generateOperatorsByValue ───────────────────────────────────────────────────

describe("generateOperatorsByValue", () => {
    test("generates operators keyed by value", () => {
        const result = generateOperatorsByValue(operators, customOperators);
        expect(result.equal.label).toBe("equal to");
        expect(result.before.label).toBe("before");
        expect(result.after.label).toBe("after");
        expect(result.exactly.label).toBe("is exactly");
        expect(result.exactly.types).toContain("text");
    });

    test("throws on duplicated operator values", () => {
        const dupeOps = [
            { label: "A", value: "dup", types: ["text"] },
            { label: "B", value: "dup", types: ["text"] },
        ];
        expect(() => generateOperatorsByValue(dupeOps)).toThrow("Duplicated operator: dup");
    });
});

// ─── findNodeById ───────────────────────────────────────────────────────────────

describe("findNodeById", () => {
    test("finds a node by id", () => {
        const result = findNodeById(2, query);
        expect(result).toEqual({
            id: 2,
            field: "citrus",
            operator: "in",
            value: ["lime"],
        });
    });

    test("returns the root node when id matches root", () => {
        const result = findNodeById(1, query);
        expect(result).toBe(query);
    });

    test("returns null when node is not found", () => {
        const result = findNodeById(999, query);
        expect(result).toBeNull();
    });
});

// ─── findParentById ─────────────────────────────────────────────────────────────

describe("findParentById", () => {
    test("finds parent by node id", () => {
        const result = findParentById(3, query);
        expect(result).toEqual(query);
    });

    test("returns the root itself when searching for root id", () => {
        const result = findParentById(1, query);
        expect(result).toBe(query);
    });

    test("returns null when id is not found", () => {
        const result = findParentById(999, query);
        expect(result).toBeNull();
    });
});

// ─── resetNodeIds ───────────────────────────────────────────────────────────────

describe("resetNodeIds", () => {
    test("removes all node ids by default", () => {
        const clonedQuery = cloneQuery(query);
        const result = resetNodeIds(clonedQuery);
        expect(result.id).toBeUndefined();
        for (const rule of result.rules) {
            expect(rule.id).toBeUndefined();
        }
    });

    test('assigns random ids in "random" mode', () => {
        const clonedQuery = cloneQuery(query);
        // Remove existing ids first
        clonedQuery.id = undefined;
        for (const rule of clonedQuery.rules) {
            rule.id = undefined;
        }
        const result = resetNodeIds(clonedQuery, "random");
        expect(result.id).toBeDefined();
        expect(typeof result.id).toBe("number");
        for (const rule of result.rules) {
            expect(rule.id).toBeDefined();
        }
    });

    test("preserves existing ids in random mode", () => {
        const clonedQuery = cloneQuery(query);
        const result = resetNodeIds(clonedQuery, "random");
        expect(result.id).toBe(1);
        expect(result.rules[0].id).toBe(2);
    });
});

// ─── isRuleValid ────────────────────────────────────────────────────────────────

describe("isRuleValid", () => {
    test("invalid when field is null", () => {
        expect(isRuleValid({ field: null, operator: "in", value: ["value"] })).toBe(false);
    });

    test("invalid when operator is null", () => {
        expect(isRuleValid({ field: "field", operator: null, value: null })).toBe(false);
    });

    test("valid with null operator (is null / is not null)", () => {
        expect(isRuleValid({ field: "field", operator: "null", value: null })).toBe(true);
        expect(isRuleValid({ field: "field", operator: "not_null", value: null })).toBe(true);
    });

    test("valid/invalid with array value", () => {
        expect(isRuleValid({ field: "field", operator: "in", value: ["value"] })).toBe(true);
        expect(isRuleValid({ field: "field", operator: "in", value: [] })).toBe(false);
    });

    test("valid with boolean value", () => {
        expect(isRuleValid({ field: "field", operator: "equal", value: true })).toBe(true);
        expect(isRuleValid({ field: "field", operator: "equal", value: false })).toBe(true);
    });

    test("valid with numeric values including 0 and negatives", () => {
        expect(isRuleValid({ field: "field", operator: "equal", value: -1 })).toBe(true);
        expect(isRuleValid({ field: "field", operator: "equal", value: 0 })).toBe(true);
        expect(isRuleValid({ field: "field", operator: "equal", value: 1.5 })).toBe(true);
    });

    test("valid with non-empty string value", () => {
        expect(isRuleValid({ field: "field", operator: "equal", value: "1982-08-20" })).toBe(true);
    });

    test("invalid with null or undefined value", () => {
        expect(isRuleValid({ field: "field", operator: "equal", value: null })).toBe(false);
        expect(isRuleValid({ field: "field", operator: "equal", value: undefined })).toBe(false);
    });

    test("invalid with whitespace-only string value", () => {
        expect(isRuleValid({ field: "field", operator: "equal", value: "   " })).toBe(false);
    });
});

// ─── isGroupValid ───────────────────────────────────────────────────────────────

describe("isGroupValid", () => {
    test("invalid for empty object", () => {
        expect(isGroupValid({} as any)).toBe(false);
    });

    test("invalid for incomplete one-level group", () => {
        expect(
            isGroupValid({
                combinator: "and",
                rules: [
                    { field: "field1", operator: "in", value: ["value"] },
                    { field: "field2", operator: "not_in", value: [] },
                ],
            }),
        ).toBe(false);
    });

    test("invalid for incomplete two-level group", () => {
        expect(
            isGroupValid({
                combinator: "and",
                rules: [
                    { field: "field1", operator: "in", value: ["value"] },
                    {
                        combinator: "and",
                        rules: [{ field: "field2", operator: "not_in", value: [] }],
                    },
                ],
            }),
        ).toBe(false);
    });

    test("valid for complete group", () => {
        expect(
            isGroupValid({
                combinator: "and",
                rules: [
                    { field: "field1", operator: "in", value: ["value"] },
                    {
                        combinator: "and",
                        rules: [{ field: "field2", operator: "not_in", value: ["value"] }],
                    },
                ],
            }),
        ).toBe(true);
    });

    test("valid for group with all null operators", () => {
        expect(
            isGroupValid({
                combinator: "and",
                rules: [{ field: "field1", operator: "null", value: null }],
            }),
        ).toBe(true);
    });
});
