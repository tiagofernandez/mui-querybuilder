import { Autocomplete, TextField } from "@mui/material";
import { dequal } from "dequal";
import { memo, useContext } from "react";

import Context from "./context";

interface OperatorProps {
    field: string | null;
    id: number;
    operator: string | null;
    testId: string;
}

const Operator = memo(
    (props: OperatorProps) => {
        const context = useContext(Context);
        const { field, id, operator, testId } = props;

        const { dispatch, filtersByValue, operatorsByType, operatorsByValue } = context;

        const filter = field ? filtersByValue[field] : null;
        const options = filter ? (operatorsByType[filter.type] ?? []) : [];
        const value = operator ? (operatorsByValue[operator] ?? null) : null;

        return (
            <Autocomplete
                size="small"
                fullWidth
                data-testid={`operator-${testId}`}
                disableClearable
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                options={options}
                renderInput={(params) => (
                    <TextField {...params} placeholder="Operator" size="small" variant="outlined" />
                )}
                sx={{ minWidth: 200 }}
                value={value ?? undefined}
                onChange={(_event, selected) => {
                    if (selected) {
                        dispatch({ type: "set-operator", id, value: selected.value });
                    }
                }}
            />
        );
    },
    (prevProps, nextProps) => dequal(prevProps, nextProps),
);

export default Operator;
