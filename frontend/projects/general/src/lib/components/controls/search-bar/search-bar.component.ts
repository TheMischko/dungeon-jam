import { Component, output } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { actionsIconSet } from '../../../icons/icons';

@Component({
  selector: 'lib-search-bar',
  imports: [InputComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  readonly search = output<string>();
  readonly searchIcon = actionsIconSet.SearchIcon;
}
