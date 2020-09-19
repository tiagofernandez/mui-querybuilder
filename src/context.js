import React from "react";

export default React.createContext({
    dispatch: null,
    filter: [],
    filtersByValue: {},
    flattenedFilters: [],
    maxLevel: null,
    operators: [],
    operatorsByType: {},
    operatorsByValue: {},
});
