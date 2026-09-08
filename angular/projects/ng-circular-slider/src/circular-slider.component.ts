import { NgTemplateOutlet } from '@angular/common';
import {
  APP_ID, ChangeDetectionStrategy, Component, ElementRef, Injectable, OnChanges, OnDestroy,
  TemplateRef, booleanAttribute, computed, forwardRef, inject, input, linkedSignal,
  numberAttribute, output, signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CircularSliderTemplateContext, GradientStop, KnobPosition, SliderValue,
  arcPath, arcSpan, clamp, colorStops, finite, pointAt, positionAngle,
  progressAtAngle, snapValue,
} from './slider-math';

interface SliderSelection { value: SliderValue; index: number; }
interface SelectionSource {
  value: SliderValue | null | undefined;
  index: number | undefined;
  data: readonly SliderValue[];
  min: number;
  max: number;
  step: number;
}

@Injectable({ providedIn: 'root' })
class SliderIds {
  private nextId = 0;
  next(): number { return this.nextId++; }
}

@Component({
  selector: 'fio-circular-slider',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './circular-slider.component.html',
  styleUrl: './circular-slider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CircularSliderComponent), multi: true }],
  host: {
    role: 'slider',
    '[attr.tabindex]': 'disabledState() ? -1 : 0',
    '[attr.aria-label]': 'ariaLabel() || label() || "Circular slider"',
    '[attr.aria-valuemin]': 'hasData() ? 0 : lowerBound()',
    '[attr.aria-valuemax]': 'hasData() ? data().length - 1 : upperBound()',
    '[attr.aria-valuenow]': 'hasData() ? selectedIndex() : selectedValue()',
    '[attr.aria-valuetext]': 'valueText()',
    '[attr.aria-disabled]': 'disabledState()',
    '[attr.aria-readonly]': 'readonly()',
    '[style.width.px]': 'size()',
    '[class.is-disabled]': 'disabledState()',
    '[class.is-dragging]': 'dragging()',
    '(pointerdown)': 'pointerDown($event)',
    '(pointermove)': 'pointerMove($event)',
    '(pointerup)': 'pointerEnd($event)',
    '(pointercancel)': 'pointerEnd($event)',
    '(lostpointercapture)': 'pointerEnd($event)',
    '(keydown)': 'keyDown($event)',
    '(blur)': 'blur()',
  },
})
export class CircularSliderComponent<T extends SliderValue = number> implements ControlValueAccessor, OnChanges, OnDestroy {
  readonly value = input<T | null>();
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(360, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly data = input<readonly T[]>([]);
  readonly dataIndex = input<number>();
  readonly width = input(280, { transform: numberAttribute });
  readonly direction = input<1 | -1>(1);
  readonly knobPosition = input<KnobPosition>('top');
  readonly arcStart = input<number>();
  readonly arcEnd = input<number>();
  readonly label = input('ANGLE');
  readonly ariaLabel = input('');
  readonly sliderId = input('');
  readonly labelColor = input('#272b77');
  readonly labelBottom = input(false, { transform: booleanAttribute });
  readonly labelFontSize = input('1rem');
  readonly valueFontSize = input('3rem');
  readonly appendToValue = input('');
  readonly prependToValue = input('');
  readonly verticalOffset = input('0.5rem');
  readonly hideLabelValue = input(false, { transform: booleanAttribute });
  readonly hideKnob = input(false, { transform: booleanAttribute });
  readonly hideKnobRing = input(false, { transform: booleanAttribute });
  readonly knobDraggable = input(true, { transform: booleanAttribute });
  readonly trackDraggable = input(false, { transform: booleanAttribute });
  readonly limitDragRange = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly knobColor = input('#4e63ea');
  readonly knobSize = input(36, { transform: numberAttribute });
  readonly progressColorFrom = input('#80c3f3');
  readonly progressColorTo = input('#4990e2');
  readonly progressGradient = input<readonly (string | GradientStop)[]>([]);
  readonly progressSize = input(8, { transform: numberAttribute });
  readonly progressLineCap = input<'round' | 'butt'>('round');
  readonly trackColor = input('#dddefb');
  readonly trackGradient = input<readonly (string | GradientStop)[]>([]);
  readonly trackSize = input(8, { transform: numberAttribute });
  readonly knobTemplate = input<TemplateRef<CircularSliderTemplateContext> | null>(null);
  readonly labelTemplate = input<TemplateRef<CircularSliderTemplateContext> | null>(null);

  readonly valueChange = output<T>();
  readonly dataIndexChange = output<number>();
  readonly draggingChange = output<boolean>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly generatedId = `${inject(APP_ID)}-circular-slider-${inject(SliderIds).next()}`;
  private activePointer: number | null = null;
  private readonly formDisabled = signal(false);
  private onFormChange: (value: SliderValue) => void = () => {};
  private onFormTouched: () => void = () => {};
  protected readonly dragging = signal(false);

  protected readonly hasData = computed(() => this.data().length > 0);
  protected readonly lowerBound = computed(() => finite(this.min(), 0));
  protected readonly upperBound = computed(() => Math.max(this.lowerBound(), finite(this.max(), 360)));
  protected readonly increment = computed(() => this.step() > 0 ? finite(this.step(), 1) : 1);
  protected readonly lastIndex = computed(() => this.hasData() ? this.data().length - 1 : Math.ceil((this.upperBound() - this.lowerBound()) / this.increment()));

  // Preserve user selection when bounds or data change, without emitting a form write back.
  private readonly selection = linkedSignal<SelectionSource, SliderSelection>({
    source: () => ({ value: this.value(), index: this.dataIndex(), data: this.data(), min: this.lowerBound(), max: this.upperBound(), step: this.increment() }),
    computation: (source, previous) => {
      if (previous ? !Object.is(source.value, previous.source.value) : source.value !== undefined) return this.selectionFor(source.value);
      if (source.index !== undefined && (!previous || source.index !== previous.source.index)) return this.selectionAt(source.index);
      return this.selectionFor(previous?.value.value ?? source.value);
    },
  });
  protected readonly selectedValue = computed(() => this.selection().value);
  protected readonly selectedIndex = computed(() => this.selection().index);
  protected readonly size = computed(() => Math.max(40, finite(this.width(), 280)));
  protected readonly knobDiameter = computed(() => clamp(finite(this.knobSize(), 36), 0, this.size() / 2));
  protected readonly trackWidth = computed(() => clamp(finite(this.trackSize(), 8), 0, this.size() / 2));
  protected readonly progressWidth = computed(() => clamp(finite(this.progressSize(), 8), 0, this.size() / 2));
  protected readonly radius = computed(() => Math.max(1, (this.size() - Math.max(this.knobDiameter(), this.trackWidth(), this.progressWidth())) / 2 - 2));
  protected readonly disabledState = computed(() => this.disabled() || this.formDisabled());
  protected readonly hasArc = computed(() => Number.isFinite(this.arcStart()) && Number.isFinite(this.arcEnd()));
  protected readonly rotation = computed(() => this.direction() === -1 ? -1 : 1);
  protected readonly start = computed(() => this.hasArc() ? this.arcStart()! : positionAngle(this.knobPosition()));
  protected readonly span = computed(() => this.hasArc() ? arcSpan(this.start(), this.arcEnd()!, this.rotation()) : 360);
  protected readonly progress = computed(() => {
    if (this.hasData()) return this.lastIndex() ? this.selectedIndex() / this.lastIndex() : 0;
    const length = this.upperBound() - this.lowerBound();
    return length ? (Number(this.selectedValue()) - this.lowerBound()) / length : 0;
  });
  protected readonly path = computed(() => arcPath(this.start(), this.span(), this.rotation(), this.radius(), this.size() / 2));
  protected readonly knobPoint = computed(() => pointAt(this.start() + this.progress() * this.span() * this.rotation(), this.radius(), this.size() / 2));
  protected readonly gradientStart = computed(() => this.span() < 360 ? pointAt(this.start(), this.radius(), this.size() / 2) : { x: 0, y: this.size() / 2 });
  protected readonly gradientEnd = computed(() => this.span() < 360 ? pointAt(this.start() + this.span() * this.rotation(), this.radius(), this.size() / 2) : { x: this.size(), y: this.size() / 2 });
  protected readonly gradientId = computed(() => this.sliderId() || this.generatedId);
  protected readonly progressStops = computed(() => colorStops(this.progressGradient().length ? this.progressGradient() : [this.progressColorFrom(), this.progressColorTo()]));
  protected readonly trackStops = computed(() => colorStops(this.trackGradient()));
  protected readonly valueText = computed(() => `${this.prependToValue()}${this.selectedValue()}${this.appendToValue()}`);
  protected readonly templateContext = computed<CircularSliderTemplateContext>(() => ({ $implicit: this.selectedValue(), value: this.selectedValue(), label: this.label() }));

  ngOnChanges(): void {
    if (this.disabledState() || this.readonly()) this.finishDrag(false);
  }

  writeValue(value: SliderValue | null): void { this.setValue(value); }
  registerOnChange(fn: (value: SliderValue) => void): void { this.onFormChange = fn; }
  registerOnTouched(fn: () => void): void { this.onFormTouched = fn; }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.finishDrag(false);
  }

