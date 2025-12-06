import { Component, computed, input, output, signal } from '@angular/core';
import { SidebarItem } from '../../../models/sidebar.model';
import { RedirectRequest } from '@shared/models/redirect.model';
import { actionsIconSet } from '@general/icons/icons';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar-item',
  imports: [LucideAngularModule],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.scss',
})
export class SidebarItemComponent {
  readonly item = input.required<SidebarItem>();
  readonly children = input<SidebarItem[]>();

  readonly clicked = output<RedirectRequest>();

  readonly expanded = signal<boolean>(false);

  readonly toggleIcon = computed(() => {
    return this.expanded() ? this.expandedIcon : this.collapsedIcon;
  });
  readonly hasChildren = computed(() => {
    const children = this.children();
    return children && children.length > 0;
  });

  collapsedIcon = actionsIconSet.CollapsedArrowIcon;
  expandedIcon = actionsIconSet.ExpandedArrowIcon;

  onClick(): void {
    this.clicked.emit(this.item().redirectRequest);
  }

  protected toggleExpandState(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.expanded.set(!this.expanded());
  }

  protected redirectChild(child: SidebarItem) {
    this.clicked.emit(child.redirectRequest);
  }
}
