import { css } from 'lit';

export const sliderStyles = css`
  :host {
    display: inline-block; position: relative; container-type: inline-size;
    width: 280px; max-width: 100%; aspect-ratio: 1; vertical-align: middle;
    touch-action: none; user-select: none; border-radius: 4px; letter-spacing: 0;
  }
  :host(:focus-visible) { outline: 2px solid currentColor; outline-offset: 4px; }
  :host(.is-pointer-focused) { outline: none; }
  :host(.is-disabled) { opacity: .45; }
  :host(.is-disabled), :host([aria-readonly=true]) { touch-action: auto; }
  .dial { display: block; width: 100%; height: 100%; overflow: visible; }
  .draggable { cursor: grab; }
  :host(.is-dragging) .draggable { cursor: grabbing; }
  .knob-ring { transform-box: fill-box; transform-origin: center; }
  .draggable .knob-ring { animation: knob-pulse 1500ms ease-out infinite; }
  :host(.is-dragging) .knob-ring { animation-play-state: paused; }
  @keyframes knob-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(.8); } }
  @media (prefers-reduced-motion: reduce) { .draggable .knob-ring { animation: none; } }
  .labels {
    position: absolute; inset: 22%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    pointer-events: none; min-width: 0;
  }
  .default-labels { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr); justify-items: center; }
  .label, .value { max-width: 100%; overflow-wrap: anywhere; }
  .label { grid-row: 1; align-self: end; margin-bottom: var(--label-gap, 0.5rem); font-size: min(var(--label-font-size, 1rem), 6cqi); line-height: 1.15; }
  .label-bottom { grid-row: 3; align-self: start; margin-bottom: 0; margin-top: var(--label-gap, 0.5rem); }
  .value {
    grid-row: 2; position: relative; font-size: min(var(--value-font-size, 3rem), 18cqi);
    line-height: 1; font-variant-numeric: tabular-nums;
  }
  [data-slider-value] { display: block; }
  .affix { position: absolute; bottom: 0; width: max-content; max-width: max(0px, calc(42cqi - 50%)); font-size: .4em; }
  .prefix { right: 100%; margin-right: .3em; text-align: right; }
  .suffix { left: 100%; margin-left: .3em; text-align: left; }
  .affix:empty { display: none; }
  .knob-content {
    position: absolute; transform: translate(-50%, -50%); display: grid;
    place-items: center; color: white; pointer-events: none; line-height: 1;
  }
  ::slotted(*) { pointer-events: none; max-width: 100%; overflow-wrap: anywhere; }
`;
