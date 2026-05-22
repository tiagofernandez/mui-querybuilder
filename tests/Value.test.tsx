import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Context from "../src/context";
import type { QueryBuilderContextValue } from "../src/context";
import Value from "../src/Value";

function createContext(overrides: Partial<QueryBuilderContextValue> = {}): QueryBuilderContextValue {
    return {
        customOperators: {},
        dispatch: vi.fn(),
        filters: [],
        filtersByValue: {
            name: { label: "Name", type: "text", value: "name" },
            count: { label: "Count", type: "integer", value: "count" },
            score: { label: "Score", type: "number", value: "score" },
            published: { label: "Published", type: "date", value: "published" },
            active: { label: "Active", type: "radio", value: "active" },
            enabled: { label: "Enabled", type: "switch", value: "enabled" },
            status: {
                label: "Status",
                type: "select",
                value: "status",
                options: [
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                ],
            },
            tags: {
                label: "Tags",
                type: "multiselect",
                value: "tags",
                options: [
                    { label: "A", value: "a" },
                    { label: "B", value: "b" },
                ],
            },
        },
        flattenedFilters: [],
        maxLevels: 1,
        operators: [],
        operatorsByType: {},
        operatorsByValue: {},
        ...overrides,
    };
}

function renderValue(
    props: { field?: string | null; operator?: string | null; value?: unknown } = {},
    contextOverrides: Partial<QueryBuilderContextValue> = {},
) {
    const ctx = createContext(contextOverrides);
    return render(
        <Context.Provider value={ctx}>
            <Value
                field={props.field ?? null}
                id={1}
                operator={props.operator ?? "equal"}
                testId="0-0"
                value={props.value ?? null}
            />
        </Context.Provider>,
    );
}

describe("Value", () => {
    test("renders empty span for null operator", () => {
        const { container } = renderValue({ operator: "null" });
        expect(container.querySelector("span")).toBeInTheDocument();
    });

    test("renders empty span for not_null operator", () => {
        const { container } = renderValue({ operator: "not_null" });
        expect(container.querySelector("span")).toBeInTheDocument();
    });

    test("renders a text field by default (unknown type)", () => {
        renderValue({ field: "name", value: "hello" });
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });

    test("renders a text field for text type", () => {
        renderValue({ field: "name", value: "test" });
        const input = screen.getByTestId("value-0-0").querySelector("input");
        expect(input).toBeInTheDocument();
        expect(input?.value).toBe("test");
    });

    test("renders a number input for integer type", () => {
        renderValue({ field: "count", value: 42 });
        const input = screen.getByTestId("value-0-0").querySelector("input");
        expect(input).toBeInTheDocument();
        expect(input?.type).toBe("number");
    });

    test("renders a number input for number type", () => {
        renderValue({ field: "score", value: 3.14 });
        const input = screen.getByTestId("value-0-0").querySelector("input");
        expect(input).toBeInTheDocument();
        expect(input?.type).toBe("number");
    });

    test("renders radio buttons for radio type", () => {
        renderValue({ field: "active", value: true });
        expect(screen.getByTestId("value-0-0-true")).toBeInTheDocument();
        expect(screen.getByTestId("value-0-0-false")).toBeInTheDocument();
    });

    test("renders a switch for switch type", () => {
        renderValue({ field: "enabled", value: true });
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });

    test("renders a date picker for date type", () => {
        renderValue({ field: "published", value: "2024-01-15" });
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });

    test("renders select (autocomplete) for select type", () => {
        renderValue({ field: "status", value: "active" });
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });

    test("renders multiselect for multiselect type", () => {
        renderValue({ field: "tags", value: ["a"] });
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });

    test("falls back to text field for unknown field", () => {
        renderValue({ field: null, value: "fallback" });
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });

    test("uses custom operator type mapping", () => {
        const ctx = {
            customOperators: {
                keyword: {
                    options: [{ label: "is exactly", value: "exactly" }],
                    type: "text",
                },
            },
            filtersByValue: {
                search: { label: "Search", type: "keyword", value: "search" },
            },
        };
        renderValue({ field: "search", value: "hello" }, ctx as any);
        expect(screen.getByTestId("value-0-0")).toBeInTheDocument();
    });
});
