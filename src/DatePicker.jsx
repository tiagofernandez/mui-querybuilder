import DateFnsUtils from "@date-io/date-fns";
import { Grid, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { DatePicker as MuiDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { parseISO, startOfDay } from "date-fns";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((t) => ({
    clearButton: {
        margin: t.spacing(1),
    },
    clearCell: {
        marginLeft: -t.spacing(0.5),
        marginTop: (props) => (props.label ? t.spacing(1.5) : "none"),
    },
}));

function parseDate(date) {
    if (!date) {
        return null;
    }
    if (typeof date === "string") {
        date = parseISO(date);
    }
    date = startOfDay(date);
    return date;
}

const DatePicker = (props) => {
    const classes = useStyles(props);

    const [value, setValue] = React.useState(parseDate(props.value));

    React.useEffect(() => {
        const date = parseDate(props.value);
        setValue(date);
    }, [props.value]);

    function handleDateChange(date) {
        date = parseDate(date);
        setValue(date);
        if (props.onChange) {
            props.onChange(date);
        }
    }

    /*
     * https://material-ui-pickers.dev/api/DatePicker
     */
    function getDatePickerProps() {
        const datePickerProps = {
            ...props,
            InputLabelProps: {
                ...props.InputLabelProps,
                shrink: true,
            },
            variant: "inline",
        };
        delete datePickerProps.clearable; // not supported by the inline variant
        return datePickerProps;
    }
    return (
        <Grid container>
            <Grid item>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <MuiDatePicker {...getDatePickerProps()} value={value} onChange={handleDateChange} />
                </MuiPickersUtilsProvider>
            </Grid>
            {props.clearable && (
                <Grid item className={classes.clearCell}>
                    <IconButton
                        aria-label="clear"
                        className={classes.clearButton}
                        data-testid={`${props["data-testid"]}-clear`}
                        size="small"
                        onClick={() => handleDateChange(null)}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                </Grid>
            )}
        </Grid>
    );
};

DatePicker.defaultProps = {
    ...MuiDatePicker.defaultProps,
    "autoOk": true,
    "data-testid": "date-picker",
    "format": "PPP",
};

DatePicker.propTypes = {
    ...MuiDatePicker.propTypes,
    "data-testid": PropTypes.string,
    "clearable": PropTypes.bool,
};

export default DatePicker;
