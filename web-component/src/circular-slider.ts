import { LitElement, html, svg, nothing, type PropertyDeclaration, type PropertyValues, type CSSResultGroup } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import {
  arcPath, arcSpan, clamp, colorStops, finite, normalizeAngle, pointAt, positionAngle,
  progressAtAngle, type GradientStop, type KnobPosition, type SliderValue,
} from '../../shared/slider-math.js';
import { boundsFor, selectionAt, selectionFor, type Selection } from './selection.js';
import { safeColor, safeLength, safeOffset } from './safe-style.js';
import { sliderStyles } from './styles.js';

const booleanOption = { type: Boolean, converter: { fromAttribute: (value: string | null) => value !== null && value !== 'false' } };
const positionConverter = { fromAttribute: (value: string | null): KnobPosition => value !== null && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : (value ?? 'top') as KnobPosition };

/** A native form-associated circular slider. Register explicitly or import the /register entry. */
export class CircularSliderElement extends LitElement {
  static readonly formAssociated = true;
  static override styles: CSSResultGroup = sliderStyles;
  static override properties = {
    value: { noAccessor: true }, dataIndex: { type: Number, attribute: 'data-index', noAccessor: true },
    min: { type: Number }, max: { type: Number }, step: { type: Number }, data: { attribute: false },
    width: { type: Number }, direction: { type: Number }, knobPosition: { attribute: 'knob-position', converter: positionConverter },
    arcStart: { type: Number, attribute: 'arc-start' }, arcEnd: { type: Number, attribute: 'arc-end' },
    label: {}, ariaLabel: { attribute: 'aria-label' }, name: { reflect: true }, required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true }, readonly: { type: Boolean, reflect: true },
    labelColor: { attribute: 'label-color' }, labelBottom: { ...booleanOption, attribute: 'label-bottom' },
    labelFontSize: { attribute: 'label-font-size' }, valueFontSize: { attribute: 'value-font-size' },
    appendToValue: { attribute: 'append-to-value' }, prependToValue: { attribute: 'prepend-to-value' },
    verticalOffset: { attribute: 'vertical-offset' }, hideLabelValue: { ...booleanOption, attribute: 'hide-label-value' },
    hideKnob: { ...booleanOption, attribute: 'hide-knob' }, hideKnobRing: { ...booleanOption, attribute: 'hide-knob-ring' },
    knobDraggable: { ...booleanOption, attribute: 'knob-draggable' }, trackDraggable: { ...booleanOption, attribute: 'track-draggable' },
    limitDragRange: { ...booleanOption, attribute: 'limit-drag-range' }, knobColor: { attribute: 'knob-color' },
    knobSize: { type: Number, attribute: 'knob-size' }, progressColorFrom: { attribute: 'progress-color-from' },
    progressColorTo: { attribute: 'progress-color-to' }, progressGradient: { attribute: false },
    progressSize: { type: Number, attribute: 'progress-size' }, progressLineCap: { attribute: 'progress-line-cap' },
    trackColor: { attribute: 'track-color' }, trackGradient: { attribute: false }, trackSize: { type: Number, attribute: 'track-size' },
  };

  min = 0;
  max = 360;
  step = 1;
  data: readonly SliderValue[] = [];
  width = 280;
  direction: 1 | -1 = 1;
  knobPosition: KnobPosition = 'top';
  arcStart?: number;
  arcEnd?: number;
  label = 'ANGLE';
  override ariaLabel = '';
  name = '';
  required = false;
  disabled = false;
  readonly = false;
  labelColor = '#202326';
  labelBottom = false;
  labelFontSize = '1rem';
  valueFontSize = '3rem';
  appendToValue = '';
  prependToValue = '';
  verticalOffset = '0.5rem';
  hideLabelValue = false;
  hideKnob = false;
  hideKnobRing = false;
  knobDraggable = true;
  trackDraggable = false;
  limitDragRange = true;
  knobColor = '#0891b2';
  knobSize = 36;
  progressColorFrom = '#67e8f9';
  progressColorTo = '#0d9488';
  progressGradient: readonly (string | GradientStop)[] = [];
  progressSize = 8;
  progressLineCap: 'round' | 'butt' = 'round';
  trackColor = '#e5e7eb';
  trackGradient: readonly (string | GradientStop)[] = [];
  trackSize = 8;

  private internals?: ElementInternals;
  private selection: Selection = { value: 0, index: 0 };
  private requestedValue?: SliderValue;
  private requestedIndex?: number;
  private valuePending = false;
  private indexPending = false;
  private initialized = false;
  private initialValue?: SliderValue;
  private fieldsetDisabled = false;
  private customError = '';
  private activePointer: number | null = null;
  private dragStartValue?: SliderValue;
  private lastPointerAngle = 0;
  private dragProgress = 0;
  private keyStartValue?: SliderValue;
  private reflectingAria = false;

  constructor() {
    super();
    // Lit's Node entry supplies its own base class; don't attach browser internals on the server.
    if (typeof globalThis.HTMLElement !== 'undefined' && typeof this.attachInternals === 'function') this.internals = this.attachInternals();
    this.addEventListener('pointerdown', this.pointerDown);
    this.addEventListener('pointermove', this.pointerMove);
    this.addEventListener('pointerup', this.pointerEnd);
    this.addEventListener('pointercancel', this.pointerEnd);
    this.addEventListener('lostpointercapture', this.pointerEnd);
    this.addEventListener('keydown', this.keyDown);
    this.addEventListener('keyup', this.keyUp);
    this.addEventListener('blur', this.onBlur);
  }

  get value(): SliderValue { return this.valuePending ? this.requestedValue ?? this.selection.value : this.selection.value; }
  set value(value: SliderValue) {
    const old = this.value;
    if (this.initialized && Object.is(value, old)) return;
    this.requestedValue = value;
    this.valuePending = true;
    this.indexPending = false;
    this.requestUpdate('value', old);
  }

  get dataIndex(): number { return this.indexPending ? this.requestedIndex ?? 0 : this.selection.index; }
  set dataIndex(index: number) {
    const old = this.dataIndex;
    if (this.initialized && Object.is(index, old)) return;
    this.requestedIndex = index;
    this.indexPending = true;
    this.valuePending = false;
    this.requestUpdate('dataIndex', old);
  }

  get form(): HTMLFormElement | null { return this.internals?.form ?? null; }
  get labels(): NodeList | undefined { return this.internals?.labels; }
  get validity(): ValidityState | undefined { return this.internals?.validity; }
  get validationMessage(): string { return this.internals?.validationMessage ?? ''; }
  get willValidate(): boolean { return this.internals?.willValidate ?? false; }
  get dragging(): boolean { return this.activePointer !== null; }
  get disabledState(): boolean { return this.disabled || this.fieldsetDisabled; }

  checkValidity(): boolean { this.syncForm(); return this.internals?.checkValidity() ?? true; }
  reportValidity(): boolean { this.syncForm(); return this.internals?.reportValidity() ?? true; }
  setCustomValidity(message: string): void { this.customError = String(message); this.syncForm(); this.requestUpdate(); }

  override requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration): void {
    super.requestUpdate(name, oldValue, options);
    if (!this.initialized || !name) return;
    if (['value', 'dataIndex', 'data', 'min', 'max', 'step'].includes(String(name))) {
      this.reconcile();
      // A programmatic write cancels a gesture without pretending it was a user commit.
      this.finishDrag(false);
      this.keyStartValue = undefined;
    }
    if (this.disabledState || this.readonly) { this.finishDrag(false); this.keyStartValue = undefined; }
    this.syncForm();
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (name === 'aria-label' && this.reflectingAria) return;
    super.attributeChangedCallback(name, old, value);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.reconcile();
    this.syncForm();
  }

  override disconnectedCallback(): void {
    this.finishDrag(false);
    this.keyStartValue = undefined;
    super.disconnectedCallback();
  }

  protected override willUpdate(_changed: PropertyValues): void {
    this.reconcile();
    if (!this.initialized) { this.initialValue = this.selection.value; this.initialized = true; }
    this.syncForm();
  }

  protected override updated(): void {
    this.setAttribute('role', 'slider');
    this.tabIndex = this.disabledState ? -1 : 0;
    this.reflectingAria = true;
    this.setAttribute('aria-label', this.ariaLabel || this.label || 'Circular slider');
    this.reflectingAria = false;
    this.setAttribute('aria-valuemin', String(this.items.length ? 0 : this.bounds.min));
    this.setAttribute('aria-valuemax', String(this.items.length ? this.bounds.last : this.bounds.max));
    this.setAttribute('aria-valuenow', String(this.items.length ? this.selection.index : this.selection.value === '' ? this.bounds.min : this.selection.value));
    this.setAttribute('aria-valuetext', `${this.prependToValue}${this.selection.value}${this.appendToValue}`);
    this.setAttribute('aria-disabled', String(this.disabledState));
    this.setAttribute('aria-readonly', String(this.readonly));
    this.setAttribute('aria-required', String(this.required));
    this.setAttribute('aria-invalid', String(this.internals ? !this.internals.validity.valid : false));
    this.classList.toggle('is-disabled', this.disabledState);
    this.classList.toggle('is-dragging', this.dragging);
    this.style.width = `${this.size}px`;
  }

  formAssociatedCallback(): void { this.syncForm(); }
  formDisabledCallback(disabled: boolean): void {
    this.fieldsetDisabled = disabled;
    if (disabled) { this.finishDrag(false); this.keyStartValue = undefined; }
    this.syncForm();
    this.requestUpdate();
  }
  formResetCallback(): void {
    this.value = this.initialValue ?? this.bounds.min;
    this.finishDrag(false);
    this.keyStartValue = undefined;
  }
  formStateRestoreCallback(state: string | File | FormData | null, _mode: 'restore' | 'autocomplete'): void {
    if (typeof state !== 'string') return;
    try {
      const restored: unknown = JSON.parse(state);
      if (restored && typeof restored === 'object' && 'value' in restored && (typeof restored.value === 'string' || typeof restored.value === 'number')) {
        this.value = restored.value;
        return;
      }
    } catch { /* Autofill may supply a plain value instead of the saved JSON state. */ }
    this.value = state;
  }

  private get items(): readonly SliderValue[] {
    return Array.isArray(this.data) ? this.data.filter(item => typeof item === 'string' || typeof item === 'number' && Number.isFinite(item)) : [];
  }
  private get bounds() { return boundsFor(this.min, this.max, this.step, this.items); }
  private get size(): number { return clamp(finite(this.width, 280), 40, 4096); }
  private get knobDiameter(): number { return clamp(finite(this.knobSize, 36), 0, this.size / 2); }
  private get trackWidth(): number { return clamp(finite(this.trackSize, 8), 0, this.size / 2); }
  private get progressWidth(): number { return clamp(finite(this.progressSize, 8), 0, this.size / 2); }
  private get radius(): number { return Math.max(1, (this.size - Math.max(this.knobDiameter, this.trackWidth, this.progressWidth)) / 2 - 2); }
  private get rotation(): 1 | -1 { return this.direction === -1 ? -1 : 1; }
  private get hasArc(): boolean { return Number.isFinite(this.arcStart) && Number.isFinite(this.arcEnd); }
  private get start(): number { return this.hasArc ? this.arcStart! : positionAngle(this.knobPosition); }
  private get span(): number { return this.hasArc ? arcSpan(this.start, this.arcEnd!, this.rotation) : 360; }
  private get progress(): number {
    if (this.items.length) return this.bounds.last ? this.selection.index / this.bounds.last : 0;
    const length = this.bounds.max - this.bounds.min;
    return length && this.selection.value !== '' ? clamp((Number(this.selection.value) - this.bounds.min) / length, 0, 1) : 0;
  }

  private reconcile(): void {
    if (!this.valuePending && !this.indexPending && this.items.length && Object.is(this.items[this.selection.index], this.selection.value)) return;
    this.selection = this.indexPending ? selectionAt(this.requestedIndex ?? 0, this.items, this.bounds)
      : selectionFor(this.valuePending ? this.requestedValue : this.initialized ? this.selection.value : this.requestedValue, this.items, this.bounds);
    this.valuePending = false;
    this.indexPending = false;
    // Retain the resolved initial selection across connectedCallback and the first Lit update.
    this.requestedValue = this.selection.value;
  }

  private syncForm(): void {
    if (!this.internals) return;
    this.internals.setFormValue(this.disabledState ? null : String(this.selection.value), JSON.stringify({ value: this.selection.value }));
    const flags: ValidityStateFlags = {};
    let message = '';
    if (!this.disabledState && !this.readonly) {
      if (this.required && this.selection.value === '') { flags.valueMissing = true; message = 'Please select a value.'; }
      if (this.customError) { flags.customError = true; message = this.customError; }
    }
    // Like a native range input, numeric writes are clamped and snapped; data writes select a valid option.
    this.internals.setValidity(flags, message);
  }

  private emit(type: 'input' | 'change'): void {
    this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
  }

  private userSelection(selection: Selection): void {
    if (Object.is(selection.value, this.selection.value) && selection.index === this.selection.index) return;
    this.selection = selection;
    this.requestedValue = selection.value;
    this.syncForm();
    this.requestUpdate();
    this.emit('input');
  }

  private pointerDown = (event: PointerEvent): void => {
    this.classList.add('is-pointer-focused');
    if (this.disabledState || this.readonly || this.dragging || event.button !== 0 || !event.isPrimary) return;
    const path = event.composedPath();
    const isKnob = path.some(node => node instanceof Element && node.hasAttribute('data-knob'));
    const isTrack = path.some(node => node instanceof Element && node.hasAttribute('data-track'));
    if (isKnob ? !this.knobDraggable : !isTrack || !this.trackDraggable) return;
    event.preventDefault();
    this.commitKey();
    this.focus({ preventScroll: true });
    this.activePointer = event.pointerId;
    this.dragStartValue = this.selection.value;
    this.lastPointerAngle = this.pointerAngle(event) ?? this.start;
    this.dragProgress = this.progress;
    this.setPointerCapture(event.pointerId);
    this.classList.add('is-dragging');
    this.requestUpdate();
    if (!isKnob) this.updateFromPointer(event, false);
  };

  private pointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointer || this.disabledState || this.readonly) return;
    event.preventDefault();
    this.updateFromPointer(event, true);
  };

  private pointerAngle(event: PointerEvent): number | undefined {
    const bounds = this.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    return Math.hypot(x, y) < 1 ? undefined : Math.atan2(y, x) * 180 / Math.PI + 90;
  }

  private updateFromPointer(event: PointerEvent, continuous: boolean): void {
    const angle = this.pointerAngle(event);
    if (angle === undefined) return;
    let progress = progressAtAngle(angle, this.start, this.span, this.rotation);
    if (continuous && this.limitDragRange) {
      // Integrate shortest angular deltas, discarding endpoint overshoot. This also clamps gauge gaps.
      const delta = normalizeAngle(angle - this.lastPointerAngle + 180) - 180;
      progress = clamp(this.dragProgress + delta * this.rotation / this.span, 0, 1);
    }
    this.lastPointerAngle = angle;
    this.dragProgress = progress;
    this.userSelection(this.items.length ? selectionAt(progress * this.bounds.last, this.items, this.bounds)
      : selectionFor(this.bounds.min + progress * (this.bounds.max - this.bounds.min), this.items, this.bounds));
  }

  private pointerEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointer) return;
    this.finishDrag(true);
  };

  private finishDrag(commit: boolean): void {
    if (this.activePointer === null) return;
    const pointer = this.activePointer;
    const changed = !Object.is(this.dragStartValue, this.selection.value);
    this.activePointer = null;
    if (this.hasPointerCapture?.(pointer)) this.releasePointerCapture(pointer);
    this.classList?.remove('is-dragging');
    this.requestUpdate();
    if (commit && changed) this.emit('change');
  }

  private keyDown = (event: KeyboardEvent): void => {
    this.classList.remove('is-pointer-focused');
    if (this.disabledState || this.readonly || event.altKey || event.ctrlKey || event.metaKey) return;
    let index = this.selection.index;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': index++; break;
      case 'ArrowLeft': case 'ArrowDown': index--; break;
      case 'PageUp': index += 10; break;
      case 'PageDown': index -= 10; break;
      case 'Home': index = 0; break;
      case 'End': index = this.bounds.last; break;
      default: return;
    }
    event.preventDefault();
    if (this.keyStartValue === undefined) this.keyStartValue = this.selection.value;
    this.userSelection(selectionAt(index, this.items, this.bounds));
  };
  private keyUp = (event: KeyboardEvent): void => {
    if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) this.commitKey();
  };
  private commitKey(): void {
    const old = this.keyStartValue;
    this.keyStartValue = undefined;
    if (old !== undefined && !Object.is(old, this.selection.value)) this.emit('change');
  }
  private onBlur = (): void => { this.classList.remove('is-pointer-focused'); this.commitKey(); this.finishDrag(true); };

  protected override render() {
    const center = this.size / 2;
    const path = arcPath(this.start, this.span, this.rotation, this.radius, center);
    const point = pointAt(this.start + this.progress * this.span * this.rotation, this.radius, center);
    const from = this.span < 360 ? pointAt(this.start, this.radius, center) : { x: 0, y: center };
    const to = this.span < 360 ? pointAt(this.start + this.span * this.rotation, this.radius, center) : { x: this.size, y: center };
    const stops = colorStops(this.progressGradient.length ? this.progressGradient : [this.progressColorFrom, this.progressColorTo]);
    const cap = this.progressLineCap === 'butt' ? 'butt' : 'round';
    const interactive = !this.disabledState && !this.readonly;
    const color = safeColor(this.knobColor, '#0891b2');
    return html`
      <svg class="dial" viewBox=${`0 0 ${this.size} ${this.size}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="progress-gradient" gradientUnits="userSpaceOnUse" x1=${from.x} y1=${from.y} x2=${to.x} y2=${to.y}>
            ${stops.map(stop => svg`<stop offset=${safeOffset(stop.offset)} stop-color=${safeColor(stop.stopColor, '#0891b2')} stop-opacity=${stop.stopOpacity} />`)}
          </linearGradient>
          <linearGradient id="track-gradient" gradientUnits="userSpaceOnUse" x1=${from.x} y1=${from.y} x2=${to.x} y2=${to.y}>
            ${colorStops(this.trackGradient).map(stop => svg`<stop offset=${safeOffset(stop.offset)} stop-color=${safeColor(stop.stopColor, '#e5e7eb')} stop-opacity=${stop.stopOpacity} />`)}
          </linearGradient>
        </defs>
        <path part="track" d=${path} fill="none" stroke-width=${this.trackWidth} stroke-linecap=${cap}
          stroke=${this.trackGradient.length ? 'url(#track-gradient)' : safeColor(this.trackColor, '#e5e7eb')} pointer-events="none" />
        <path part="progress" class="progress" d=${path} fill="none" pathLength="100" stroke-dasharray="100"
          stroke-dashoffset=${100 * (1 - this.progress)} stroke-width=${this.progressWidth} stroke-linecap=${cap}
          stroke="url(#progress-gradient)" opacity=${this.progress === 0 ? 0 : 1} pointer-events="none" />
        <path data-track d=${path} fill="none" stroke="transparent" stroke-width=${this.trackWidth + 20}
          pointer-events=${this.trackDraggable && interactive ? 'stroke' : 'none'} class=${this.trackDraggable && interactive ? 'draggable' : ''} />
        ${this.hideKnob ? nothing : svg`
          <g part="knob" data-knob transform=${`translate(${point.x},${point.y})`} class=${this.knobDraggable && interactive ? 'draggable' : ''}>
            ${this.hideKnobRing ? nothing : svg`<circle part="knob-ring" class="knob-ring" r=${this.knobDiameter / 2} fill=${color} opacity="0.2" />`}
            <circle r=${this.knobDiameter / 3} fill=${color} />
          </g>`}
      </svg>
      ${this.hideKnob ? nothing : html`<div class="knob-content" aria-hidden="true" inert style=${styleMap({
        left: `${point.x / this.size * 100}%`, top: `${point.y / this.size * 100}%`,
        width: `${this.knobDiameter / this.size * 100}%`, height: `${this.knobDiameter / this.size * 100}%`,
      })}><slot name="knob"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M 2 3 H 10 M 2 6 H 10 M 2 9 H 10" stroke="white" stroke-width="1" /></svg></slot></div>`}
      ${this.hideLabelValue ? nothing : html`<div class="labels" aria-hidden="true" inert style=${styleMap({
        color: safeColor(this.labelColor, '#202326'), gap: safeLength(this.verticalOffset, '0.5rem'),
        '--label-gap': safeLength(this.verticalOffset, '0.5rem'),
        '--label-font-size': safeLength(this.labelFontSize, '1rem'), '--value-font-size': safeLength(this.valueFontSize, '3rem'),
      })}><slot name="label"><div class="default-labels">
        <div class=${this.labelBottom ? 'label label-bottom' : 'label'} part="label">${this.label}</div>
        <div class="value" part="value"><span class="affix prefix">${this.prependToValue}</span><span data-slider-value part="value-number">${this.selection.value}</span><span class="affix suffix">${this.appendToValue}</span></div>
      </div></slot></div>`}
    `;
  }
}

/** Define once in the browser. Calling on a server is an intentional no-op. */
export function registerCircularSlider(tagName = 'fio-circular-slider'): CustomElementConstructor | undefined {
  if (typeof globalThis.HTMLElement === 'undefined' || typeof globalThis.document === 'undefined') return undefined;
  const registry = globalThis.customElements;
  if (!registry) return undefined;
  const existing = registry.get(tagName);
  if (existing) return existing;
  // A constructor cannot be registered under more than one name in the same registry.
  const element = tagName === 'fio-circular-slider' ? CircularSliderElement : class extends CircularSliderElement {};
  registry.define(tagName, element);
  return element;
}

declare global {
  interface HTMLElementTagNameMap { 'fio-circular-slider': CircularSliderElement }
}
