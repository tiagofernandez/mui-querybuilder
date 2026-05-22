import {
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddCircleOutline as AddIcon, RemoveCircleOutline as RemoveIcon } from "@mui/icons-material";
import { Button, Grid, IconButton, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useContext } from "react";

import Field from "./Field";
import Operator from "./Operator";
import Value from "./Value";
import Context from "./context";
import type { Rule as RuleType } from "./context";

interface RuleProps {
    id: number;
    level: number;
    position: number;
    rule: RuleType;
}

const SortableRule = (props: RuleProps) => {
    const { id, level, position, rule } = props;
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Rule id={id} level={level} position={position} rule={rule} />
        </div>
    );
};

const Rule = (props: RuleProps) => {
    const context = useContext(Context);
    const { id, level, position, rule } = props;
    const { combinator, field, operator, rules, value } = rule;
    const { dispatch } = context;

    const testId = `${level}-${position}`;

    return combinator ? (
        <RuleGroup combinator={combinator} id={id} level={level + 1} rules={rules ?? []} />
    ) : (
        <Grid
            container
            data-testid={`rule-${testId}`}
            spacing={2}
            sx={{
                "& > div": { my: 0.5 },
                cursor: "move",
            }}
        >
            <Grid>
                <IconButton
                    data-testid={`rule-${testId}-remove`}
                    size="small"
                    sx={{ mr: -1, mt: 0.75 }}
                    onClick={() => dispatch({ type: "remove-node", id })}
                >
                    <RemoveIcon sx={{ color: "rgba(255, 0, 0, 0.9)" }} />
                </IconButton>
            </Grid>
            <Grid>
                <Field field={field ?? null} id={id} testId={testId} />
            </Grid>
            <Grid>
                <Operator field={field ?? null} id={id} operator={operator ?? null} testId={testId} />
            </Grid>
            <Grid sx={{ flex: "auto" }}>
                <Value field={field ?? null} id={id} operator={operator ?? null} testId={testId} value={value} />
            </Grid>
        </Grid>
    );
};

interface Combinator {
    label: string;
    value: string;
}

interface RuleGroupProps {
    combinator?: string;
    combinators?: Combinator[];
    id: number;
    level: number;
    rules?: RuleType[];
}

const defaultCombinators: Combinator[] = [
    { label: "AND", value: "and" },
    { label: "OR", value: "or" },
];

const RuleGroup = (props: RuleGroupProps) => {
    const { combinator = "and", combinators = defaultCombinators, id, level, rules = [] } = props;

    const context = useContext(Context);
    const { dispatch, maxLevels } = context;

    const testId = `group-${level}`;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const ruleIds = rules.map((r) => r.id as number);
            const oldIndex = ruleIds.indexOf(active.id as number);
            const newIndex = ruleIds.indexOf(over.id as number);
            const newRules = arrayMove(rules, oldIndex, newIndex);
            // Dispatch individual move events to keep reducer in sync
            dispatch({ type: "move-rule", id, removedIndex: oldIndex, addedIndex: newIndex });
            void newRules; // arrayMove used for index calculation
        }
    };

    return level <= maxLevels ? (
        <Grid
            container
            data-testid={testId}
            direction="column"
            spacing={1}
            sx={{
                borderLeft: level > 0 ? "2px solid" : "none",
                borderColor: "divider",
                pl: 1.5,
                mb: 0.5,
                mt: level > 0 ? 0.5 : 0,
            }}
        >
            <Grid>
                <Grid container spacing={2}>
                    <Grid>
                        <IconButton
                            data-testid={`${testId}-remove`}
                            disabled={level === 0}
                            size="small"
                            sx={{ mr: -1, mt: 0.75 }}
                            onClick={() => dispatch({ type: "remove-node", id })}
                        >
                            <RemoveIcon sx={{ color: level > 0 ? "rgba(255, 0, 0, 0.9)" : undefined }} />
                        </IconButton>
                    </Grid>
                    <Grid>
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={combinator}
                            onChange={(_event, value) => {
                                if (value) {
                                    dispatch({ type: "set-combinator", id, value });
                                }
                            }}
                        >
                            {combinators.map((item) => (
                                <ToggleButton
                                    key={item.value}
                                    data-testid={`${testId}-combinator-${item.value}`}
                                    sx={{ height: 36, px: 1.5 }}
                                    value={item.value}
                                >
                                    <Typography variant="body2">{item.label}</Typography>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid>
                        <Button
                            color="primary"
                            data-testid={`${testId}-add-rule`}
                            sx={{
                                textTransform: "none",
                                "& svg": { mr: 0.5, mt: 0.25 },
                            }}
                            onClick={() => dispatch({ type: "add-rule", id })}
                        >
                            <AddIcon />
                            Rule
                        </Button>
                    </Grid>
                    {level < maxLevels && (
                        <Grid>
                            <Button
                                color="primary"
                                data-testid={`${testId}-add-group`}
                                sx={{
                                    textTransform: "none",
                                    "& svg": { mr: 0.5, mt: 0.25 },
                                }}
                                onClick={() => dispatch({ type: "add-group", id })}
                            >
                                <AddIcon />
                                Group
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {rules.length > 0 && (
                <Grid>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={rules.map((r) => r.id as number)}
                            strategy={verticalListSortingStrategy}
                        >
                            {rules.map((rule, position) => (
                                <SortableRule
                                    key={rule.id}
                                    id={rule.id as number}
                                    level={level}
                                    position={position}
                                    rule={rule}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </Grid>
            )}
        </Grid>
    ) : (
        <span />
    );
};

export default RuleGroup;
