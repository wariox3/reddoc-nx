import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-plan-stepper',
  standalone: true,
  templateUrl: './plan-stepper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanStepperComponent {
  readonly current = input.required<number>();
  readonly labels = input.required<readonly string[]>();
}
