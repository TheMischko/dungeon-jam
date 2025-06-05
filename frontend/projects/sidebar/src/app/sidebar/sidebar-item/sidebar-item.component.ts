import {Component, input, output} from '@angular/core';
import {SidebarItem} from '../../../models/sidebar.model';
import {MatButton} from '@angular/material/button';
import {RedirectPath} from '@shared/models/redirect.model';

@Component({
  selector: 'app-sidebar-item',
  imports: [
    MatButton
  ],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.scss'
})
export class SidebarItemComponent {
  readonly item = input.required<SidebarItem>();

  clicked = output<RedirectPath>();

  onClick(): void{
    this.clicked.emit(this.item().redirectPath);
  }
}