  private selectionFor(value: SliderValue | null | undefined): SliderSelection {
    if (this.hasData()) {
      const index = Math.max(0, this.data().indexOf(value as T));
      return { index, value: this.data()[index] };
    }
    const selected = snapValue(typeof value === 'number' ? value : this.lowerBound(), this.lowerBound(), this.upperBound(), this.increment());
    return { value: selected, index: selected === this.upperBound() ? this.lastIndex() : Math.round((selected - this.lowerBound()) / this.increment()) };
  }

  private selectionAt(index: number): SliderSelection {
    const next = clamp(Math.round(finite(index, 0)), 0, this.lastIndex());
    return this.hasData() ? { index: next, value: this.data()[next] }
      : this.selectionFor(next === this.lastIndex() ? this.upperBound() : this.lowerBound() + next * this.increment());
  }

  private setValue(value: SliderValue | null | undefined): void { this.selection.set(this.selectionFor(value)); }
  private setIndex(index: number): void { this.selection.set(this.selectionAt(index)); }

  private changeValue(update: () => void): void {
    const previous = this.selectedValue();
    const previousIndex = this.selectedIndex();
    update();
    if (previous !== this.selectedValue()) {
      this.onFormChange(this.selectedValue());
      this.valueChange.emit(this.selectedValue() as T);
    }
    if (previousIndex !== this.selectedIndex()) this.dataIndexChange.emit(this.selectedIndex());
  }

