import { Button, Divider, Grid } from "@material-ui/core";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { storiesOf } from "@storybook/react";
import React, { useState } from "react";

import MuiQueryBuilder from "../src";

storiesOf("MuiQueryBuilder")
    .add("supported types", () => {
        const filters = [
            {
                label: "Article",
                options: [
                    {
                        label: "Title",
                        value: "title",
                        type: "text",
                    },
                    {
                        label: "URL",
                        value: "url",
                        type: "text",
                    },
                    {
                        label: "Word Count",
                        value: "word_count",
                        type: "integer",
                    },
                    {
                        label: "Rating",
                        value: "rating",
                        type: "number",
                    },
                    {
                        label: "Is Redirect",
                        value: "is_redirect",
                        type: "radio",
                    },
                    {
                        label: "Published",
                        value: "published",
                        type: "switch",
                    },
                    {
                        label: "Updated Date",
                        value: "updated_date",
                        type: "date",
                    },
                ],
            },
            {
                label: "Meta",
                options: [
                    {
                        label: "User Roles",
                        value: "user_roles",
                        type: "multiselect",
                        options: [
                            {
                                label: "Expert",
                                value: "expert",
                            },
                            {
                                label: "Staff",
                                value: "staff",
                            },
                            {
                                label: "Site Contributor",
                                value: "site_contributor",
                            },
                            {
                                label: "System",
                                value: "system",
                            },
                        ],
                    },
                    {
                        label: "Author Status",
                        value: "author_status",
                        type: "select",
                        options: [
                            {
                                label: "Active",
                                value: "active",
                            },
                            {
                                label: "Terminated",
                                value: "terminated",
                            },
                        ],
                    },
                ],
            },
        ];
        const [query, setQuery] = useState({
            combinator: "and",
            rules: [
                {
                    field: "is_redirect",
                    operator: "equal",
                    value: false,
                },
                {
                    field: "updated_date",
                    operator: "after_equal",
                    value: "2020-08-20",
                },
                {
                    field: "title",
                    operator: "not_null",
                },
                {
                    field: "url",
                    operator: "contains",
                    value: "France",
                },
                {
                    field: "word_count",
                    operator: "less",
                    value: 420,
                },
                {
                    field: "rating",
                    operator: "greater",
                    value: 4.2,
                },
                {
                    combinator: "or",
                    rules: [
                        {
                            field: "author_status",
                            operator: "not_equal",
                            value: "terminated",
                        },
                        {
                            field: "user_roles",
                            operator: "in",
                            value: ["expert", "site_contributor", "staff"],
                        },
                    ],
                },
            ],
        });
        return (
            <MuiQueryBuilder
                debug
                filters={filters}
                query={query}
                onChange={(query, valid) => {
                    setQuery(query);
                    console.log("Valid?", valid);
                }}
            />
        );
    })
    .add("single level", () => {
        return (
            <MuiQueryBuilder
                debug
                filters={[
                    {
                        options: [
                            {
                                label: "Link",
                                value: "link",
                                type: "text",
                            },
                        ],
                    },
                ]}
                maxLevels={0}
                query={{
                    combinator: "or",
                    rules: [
                        {
                            field: "link",
                            operator: "contains",
                            value: "Brazil",
                        },
                        {
                            field: "link",
                            operator: "contains",
                            value: "Spain",
                        },
                    ],
                }}
            />
        );
    })
    .add("multiple levels", () => {
        return (
            <MuiQueryBuilder
                debug
                filters={[
                    {
                        options: [
                            {
                                label: "Name",
                                value: "name",
                                type: "text",
                            },

                        ],
                    },
                ]}
                maxLevels={3}
                query={{
                    combinator: "or",
                    rules: [
                        {
                            field: "name",
                            operator: "contains",
                            value: "",
                        },
                        {
                            combinator: "and",
                            rules: [
                                {
                                    field: "name",
                                    operator: "equal",
                                    value: "",
                                },
                                {
                                    combinator: "and",
                                    rules: [
                                        {
                                            field: "name",
                                            operator: "not_equal",
                                            value: "",
                                        },
                                        {
                                            combinator: "and",
                                            rules: [
                                                {
                                                    field: "name",
                                                    operator: "null",
                                                    value: "",
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }}
            />
        );
    })
    .add("custom operators", () => {
        return (
            <MuiQueryBuilder
                debug
                customOperators={{
                    exclusive_list: {
                        options: [
                            {
                                label: "at least one of",
                                value: "or",
                            },
                            {
                                label: "only one of",
                                value: "xor",
                            },
                        ],
                        type: "multiselect",
                    },
                }}
                filters={[
                    {
                        options: [
                            {
                                label: "Season",
                                type: "exclusive_list",
                                value: "season",
                                options: [
                                    {
                                        label: "Fall",
                                        value: 1,
                                    },
                                    {
                                        label: "Spring",
                                        value: 2,
                                    },
                                    {
                                        label: "Summer",
                                        value: 3,
                                    },
                                    {
                                        label: "Winter",
                                        value: 4,
                                    },
                                ],
                            },
                        ],
                    },
                ]}
                query={{
                    combinator: "and",
                    rules: [
                        {
                            field: "season",
                            operator: "xor",
                            value: [1, 2],
                        },
                    ],
                }}
            />
        );
    })
    .add("dynamic options", () => {
        const [filters, setFilters] = useState([
            {
                options: [
                    {
                        label: "Months",
                        type: "multiselect",
                        value: "months",
                        options: [],
                    },
                ],
            },
        ]);
        const [loaded, setLoaded] = useState(false);

        return (
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Button
                        color="primary"
                        disabled={loaded}
                        variant="outlined"
                        onClick={() => {
                            setFilters([
                                {
                                    options: [
                                        {
                                            label: "Months",
                                            type: "multiselect",
                                            value: "months",
                                            options: [
                                                { label: "January", value: 1 },
                                                { label: "February", value: 2 },
                                                { label: "March", value: 3 },
                                                { label: "April", value: 4 },
                                                { label: "May", value: 5 },
                                                { label: "June", value: 6 },
                                                { label: "July", value: 7 },
                                                { label: "August", value: 8 },
                                                { label: "September", value: 9 },
                                                { label: "October", value: 10 },
                                                { label: "November", value: 11 },
                                                { label: "December", value: 12 },
                                            ],
                                        },
                                    ],
                                },
                            ]);
                            setLoaded(true);
                        }}
                    >
                        Load options
                    </Button>
                </Grid>
                <Grid item>
                    <Divider />
                </Grid>
                <Grid item>
                    <MuiQueryBuilder
                        debug
                        filters={filters}
                        query={{
                            combinator: "and",
                            rules: [
                                {
                                    field: "months",
                                    operator: "in",
                                    value: [],
                                },
                            ],
                        }}
                    />
                </Grid>
            </Grid>
        );
    })
    .add("with theme", () => {
        return (
            <ThemeProvider theme={createMuiTheme({
                palette: {
                    primary: {
                        light: "rgba(83, 187, 210, 1)",
                        main: "rgba(0, 139, 161, 1)",
                        dark: "rgba(0, 93, 114, 1)",
                        contrastText: "#fff",
                    },
                    secondary: {
                        light: "rgba(254, 88, 181, 1)",
                        main: "rgba(199, 21, 133, 1)",
                        dark: "rgba(146, 0, 88, 1)",
                        contrastText: "#fff",
                    },
                },
                typography: {
                    fontSize: 12,
                },
            })}>
                <MuiQueryBuilder
                    debug
                    filters={[
                        {
                            options: [
                                {
                                    label: "Operational",
                                    value: "operational",
                                    type: "radio",
                                },
                                {
                                    label: "Created Date",
                                    value: "created_date",
                                    type: "date",
                                },
                            ],
                        },
                    ]}
                    maxLevels={0}
                    query={{
                        combinator: "or",
                        rules: [
                            {
                                field: "operational",
                                operator: "equal",
                                value: true,
                            },
                            {
                                field: "created_date",
                                operator: "before",
                                value: "2020-01-01",
                            },
                        ],
                    }}
                />
            </ThemeProvider>
        );
    })
;
