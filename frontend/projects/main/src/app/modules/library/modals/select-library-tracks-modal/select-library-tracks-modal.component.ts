import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-library-tracks-modal',
  imports: [FormsModule],
  templateUrl: './select-library-tracks-modal.component.html',
  styleUrl: './select-library-tracks-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectLibraryTracksModalComponent {}
