import { Component, output } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { formIconSet } from '../../../icons/icons';

@Component({
  selector: 'lib-search-bar',
  imports: [InputComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  readonly search = output<string>();
  readonly searchIcon = formIconSet.SearchIcon;
}
