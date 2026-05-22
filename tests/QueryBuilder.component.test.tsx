import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import QueryBuilder from "../src/QueryBuilder";

const filters = [
    {
        label: "Test",
        options: [
            { label: "Name", type: "text", value: "name" },
            { label: "Active", type: "switch", value: "active" },
        ],
    },
];

describe("QueryBuilder component", () => {
    test("renders with default props (empty query)", () => {
        const { container } = render(<QueryBuilder />);
        expect(container).toBeDefined();
    });

    test("renders a rule group with provided query", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );
        expect(await screen.findByTestId("group-0")).toBeInTheDocument();
    });

    test("shows debug output when debug is true", async () => {
        render(
            <QueryBuilder
                debug
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );
        expect(await screen.findByText(/Valid\?/)).toBeInTheDocument();
    });

    test("renders combinator toggle buttons", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );
        expect(await screen.findByTestId("group-0-combinator-and")).toBeInTheDocument();
        expect(screen.getByTestId("group-0-combinator-or")).toBeInTheDocument();
    });

    test("renders Add Rule button", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );
        expect(await screen.findByTestId("group-0-add-rule")).toBeInTheDocument();
    });

    test("renders Add Group button at level 0 with maxLevels > 0", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );
        expect(await screen.findByTestId("group-0-add-group")).toBeInTheDocument();
    });

    test("hides Add Group button with maxLevels=0", async () => {
        render(
            <QueryBuilder
                filters={filters}
                maxLevels={0}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );
        await screen.findByTestId("group-0");
        expect(screen.queryByTestId("group-0-add-group")).not.toBeInTheDocument();
    });

    test("renders multiple rules", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [
                        { field: "name", operator: "equal", value: "a" },
                        { field: "name", operator: "equal", value: "b" },
                    ],
                }}
            />,
        );
        expect(await screen.findByTestId("rule-0-0")).toBeInTheDocument();
        expect(screen.getByTestId("rule-0-1")).toBeInTheDocument();
    });

    test("renders nested groups", async () => {
        render(
            <QueryBuilder
                filters={filters}
                maxLevels={2}
                query={{
                    combinator: "and",
                    rules: [
                        { field: "name", operator: "equal", value: "test" },
                        {
                            combinator: "or",
                            rules: [{ field: "name", operator: "contains", value: "inner" }],
                        },
                    ],
                }}
            />,
        );
        expect(await screen.findByTestId("group-0")).toBeInTheDocument();
        expect(await screen.findByTestId("group-1")).toBeInTheDocument();
    });

    test("adds a rule when Add Rule is clicked", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "test" }],
                }}
            />,
        );

        const user = userEvent.setup();
        await user.click(await screen.findByTestId("group-0-add-rule"));
        // A new empty rule should appear
        expect(await screen.findByTestId("rule-0-1")).toBeInTheDocument();
    });

    test("renders remove buttons for each rule", async () => {
        render(
            <QueryBuilder
                filters={filters}
                query={{
                    combinator: "and",
                    rules: [
                        { field: "name", operator: "equal", value: "a" },
                        { field: "name", operator: "equal", value: "b" },
                    ],
                }}
            />,
        );

        await screen.findByTestId("rule-0-0");
        const removeButtons = screen.getAllByTestId(/^rule-0-\d+-remove$/);
        expect(removeButtons.length).toBe(2);
        // Each remove button should be enabled
        for (const btn of removeButtons) {
            expect(btn).not.toBeDisabled();
        }
    });

    test("static formatQuery removes IDs", () => {
        const q = {
            id: 1,
            combinator: "and",
            rules: [{ id: 2, field: "name", operator: "equal", value: "test" }],
        };
        const result = QueryBuilder.formatQuery(q);
        expect(result.id).toBeUndefined();
        expect(result.rules[0].id).toBeUndefined();
    });

    test("static isQueryValid validates groups", () => {
        expect(
            QueryBuilder.isQueryValid({
                combinator: "and",
                rules: [{ field: "name", operator: "equal", value: "test" }],
            }),
        ).toBe(true);

        expect(
            QueryBuilder.isQueryValid({
                combinator: "and",
                rules: [{ field: null, operator: null, value: null }],
            }),
        ).toBe(false);
    });

    test("static operators returns the default operators list", () => {
        expect(QueryBuilder.operators.length).toBeGreaterThan(0);
        expect(QueryBuilder.operators[0]).toHaveProperty("label");
        expect(QueryBuilder.operators[0]).toHaveProperty("value");
        expect(QueryBuilder.operators[0]).toHaveProperty("types");
    });

    test("allows entering data into text input and updates state", async () => {
        const onChange = vi.fn();
        render(
            <QueryBuilder
                filters={filters}
                onChange={onChange}
                query={{
                    combinator: "and",
                    rules: [{ field: "name", operator: "equal", value: "initial" }],
                }}
            />,
        );

        const input = (await screen.findByRole("textbox")) as HTMLInputElement;
        expect(input.value).toBe("initial");

        const user = userEvent.setup();
        await user.clear(input);
        await user.type(input, "new-value");

        expect(input.value).toBe("new-value");
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                rules: [
                    expect.objectContaining({
                        field: "name",
                        operator: "equal",
                        value: "new-value",
                    }),
                ],
            }),
            true,
        );
    });
});
