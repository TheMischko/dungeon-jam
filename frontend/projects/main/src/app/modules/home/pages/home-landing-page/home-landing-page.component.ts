import { Component } from '@angular/core';
import { createTrackForm } from '../../../../forms/track-form/track-form.model';
import { MatButton } from '@angular/material/button';
import { TrackFormComponent } from '../../../../forms/track-form/track-form.component';

@Component({
  selector: 'app-home-landing-page',
  imports: [MatButton, TrackFormComponent],
  templateUrl: './home-landing-page.component.html',
  styleUrl: './home-landing-page.component.scss',
})
export class HomeLandingPageComponent {
  readonly form = createTrackForm();

  onClick(_: MouseEvent) {
    console.log(
      this.form().value(),
      this.form().errorSummary(),
      this.form().valid(),
    );
  }
}
