const operators = [
    {
        label: "equal to",
        value: "equal",
        types: ["date", "integer", "number", "radio", "select", "switch", "text"],
    },
    {
        label: "not equal to",
        value: "not_equal",
        types: ["date", "integer", "number", "radio", "select", "switch", "text"],
    },
    {
        label: "contains",
        value: "contains",
        types: ["text"],
    },
    {
        label: "does not contain",
        value: "not_contains",
        types: ["text"],
    },
    {
        label: "less than",
        value: "less",
        types: ["number", "integer"],
    },
    {
        label: "greater than",
        value: "greater",
        types: ["number", "integer"],
    },
    {
        label: "less or equal to",
        value: "less_equal",
        types: ["number", "integer"],
    },
    {
        label: "greater or equal to",
        value: "greater_equal",
        types: ["number", "integer"],
    },
    {
        label: "before than",
        value: "before",
        types: ["date"],
    },
    {
        label: "after than",
        value: "after",
        types: ["date"],
    },
    {
        label: "before or equal to",
        value: "before_equal",
        types: ["date"],
    },
    {
        label: "after or equal to",
        value: "after_equal",
        types: ["date"],
    },
    {
        label: "in",
        value: "in",
        types: ["multiselect"],
    },
    {
        label: "not in",
        value: "not_in",
        types: ["multiselect"],
    },
    {
        label: "is null",
        value: "null",
        types: ["date", "integer", "number", "multiselect", "radio", "select", "switch", "text"],
    },
    {
        label: "is not null",
        value: "not_null",
        types: ["date", "integer", "number", "multiselect", "radio", "select", "switch", "text"],
    },
];

export default operators;
