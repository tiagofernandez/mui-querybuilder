import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Context from "../src/context";
import type { QueryBuilderContextValue } from "../src/context";
import RuleGroup from "../src/RuleGroup";

function createContext(overrides: Partial<QueryBuilderContextValue> = {}): QueryBuilderContextValue {
    return {
        customOperators: {},
        dispatch: vi.fn(),
        filters: [],
        filtersByValue: {},
        flattenedFilters: [],
        maxLevels: 1,
        operators: [],
        operatorsByType: {},
        operatorsByValue: {},
        ...overrides,
    };
}

function renderRuleGroup(
    props: {
        combinator?: string;
        id?: number;
        level?: number;
        rules?: any[];
    } = {},
    contextOverrides: Partial<QueryBuilderContextValue> = {},
) {
    const ctx = createContext(contextOverrides);
    return render(
        <Context.Provider value={ctx}>
            <RuleGroup id={props.id ?? 1} level={props.level ?? 0} combinator={props.combinator} rules={props.rules} />
        </Context.Provider>,
    );
}

describe("RuleGroup", () => {
    test("renders combinator toggle buttons (AND/OR)", () => {
        renderRuleGroup();
        expect(screen.getByTestId("group-0-combinator-and")).toBeInTheDocument();
        expect(screen.getByTestId("group-0-combinator-or")).toBeInTheDocument();
    });

    test("renders Add Rule button", () => {
        renderRuleGroup();
        expect(screen.getByTestId("group-0-add-rule")).toBeInTheDocument();
    });

    test("renders Add Group button when level < maxLevels", () => {
        renderRuleGroup({ level: 0 }, { maxLevels: 1 });
        expect(screen.getByTestId("group-0-add-group")).toBeInTheDocument();
    });

    test("hides Add Group button when level >= maxLevels", () => {
        renderRuleGroup({ level: 0 }, { maxLevels: 0 });
        expect(screen.queryByTestId("group-0-add-group")).not.toBeInTheDocument();
    });

    test("disables remove button at level 0", () => {
        renderRuleGroup({ level: 0 });
        const removeButton = screen.getByTestId("group-0-remove");
        expect(removeButton).toBeDisabled();
    });

    test("enables remove button at level > 0", () => {
        renderRuleGroup({ level: 1 }, { maxLevels: 2 });
        const removeButton = screen.getByTestId("group-1-remove");
        expect(removeButton).not.toBeDisabled();
    });

    test("renders nothing when level > maxLevels", () => {
        const { container } = renderRuleGroup({ level: 2 }, { maxLevels: 1 });
        expect(container.querySelector("span")).toBeInTheDocument();
        expect(screen.queryByTestId("group-2")).not.toBeInTheDocument();
    });

    test("renders rules within the group", () => {
        const rules = [
            { id: 10, field: "name", operator: "equal", value: "test" },
            { id: 11, field: "age", operator: "greater", value: 18 },
        ];
        renderRuleGroup({ rules });
        expect(screen.getByTestId("rule-0-0")).toBeInTheDocument();
        expect(screen.getByTestId("rule-0-1")).toBeInTheDocument();
    });

    test("renders nested rule groups (combinator in rule)", () => {
        const rules = [
            {
                id: 10,
                combinator: "or",
                field: null,
                operator: null,
                value: null,
                rules: [{ id: 11, field: "x", operator: "equal", value: "y" }],
            },
        ];
        renderRuleGroup({ rules }, { maxLevels: 2 });
        expect(screen.getByTestId("group-1")).toBeInTheDocument();
    });

    test("dispatches add-rule when Add Rule is clicked", async () => {
        const { userEvent } = await import("@testing-library/user-event");
        const dispatch = vi.fn();
        renderRuleGroup({ id: 1 }, { dispatch });
        await userEvent.setup().click(screen.getByTestId("group-0-add-rule"));
        expect(dispatch).toHaveBeenCalledWith({ type: "add-rule", id: 1 });
    });
});
