import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Context from "../src/context";
import type { QueryBuilderContextValue } from "../src/context";
import Operator from "../src/Operator";

function createContext(overrides: Partial<QueryBuilderContextValue> = {}): QueryBuilderContextValue {
    return {
        customOperators: {},
        dispatch: vi.fn(),
        filters: [],
        filtersByValue: {
            name: { label: "Name", type: "text", value: "name" },
        },
        flattenedFilters: [],
        maxLevels: 1,
        operators: [],
        operatorsByType: {
            text: [
                { label: "contains", value: "contains" },
                { label: "equal to", value: "equal" },
            ],
        },
        operatorsByValue: {
            contains: { label: "contains", value: "contains", types: ["text"] },
            equal: { label: "equal to", value: "equal", types: ["text"] },
        },
        ...overrides,
    };
}

function renderOperator(
    props: { field?: string | null; operator?: string | null } = {},
    contextOverrides: Partial<QueryBuilderContextValue> = {},
) {
    const ctx = createContext(contextOverrides);
    return render(
        <Context.Provider value={ctx}>
            <Operator field={props.field ?? null} id={1} operator={props.operator ?? null} testId="0-0" />
        </Context.Provider>,
    );
}

describe("Operator", () => {
    test("renders the autocomplete component", () => {
        renderOperator({ field: "name" });
        expect(screen.getByTestId("operator-0-0")).toBeInTheDocument();
    });

    test("renders with a placeholder", () => {
        renderOperator({ field: "name" });
        expect(screen.getByPlaceholderText("Operator")).toBeInTheDocument();
    });

    test("shows the selected operator label", () => {
        renderOperator({ field: "name", operator: "contains" });
        const input = screen.getByTestId("operator-0-0").querySelector("input");
        expect(input?.value).toBe("contains");
    });

    test("renders with null operator (no selection)", () => {
        renderOperator({ field: "name", operator: null });
        const input = screen.getByTestId("operator-0-0").querySelector("input");
        expect(input?.value).toBe("");
    });

    test("renders with null field (empty options)", () => {
        renderOperator({ field: null });
        expect(screen.getByTestId("operator-0-0")).toBeInTheDocument();
    });
});
