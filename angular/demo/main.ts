import { ChangeDetectionStrategy, Component, computed, linkedSignal, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { disabled, form, FormField, max as maximum, min as minimum } from '@angular/forms/signals';
import { CircularSliderComponent } from '@fiojs/ng-circular-slider';
import { LucideChevronDown, LucideCopy } from '@lucide/angular';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CircularSliderComponent, FormField, LucideCopy, LucideChevronDown],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AppComponent {
  readonly tabs = ['Range', 'Arc Gauge', 'Custom Data', 'Forms', 'Templates'];
  readonly active = signal('Range');
  readonly value = signal(42);
  readonly speed = signal(80);
  readonly size = signal('M');
  readonly charge = signal(65);
  readonly settings = signal({ min: 0, max: 100, step: 1, direction: '1', trackDraggable: true, readonlyMode: false, disabled: false });
  readonly settingsForm = form(this.settings, path => minimum(path.step, 0.01));
  readonly min = computed(() => this.settings().min);
  readonly max = computed(() => this.settings().max);
  readonly step = computed(() => this.settings().step);
  readonly direction = computed<1 | -1>(() => this.settings().direction === '-1' ? -1 : 1);
  readonly trackDraggable = computed(() => this.settings().trackDraggable);
  readonly readonlyMode = computed(() => this.settings().readonlyMode);
  readonly disabled = computed(() => this.settings().disabled);
  readonly speedForm = form(this.speed, path => { minimum(path, 0); maximum(path, 160); });
  readonly sizeForm = form(this.size);
  readonly chargeForm = form(this.charge, path => { minimum(path, 0); maximum(path, 100); });
  readonly dragging = signal(false);
  readonly speedColors = ['#22c55e', '#eab308', '#ef4444'];
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];
  readonly formModel = signal(55);
  readonly formDisabled = signal(false);
  readonly formValue = form(this.formModel, path => {
    minimum(path, 0);
    maximum(path, 100);
    disabled(path, () => this.formDisabled());
  });
  readonly showCode = signal(false);
  readonly example = computed(() => {
    switch (this.active()) {
      case 'Arc Gauge': return { title: 'Speed gauge', props: ['arcStart', 'arcEnd', 'trackGradient', 'progressGradient'] };
      case 'Custom Data': return { title: 'Custom values', props: ['data', 'value', 'label', 'trackDraggable'] };
      case 'Forms': return { title: 'Signal form', props: ['formField', 'signal', 'form', 'disabled'] };
      case 'Templates': return { title: 'Custom templates', props: ['labelTemplate', 'knobTemplate', 'value'] };
      default: return { title: 'Numeric range', props: ['value', 'min / max', 'step', 'direction', 'trackDraggable'] };
    }
  });

  selectTab(tab: string): void { this.active.set(tab); this.copied.set('Copy code'); this.showCode.set(false); }
  toggleFormDisabled(): void { this.formDisabled.update(value => !value); }
  resetForm(): void { this.formModel.set(40); this.formValue().reset(); }
  async copyCode(): Promise<void> {
    try { await navigator.clipboard.writeText(this.code()); this.copied.set('Copied'); }
    catch { this.copied.set('Copy failed'); }
  }

  readonly code = computed(() => {
    const imports = "import { CircularSliderComponent } from '@fiojs/ng-circular-slider';\n";
    switch (this.active()) {
      case 'Arc Gauge': return imports + `\n<fio-circular-slider\n  [(value)]="speed"\n  [max]="160"\n  [arcStart]="225"\n  [arcEnd]="135"\n  [trackGradient]="['#22c55e', '#eab308', '#ef4444']"\n  [progressGradient]="['#22c55e', '#eab308', '#ef4444']"\n  [trackDraggable]="true"\n  label="Speed"\n  appendToValue=" km/h"\n/>`;
      case 'Custom Data': return imports + `\n<fio-circular-slider\n  [data]="['XS', 'S', 'M', 'L', 'XL']"\n  [(value)]="size"\n  label="Size"\n  [trackDraggable]="true"\n/>`;
      case 'Forms': return imports + "import { signal } from '@angular/core';\nimport { form, FormField, min, max } from '@angular/forms/signals';\n\nreadonly volume = signal(55);\nreadonly volumeForm = form(this.volume, path => {\n  min(path, 0);\n  max(path, 100);\n});\n\n<fio-circular-slider\n  [formField]=\"volumeForm\"\n  label=\"Volume\"\n  appendToValue=\"%\"\n  [trackDraggable]=\"true\"\n/>";
      case 'Templates': return imports + `\n<ng-template #center let-value>\n  <strong>{{ value }}%</strong>\n  <span>Battery</span>\n</ng-template>\n\n<fio-circular-slider\n  [(value)]="charge"\n  [max]="100"\n  [labelTemplate]="center"\n  [trackDraggable]="true"\n  label="Battery"\n/>`;
      default: return imports + `import { signal } from '@angular/core';\n\nreadonly value = signal(42);\n\n<fio-circular-slider\n  [(value)]="value"\n  [min]="${this.min()}"\n  [max]="${this.max()}"\n  [step]="${this.step()}"\n  [direction]="${this.direction()}"\n  [trackDraggable]="${this.trackDraggable()}"\n  [disabled]="${this.disabled()}"\n  [readonly]="${this.readonlyMode()}"\n  label="Value"\n/>`;
    }
  });
  readonly codeLines = computed(() => this.code().split('\n').map(line => hljs.highlightAuto(line, ['typescript', 'xml']).value));
  readonly copied = linkedSignal({ source: this.code, computation: () => 'Copy code' });
}

bootstrapApplication(AppComponent).catch(console.error);
