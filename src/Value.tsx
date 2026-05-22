import { Autocomplete, FormControlLabel, FormGroup, Radio, Switch, TextField, type Theme } from "@mui/material";
import { format } from "date-fns";
import { dequal } from "dequal";
import { memo, useContext } from "react";

import DatePicker from "./DatePicker";
import Context from "./context";

const labelStyles = {
    "& .MuiFormControlLabel-label": {
        fontSize: (theme: Theme) => theme.typography.fontSize,
    },
};

const readNumericValue = (value: unknown): string | number => {
    return value !== null && value !== undefined ? (value as string | number) : "";
};

const supportedTypes = new Set(["date", "integer", "multiselect", "number", "radio", "select", "switch", "text"]);

interface ValueProps {
    field: string | null;
    id: number;
    operator: string | null;
    testId: string;
    value: unknown;
}

const Value = memo(
    (props: ValueProps) => {
        const context = useContext(Context);

        const { field, id, operator, value } = props;
        const { customOperators, dispatch, filtersByValue } = context;

        if (/null/i.test(operator ?? "")) {
            return <span />;
        }
        const testId = `value-${props.testId}`;
        const filter: { type: string; options?: { label: string; value: string | number }[] } = field
            ? { ...filtersByValue[field] }
            : { type: "" };

        if (!supportedTypes.has(filter.type)) {
            const customOperator = customOperators[filter.type];
            if (customOperator?.type) {
                filter.type = customOperator.type;
            }
        }

        const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch({ type: "set-value", id, value: event.target.value });
        };

        switch (filter.type) {
            case "date":
                return (
                    <DatePicker
                        clearable
                        data-testid={testId}
                        value={(value as string | Date | null) ?? null}
                        onChange={(date) => {
                            const formatted = date ? format(date, "yyyy-MM-dd") : null;
                            dispatch({ type: "set-value", id, value: formatted });
                        }}
                    />
                );
            case "integer":
                return (
                    <TextField
                        size="small"
                        data-testid={testId}
                        type="number"
                        value={readNumericValue(value)}
                        onChange={handleTextFieldChange}
                        onKeyDown={(event) => {
                            if (/\.|,/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                    />
                );
            case "multiselect": {
                const filterOptions = filter.options ?? [];
                const selectedValues = (value as (string | number)[] | null) ?? [];
                return (
                    <Autocomplete
                        filterSelectedOptions
                        fullWidth
                        multiple
                        openOnFocus
                        data-testid={testId}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, val) => option.value === val.value}
                        limitTags={-1}
                        options={filterOptions}
                        renderInput={(params) => <TextField {...params} size="small" />}
                        size="small"
                        value={filterOptions.filter((op) => selectedValues.includes(op.value))}
                        onChange={(_event, selected) => {
                            const newValue = (selected ?? []).map((item) => item.value);
                            dispatch({ type: "set-value", id, value: newValue });
                        }}
                    />
                );
            }
            case "number":
                return (
                    <TextField
                        size="small"
                        data-testid={testId}
                        type="number"
                        value={readNumericValue(value)}
                        onChange={handleTextFieldChange}
                    />
                );
            case "radio":
                return (
                    <FormGroup row>
                        <FormControlLabel
                            sx={labelStyles}
                            control={
                                <Radio
                                    checked={value === true}
                                    color="primary"
                                    data-testid={`${testId}-true`}
                                    name={testId}
                                    value={String(value)}
                                    onChange={() => {
                                        dispatch({ type: "set-value", id, value: true });
                                    }}
                                />
                            }
                            label="True"
                        />
                        <FormControlLabel
                            sx={labelStyles}
                            control={
                                <Radio
                                    checked={value === false}
                                    color="primary"
                                    data-testid={`${testId}-false`}
                                    name={testId}
                                    value={String(value)}
                                    onChange={() => {
                                        dispatch({ type: "set-value", id, value: false });
                                    }}
                                />
                            }
                            label="False"
                        />
                    </FormGroup>
                );
            case "select": {
                const selectOptions = filter.options ?? [];
                return (
                    <Autocomplete
                        size="small"
                        data-testid={testId}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, val) => option.value === val.value}
                        options={selectOptions}
                        renderInput={(params) => <TextField {...params} size="small" />}
                        sx={{ width: 250 }}
                        value={selectOptions.find((op) => value === op.value) ?? null}
                        onChange={(_event, selected) => {
                            const newValue = selected ? selected.value : null;
                            dispatch({ type: "set-value", id, value: newValue });
                        }}
                    />
                );
            }
            case "switch":
                return (
                    <Switch
                        color="primary"
                        data-testid={testId}
                        checked={(value as boolean) ?? false}
                        onChange={(event) => {
                            dispatch({ type: "set-value", id, value: event.target.checked });
                        }}
                    />
                );
            default:
                return (
                    <TextField
                        size="small"
                        fullWidth
                        data-testid={testId}
                        value={(value as string) ?? ""}
                        onChange={handleTextFieldChange}
                    />
                );
        }
    },
    (prevProps, nextProps) => dequal(prevProps, nextProps),
);

export default Value;
