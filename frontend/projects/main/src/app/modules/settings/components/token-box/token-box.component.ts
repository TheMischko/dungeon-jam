import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import {
  DiscordStateType,
  DiscordTokenData,
} from '@shared/models/discord.model';
import { IconButtonComponent } from '@general/components/buttons/icon-button/icon-button.component';
import { actionsIconSet } from '@general/icons/icons';
import { DatePipe, SlicePipe } from '@angular/common';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-token-box',
  imports: [IconButtonComponent, SlicePipe, DatePipe, MatSlideToggle],
  templateUrl: './token-box.component.html',
  styleUrl: './token-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenBoxComponent {
  readonly token = input.required<DiscordTokenData>();
  readonly tokenState = input<DiscordStateType>(DiscordStateType.NONE);

  readonly editToken = output<DiscordTokenData>();
  readonly deleteToken = output<string>();
  readonly toggleConnection = output<DiscordTokenData>();

  readonly switchValue = computed(
    () => this.tokenState() === DiscordStateType.CONNECTED
  );
  constructor() {
    effect(() => {
      const tokenState = this.tokenState();
      const switchValue = this.switchValue();

      console.log(
        `${this.token().name} State: ${tokenState}, Switch Value: ${switchValue}`
      );
    });
  }
  readonly statusText = computed(() => {
    switch (this.tokenState()) {
      case DiscordStateType.CONNECTED:
        return 'Connected';
      case DiscordStateType.CONNECTING:
        return 'Connecting...';
      case DiscordStateType.ERROR:
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  });
  readonly statusCssClass = computed(() => {
    switch (this.tokenState()) {
      case DiscordStateType.CONNECTED:
        return 'status-success';
      case DiscordStateType.CONNECTING:
        return 'status-warning';
      case DiscordStateType.ERROR:
        return 'status-error';
      default:
        return 'status-neutral';
    }
  });

  readonly icons = {
    Edit: actionsIconSet.EditIcon,
    Delete: actionsIconSet.DeleteIcon,
  };

  readonly iconColors = {
    edit: 'neutral',
    delete: 'neutral',
  };

  onEdit(): void {
    this.editToken.emit(this.token());
  }

  onDelete(): void {
    this.deleteToken.emit(this.token().id);
  }
}
