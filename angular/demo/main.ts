import { ChangeDetectionStrategy, Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CircularSliderComponent } from '@fiojs/ng-circular-slider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CircularSliderComponent, FormsModule, ReactiveFormsModule],
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
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly direction = signal<1 | -1>(1);
  readonly trackDraggable = signal(true);
  readonly readonlyMode = signal(false);
  readonly disabled = signal(false);
  readonly dragging = signal(false);
  readonly speedColors = ['#22c55e', '#eab308', '#ef4444'];
  readonly sizes = ['XS', 'S', 'M', 'L', 'XL'];
  readonly formValue = new FormControl(55, { nonNullable: true });
  readonly copied = signal('Copy code');

  selectTab(tab: string): void { this.active.set(tab); this.copied.set('Copy code'); }
  toggleFormDisabled(): void { this.formValue.disabled ? this.formValue.enable() : this.formValue.disable(); }
  async copyCode(): Promise<void> {
    try { await navigator.clipboard.writeText(this.code()); this.copied.set('Copied'); }
    catch { this.copied.set('Copy failed'); }
  }

  readonly code = computed(() => {
    const imports = "import { CircularSliderComponent } from '@fiojs/ng-circular-slider';\n";
    switch (this.active()) {
      case 'Arc Gauge': return imports + `\n<fio-circular-slider\n  [(value)]="speed"\n  [max]="160"\n  [arcStart]="225"\n  [arcEnd]="135"\n  [trackGradient]="['#22c55e', '#eab308', '#ef4444']"\n  [progressGradient]="['#22c55e', '#eab308', '#ef4444']"\n  [trackDraggable]="true"\n  label="Speed"\n  appendToValue=" km/h"\n/>`;
      case 'Custom Data': return imports + `\n<fio-circular-slider\n  [data]="['XS', 'S', 'M', 'L', 'XL']"\n  [(value)]="size"\n  label="Size"\n  [trackDraggable]="true"\n/>`;
      case 'Forms': return imports + "import { FormControl, ReactiveFormsModule } from '@angular/forms';\n\nreadonly volume = new FormControl(55, { nonNullable: true });\n\n<fio-circular-slider\n  [formControl]=\"volume\"\n  [max]=\"100\"\n  label=\"Volume\"\n  appendToValue=\"%\"\n  [trackDraggable]=\"true\"\n/>";
      case 'Templates': return imports + `\n<ng-template #center let-value>\n  <strong>{{ value }}%</strong>\n  <span>Battery</span>\n</ng-template>\n\n<fio-circular-slider\n  [(value)]="charge"\n  [max]="100"\n  [labelTemplate]="center"\n  [trackDraggable]="true"\n  label="Battery"\n/>`;
      default: return imports + `import { signal } from '@angular/core';\n\nreadonly value = signal(42);\n\n<fio-circular-slider\n  [(value)]="value"\n  [min]="${this.min()}"\n  [max]="${this.max()}"\n  [step]="${this.step()}"\n  [direction]="${this.direction()}"\n  [trackDraggable]="${this.trackDraggable()}"\n  [disabled]="${this.disabled()}"\n  [readonly]="${this.readonlyMode()}"\n  label="Value"\n/>`;
    }
  });
}

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }).catch(console.error);
