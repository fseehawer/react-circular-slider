import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CircularSliderComponent } from '@fiojs/ng-circular-slider';

@Component({
  selector: 'app-root',
  imports: [CircularSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fio-circular-slider [(value)]="value" [max]="100" [step]="0.5" [trackDraggable]="true" />
    <fio-circular-slider [(value)]="plainValue" [max]="100" />
    <fio-circular-slider [data]="['S', 'M', 'L']" [(value)]="size" />
    <fio-circular-slider [(value)]="value" [arcStart]="225" [arcEnd]="135" [progressGradient]="['green', 'red']" />
    <ng-template #center let-value><strong>{{ value }}</strong></ng-template>
    <fio-circular-slider [(value)]="value" [labelTemplate]="center" />
  `,
})
class CompatibilityExample {
  readonly value = signal(40);
  plainValue = 30;
  readonly size = signal('M');
}

bootstrapApplication(CompatibilityExample, { providers: [provideZonelessChangeDetection()] }).catch(console.error);
