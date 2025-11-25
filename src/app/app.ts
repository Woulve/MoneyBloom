import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MainComponent } from './components/main.component';

@Component({
  selector: 'app-root',
  imports: [MainComponent],
  template: `<app-main />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
