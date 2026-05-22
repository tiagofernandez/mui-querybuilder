import CloseIcon from "@mui/icons-material/Close";
import { Grid, IconButton } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { parseISO, startOfDay } from "date-fns";
import { useEffect, useState } from "react";

interface DatePickerProps {
    clearable?: boolean;
    "data-testid"?: string;
    label?: string;
    value: string | Date | null;
    onChange?: (date: Date | null) => void;
}

function parseDate(date: string | Date | null | undefined): Date | null {
    if (!date) {
        return null;
    }
    let parsedDate = date;
    if (typeof parsedDate === "string") {
        parsedDate = parseISO(parsedDate);
    }
    return startOfDay(parsedDate);
}

const DatePicker = (props: DatePickerProps) => {
    const { clearable = false, label, onChange, value: propValue, "data-testid": testId = "date-picker" } = props;

    const [value, setValue] = useState<Date | null>(parseDate(propValue));

    useEffect(() => {
        setValue(parseDate(propValue));
    }, [propValue]);

    function handleDateChange(date: Date | null) {
        const parsed = parseDate(date);
        setValue(parsed);
        onChange?.(parsed);
    }

    return (
        <Grid container>
            <Grid>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div data-testid={testId}>
                        <MuiDatePicker
                            label={label}
                            value={value}
                            onChange={handleDateChange}
                            slotProps={{
                                textField: {
                                    size: "small",
                                },
                            }}
                        />
                    </div>
                </LocalizationProvider>
            </Grid>
            {clearable && (
                <Grid sx={{ ml: -0.5, mt: label ? 1.5 : 0 }}>
                    <IconButton
                        aria-label="clear"
                        data-testid={`${testId}-clear`}
                        size="small"
                        sx={{ m: 1 }}
                        onClick={() => handleDateChange(null)}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};

export default DatePicker;
