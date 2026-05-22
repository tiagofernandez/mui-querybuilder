import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import DatePicker from "../src/DatePicker";

describe("DatePicker", () => {
    test("renders with a default value", () => {
        render(<DatePicker value={null} />);
        expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    });

    test("renders with an ISO string value", () => {
        render(<DatePicker value="2024-01-15" />);
        expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    });

    test("renders with a Date object value", () => {
        render(<DatePicker value={new Date(2024, 0, 15)} />);
        expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    });

    test("renders with a label", () => {
        render(<DatePicker label="Start Date" value={null} />);
        const elements = screen.queryAllByLabelText("Start Date");
        expect(elements.length).toBeGreaterThan(0);
    });

    test("renders clear button when clearable is true", () => {
        render(<DatePicker clearable value="2024-01-15" />);
        expect(screen.getByTestId("date-picker-clear")).toBeInTheDocument();
    });

    test("does not render clear button when clearable is false", () => {
        render(<DatePicker value="2024-01-15" />);
        expect(screen.queryByTestId("date-picker-clear")).not.toBeInTheDocument();
    });

    test("uses custom data-testid", () => {
        render(<DatePicker data-testid="custom-date" value={null} />);
        expect(screen.getByTestId("custom-date")).toBeInTheDocument();
    });
});