  protected pointerDown(event: PointerEvent): void {
    if (this.disabledState() || this.readonly() || this.activePointer !== null || event.button !== 0 || !event.isPrimary) return;
    const target = event.target as Element;
    const isKnob = Boolean(target.closest('[data-knob]'));
    const isTrack = Boolean(target.closest('[data-track]'));
    if (isKnob ? !this.knobDraggable() : !isTrack || !this.trackDraggable()) return;
    event.preventDefault();
    this.element.nativeElement.focus({ preventScroll: true });
    this.activePointer = event.pointerId;
    this.element.nativeElement.setPointerCapture(event.pointerId);
    this.dragging.set(true);
    this.draggingChange.emit(true);
    if (!isKnob) this.updateFromPointer(event, false);
  }

  protected pointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.activePointer || this.disabledState() || this.readonly()) return;
    event.preventDefault();
    this.updateFromPointer(event, true);
  }

  private updateFromPointer(event: PointerEvent, continuous: boolean): void {
    const bounds = this.element.nativeElement.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(x, y) < 1) return;
    const angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    let progress = progressAtAngle(angle, this.start(), this.span(), this.rotation());
    if (continuous && this.limitDragRange() && this.span() === 360) {
      if (this.progress() > 0.75 && progress < 0.25) progress = 1;
      else if (this.progress() < 0.25 && progress > 0.75) progress = 0;
    }
    this.changeValue(() => this.hasData()
      ? this.setIndex(progress * this.lastIndex())
      : this.setValue(this.lowerBound() + progress * (this.upperBound() - this.lowerBound())));
  }

  protected pointerEnd(event: PointerEvent): void {
    if (event.pointerId === this.activePointer) this.finishDrag(true);
  }

  private finishDrag(touched: boolean, emit = true): void {
    if (this.activePointer === null) return;
    const pointer = this.activePointer;
    this.activePointer = null;
    this.dragging.set(false);
    if (this.element.nativeElement.hasPointerCapture?.(pointer)) this.element.nativeElement.releasePointerCapture(pointer);
    if (emit) this.draggingChange.emit(false);
    if (touched) this.onFormTouched();
  }

  protected keyDown(event: KeyboardEvent): void {
    if (this.disabledState() || this.readonly()) return;
    let index = this.selectedIndex();
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': index++; break;
      case 'ArrowLeft': case 'ArrowDown': index--; break;
      case 'PageUp': index += 10; break;
      case 'PageDown': index -= 10; break;
      case 'Home': index = 0; break;
      case 'End': index = this.lastIndex(); break;
      default: return;
    }
    event.preventDefault();
    this.changeValue(() => this.setIndex(index));
  }

  protected blur(): void { this.onFormTouched(); }
  ngOnDestroy(): void { this.finishDrag(false, false); }
}
