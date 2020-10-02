# MUI-QueryBuilder

Query builder for [React](https://reactjs.org/) applications based on [Material-UI](https://github.com/mui-org/material-ui).

[![npm package](https://img.shields.io/npm/v/mui-querybuilder/latest.svg)](https://www.npmjs.com/package/mui-querybuilder)
[![npm downloads](https://img.shields.io/npm/dm/mui-querybuilder.svg)](https://www.npmjs.com/package/mui-querybuilder)

<img src="https://github.com/tiagofernandez/mui-querybuilder/blob/main/images/mui-querybuilder.png?raw=true">

## Installation

MUI-QueryBuilder is available as an [npm package](https://www.npmjs.com/package/mui-querybuilder).

```sh
yarn add --exact mui-querybuilder \
    @date-io/core@1.x \
    @date-io/date-fns@1.x \
    @material-ui/core \
    @material-ui/icons \
    @material-ui/lab \
    @material-ui/pickers \
    date-fns \
    prop-types
```

## Usage

Here is a quick example to get you started:

```jsx
import MuiQueryBuilder from "mui-querybuilder";

import React, { useState } from "react";
import ReactDOM from "react-dom";

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
        ],
    },
];

function App() {
    const [query, setQuery] = useState({
        combinator: "and",
        rules: [
            {
                field: "title",
                operator: "contains",
                value: "France",
            },
        ],
    });
    return (
        <MuiQueryBuilder
            filters={filters}
            query={query}
            onChange={(query, valid) => {
                setQuery(query);
            }}
        />
    );
}

ReactDOM.render(<App />, document.querySelector('#app'));
```

### Examples

Check out some examples in [here](http://tiagofernandez.com/mui-querybuilder/)!

## API

### Types

* `date`: renders a date picker, date only.
* `integer`: renders a text field that only accepts numbers.
* `number`: renders a text field that only accepts fractional numbers.
* `multiselect`: renders an autocomplete input for multiple items.
* `radio`: renders radio buttons with `true` and `false` values.
* `select`: renders an autocomplete input for a single item.
* `switch`: renders an on/off switch input.
* `text`: renders a text field.

### Filters

The filters object is a list of grouped objects with `label` (string) and `options` (list) properties.
Each option is an object with `label` (string), `value` (string), and `type` (string).
The `label` can be anything, but the `value` must be an unique key, used by each field in a ruleset.
In case an option's `type` is `select` or `multiselect`, it will require a nested `options` (list) property with `label` & `value` items.

### Operators

In order to relate operators to their corresponding types, we rely on [this data structure](https://github.com/tiagofernandez/mui-querybuilder/blob/master/src/operators.js).
Each operator must have a `label` (string), unique `value` (string), and the `types` (list) it supports.

### Query

The query object is a recursive data structure composed of `combinator` (string) and `rules` (list) properties.
Each rule is an object with `field` (string), `operator` (string), and `value` (anything, depending on the field's `type`).
In case the rule contains a `combinator` property, it's considered a nested group.

### Properties

|Property|Type|Default|Description
|-|-|-|-|
|**customOperators**|object|`{}`|Additional operators to be used by the query builder.
|**debug**|bool|`false`|Dev mode helper that renders the generated query directly in the screen.
|**filters**|array|`[]`|The filters the query builder framework will rely to create rules.
|**maxLevels**|number|`1`|The max nesting level, with `0` meaning no nesting at all.
|**operators**|array|`[...operators]`|The operators to be used, in case you want to change or translate [the default ones](https://github.com/tiagofernandez/mui-querybuilder/blob/master/src/operators.js).
|**onChange**|func|`null`|Function `(query: object, valid: bool) => void` with the current query and its validity (`true` if all rules have `values`).
|**query**|object|`{ combinator: "and", rules: [{ field: null, operator: null, value: null }] }`|The initial query to be rendered.
|**sortFilters**|bool|`true`|Option to disable sorting filters within their groups.

### Utility functions

```js
import MuiQueryBuilder from "mui-querybuilder";

// Formats a query by deleting IDs from all nodes.
const formattedQuery = MuiQueryBuilder.formatQuery(query);

// Verifies if a query is valid, i.e. all rules and nested groups are filled.
const valid = MuiQueryBuilder.isQueryValid(query);
```

## License

This project is licensed under the terms of the [MIT license](/LICENSE).
