// reducer.ts
export type ActionType =
    | { type: 'init'; payload: Partial<State> }
    | { type: 'setKnobPosition'; payload: Partial<State> }
    | { type: 'onMouseDown'; payload: Partial<State> }
    | { type: 'onMouseUp'; payload: Partial<State> }
    | { type: 'setInitialKnobPosition'; payload: Partial<State> }
    | { type: 'updateDimensions'; payload: Partial<State> };

export interface State {
    mounted: boolean;
    isDragging: boolean;
    width: number;
    radius: number;
    knobOffset: number;
    label: string | number;
    data: (string | number)[];
    radians: number;
    offset: number;
    knob: {
        x: number;
        y: number;
    };
    dashFullArray: number;
    dashFullOffset: number;
}

const reducer = (state: State, action: ActionType): State => {
    switch (action.type) {
        case 'init':
        case 'setKnobPosition':
        case 'onMouseDown':
        case 'onMouseUp':
        case 'setInitialKnobPosition':
        case 'updateDimensions':
            return {
                ...state,
                ...action.payload,
            };
        default:
            throw new Error('Unknown action type');
    }
};

export default reducer;