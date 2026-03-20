import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '@general/components/controls/input/input.component';
import { Field } from '@angular/forms/signals';
import { createDiscordTokenForm } from './discord-token-form.model';

@Component({
  selector: 'app-discord-token-form',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule,
    Field,
  ],
  templateUrl: './discord-token-form.component.html',
  styleUrl: './discord-token-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DiscordTokenFormComponent {
  readonly form = input(createDiscordTokenForm());
}

