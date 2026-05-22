import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Context from "../src/context";
import type { QueryBuilderContextValue } from "../src/context";
import Field from "../src/Field";

function createContext(overrides: Partial<QueryBuilderContextValue> = {}): QueryBuilderContextValue {
    return {
        customOperators: {},
        dispatch: vi.fn(),
        filters: [],
        filtersByValue: {
            name: { label: "Name", type: "text", value: "name" },
            age: { label: "Age", type: "integer", value: "age" },
        },
        flattenedFilters: [
            { group: "Person", label: "Name", type: "text", value: "name" },
            { group: "Person", label: "Age", type: "integer", value: "age" },
        ],
        maxLevels: 1,
        operators: [],
        operatorsByType: {
            text: [
                { label: "equal to", value: "equal" },
                { label: "contains", value: "contains" },
            ],
            integer: [
                { label: "equal to", value: "equal" },
                { label: "less than", value: "less" },
            ],
        },
        operatorsByValue: {},
        ...overrides,
    };
}

function renderField(
    props: { field?: string | null } = {},
    contextOverrides: Partial<QueryBuilderContextValue> = {},
) {
    const ctx = createContext(contextOverrides);
    return render(
        <Context.Provider value={ctx}>
            <Field field={props.field ?? null} id={1} testId="0-0" />
        </Context.Provider>,
    );
}

describe("Field", () => {
    test("renders the autocomplete component", () => {
        renderField();
        expect(screen.getByTestId("field-0-0")).toBeInTheDocument();
    });

    test("renders with a placeholder", () => {
        renderField();
        expect(screen.getByPlaceholderText("Field")).toBeInTheDocument();
    });

    test("shows the selected field label", () => {
        renderField({ field: "name" });
        const input = screen.getByTestId("field-0-0").querySelector("input");
        expect(input?.value).toBe("Name");
    });

    test("renders with null field (no selection)", () => {
        renderField({ field: null });
        const input = screen.getByTestId("field-0-0").querySelector("input");
        expect(input?.value).toBe("");
    });
});
