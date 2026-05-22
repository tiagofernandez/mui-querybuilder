import { Autocomplete, TextField } from "@mui/material";
import { dequal } from "dequal";
import { memo, useContext } from "react";

import Context from "./context";
import type { FlattenedFilter } from "./context";

interface FieldProps {
    field: string | null;
    id: number;
    testId: string;
}

const Field = memo(
    (props: FieldProps) => {
        const context = useContext(Context);
        const { field, id, testId } = props;

        const { dispatch, filtersByValue, flattenedFilters, operatorsByType } = context;
        const filter = field ? filtersByValue[field] : null;

        return (
            <Autocomplete
                size="small"
                fullWidth
                data-testid={`field-${testId}`}
                disableClearable
                groupBy={(option) => option.group}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                options={flattenedFilters}
                renderInput={(params) => <TextField {...params} placeholder="Field" size="small" variant="outlined" />}
                sx={{ minWidth: 250 }}
                value={(filter as FlattenedFilter) ?? undefined}
                onChange={(_event, selected) => {
                    const value = selected ? selected.value : null;
                    if (value) {
                        const { type } = filtersByValue[value];
                        const operators = operatorsByType[type];
                        const operator = operators?.length > 0 ? operators[0].value : null;
                        dispatch({ type: "set-field", id, operator, value });
                    }
                }}
            />
        );
    },
    (prevProps, nextProps) => dequal(prevProps, nextProps),
);

export default Field;
