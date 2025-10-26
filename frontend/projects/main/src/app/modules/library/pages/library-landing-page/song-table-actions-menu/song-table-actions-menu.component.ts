import { Component, output } from '@angular/core';
import { MatMenuItem } from '@angular/material/menu';
import { LucideAngularModule } from 'lucide-angular';
import { actionsIconSet, iconSet } from '@general/icons/icons';

@Component({
  selector: 'app-song-table-actions-menu',
  imports: [MatMenuItem, LucideAngularModule],
  templateUrl: './song-table-actions-menu.component.html',
  styleUrl: './song-table-actions-menu.component.scss',
})
export class SongTableActionsMenuComponent {
  readonly deleteIcon = actionsIconSet.DeleteIcon;
  readonly addToPlaylistIcon = actionsIconSet.AddIcon;
  readonly playNextIcon = iconSet.PlayNextIcon;

  readonly playNext = output();
  readonly addToPlaylist = output();
  readonly delete = output();

  onAddToPlaylist(event: MouseEvent) {
    event.stopPropagation();
    this.addToPlaylist.emit();
  }
}
