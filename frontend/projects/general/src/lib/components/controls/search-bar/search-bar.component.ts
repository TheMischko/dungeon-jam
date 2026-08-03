import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { InputComponent } from '../input/input.component';
import { actionsIconSet } from '../../../icons/icons';

@Component({
  selector: 'lib-search-bar',
  imports: [InputComponent],
  templateUrl: './search-bar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  readonly value = input<string>();
  readonly search = output<string | null>();
  readonly searchIcon = actionsIconSet.SearchIcon;
}
