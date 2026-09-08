import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { disabled, form, FormField, max, min, readonly } from '@angular/forms/signals';
import { CircularSliderComponent } from '@fiojs/ng-circular-slider';

@Component({
  selector: 'app-root',
  imports: [CircularSliderComponent, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <fio-circular-slider [formField]="settings.volume" label="Volume" appendToValue="%" [trackDraggable]="true" />
      <output data-testid="value">{{ model().volume }}</output>
      <output data-testid="dirty">{{ settings.volume().dirty() }}</output>
      <output data-testid="touched">{{ settings.volume().touched() }}</output>
      <button (click)="reset()">Reset</button>
      <button (click)="disabledMode.set(!disabledMode())">Toggle disabled</button>
      <button (click)="readonlyMode.set(!readonlyMode())">Toggle readonly</button>
    </main>
  `,
})
class SignalFormsExample {
  readonly model = signal({ volume: 40 });
  readonly disabledMode = signal(false);
  readonly readonlyMode = signal(false);
  readonly settings = form(this.model, path => {
    min(path.volume, 0);
    max(path.volume, 100);
    disabled(path.volume, () => this.disabledMode());
    readonly(path.volume, () => this.readonlyMode());
  });
  reset(): void { this.model.set({ volume: 40 }); this.settings().reset(); }
}

bootstrapApplication(SignalFormsExample).catch(console.error);
