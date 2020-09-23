import { FormControlLabel, FormGroup, Radio, Switch, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Autocomplete } from "@material-ui/lab";
import { format } from "date-fns";
import { dequal } from "dequal";
import PropTypes from "prop-types";
import React from "react";

import Context from "./context";
import DatePicker from "./DatePicker";

const useFormControlLabelStyles = makeStyles((t) => {
    return {
        label: {
            fontSize: t.typography.fontSize,
        },
    };
});

const readNumericValue = (value) => {
    return value !== null && value !== undefined ? value : "";
};

const supportedTypes = new Set(["date", "integer", "multiselect", "number", "radio", "select", "switch", "text"]);

const Value = React.memo(
    (props) => {
        const classes = {
            formControlLabel: useFormControlLabelStyles(),
        };
        const context = React.useContext(Context);

        const { field, id, operator, value } = props;
        const { customOperators, dispatch, filtersByValue } = context;

        if (/null/i.test(operator)) {
            return <span />;
        }
        const testId = `value-${props.testId}`;
        const filter = field ? { ...filtersByValue[field] } : { type: null };

        if (!supportedTypes.has(filter.type)) {
            const customOperator = customOperators[filter.type];
            filter.type = customOperator?.type;
        }
        switch (filter.type) {
            case "date":
                return (
                    <DatePicker
                        clearable
                        data-testid={testId}
                        value={value || null}
                        onChange={(date) => {
                            const value = date ? format(date, "yyyy-MM-dd") : null;
                            dispatch({ type: "set-value", id, value });
                        }}
                    />
                );
            case "integer":
                return (
                    <TextField
                        data-testid={testId}
                        value={readNumericValue(value)}
                        onChange={(event) => {
                            const inputValue = event.target.value;
                            const newValue = inputValue.length > 0 ? Number(inputValue) : null;
                            if (newValue !== value) {
                                dispatch({ type: "set-value", id, value: newValue });
                            }
                        }}
                        onKeyPress={(event) => {
                            if (/\D/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                    />
                );
            case "multiselect":
                return (
                    <Autocomplete
                        filterSelectedOptions
                        fullWidth
                        multiple
                        openOnFocus
                        data-testid={testId}
                        disableCloseOnSelect={true}
                        getOptionLabel={(option) => option.label}
                        getOptionSelected={(option, value) => option.value === value.value}
                        limitTags={-1}
                        options={filter.options}
                        renderInput={(params) => <TextField {...params} />}
                        size="small"
                        style={{ paddingTop: 4, width: "auto" }}
                        value={filter.options.filter((op) => value?.includes(op.value))}
                        onChange={(event, selected) => {
                            const value = (selected || []).map((item) => item.value);
                            dispatch({ type: "set-value", id, value });
                        }}
                    />
                );
            case "number":
                return (
                    <TextField
                        data-testid={testId}
                        value={readNumericValue(value)}
                        onChange={(event) => {
                            const { value: val } = event.target;
                            const v = val.replace(/[^.\d]|^0+/g, "").replace(/^(\d*\.?)|(\d*)\.?/g, "$1$2") || null;
                            if (v !== value) {
                                dispatch({ type: "set-value", id, value: v });
                            }
                        }}
                    />
                );
            case "radio":
                return (
                    <FormGroup row>
                        <FormControlLabel
                            classes={classes.formControlLabel}
                            control={
                                <Radio
                                    checked={value === true}
                                    color="primary"
                                    data-testid={`${testId}-true`}
                                    name={testId}
                                    value={value}
                                    onChange={() => {
                                        dispatch({ type: "set-value", id, value: true });
                                    }}
                                />
                            }
                            label="True"
                            value={value}
                        />
                        <FormControlLabel
                            classes={classes.formControlLabel}
                            control={
                                <Radio
                                    checked={value === false}
                                    color="primary"
                                    data-testid={`${testId}-false`}
                                    name={testId}
                                    value={value}
                                    onChange={() => {
                                        dispatch({ type: "set-value", id, value: false });
                                    }}
                                />
                            }
                            label="False"
                            value={value}
                        />
                    </FormGroup>
                );
            case "select":
                return (
                    <Autocomplete
                        data-testid={testId}
                        getOptionLabel={(option) => option.label}
                        getOptionSelected={(option, value) => option.value === value.value}
                        options={filter.options}
                        renderInput={(params) => <TextField {...params} />}
                        style={{ width: 250 }}
                        value={filter.options.find((op) => value === op.value)}
                        onChange={(event, selected) => {
                            const value = selected ? selected.value : null;
                            dispatch({ type: "set-value", id, value });
                        }}
                    />
                );
            case "switch":
                return (
                    <Switch
                        color="primary"
                        data-testid={testId}
                        checked={value || false}
                        onChange={(event) => {
                            const value = event.target.checked;
                            dispatch({ type: "set-value", id, value });
                        }}
                    />
                );
            default:
                return (
                    <TextField
                        fullWidth
                        data-testid={testId}
                        value={value || ""}
                        onChange={(event) => {
                            const { value } = event.target;
                            dispatch({ type: "set-value", id, value });
                        }}
                    />
                );
        }
    },
    (prevProps, nextProps) => {
        // Skip re-rendering if the value didn't change.
        return dequal(prevProps, nextProps);
    }
);

Value.propTypes = {
    field: PropTypes.string,
    id: PropTypes.number.isRequired,
    operator: PropTypes.string,
    testId: PropTypes.string.isRequired,
    value: PropTypes.any,
};

Value.whyDidYouRender = false;

export default Value;
