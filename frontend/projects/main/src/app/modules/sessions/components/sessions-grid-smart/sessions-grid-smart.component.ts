import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { SessionStore } from '@general/stores/session.store';
import { QueryOptions } from '@shared/models/request.model';
import { SessionsGridComponent } from '../sessions-grid/sessions-grid.component';
import { SessionData } from '@shared/models/session.model';
import { Router } from '@angular/router';
import { routesStrings } from '../../../../routes-strings';
import { sessionsRouteStrings } from '../../sessions-route-strings';
import {
  AllSizeGridItemConfigs,
  GridItemSizeConfig,
} from '../../../../models/grid.model';

@Component({
  selector: 'app-sessions-grid-smart',
  imports: [SessionsGridComponent],
  templateUrl: './sessions-grid-smart.component.html',
  styleUrl: './sessions-grid-smart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsGridSmartComponent implements OnInit {
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly showControls = input<boolean>(true);
  readonly availableSizes = input<GridItemSizeConfig[]>(
    AllSizeGridItemConfigs
  );
  readonly initialSizeIndex = input<number>(0);

  readonly sessions = this.sessionStore.entities;
  readonly sessionsLoading = this.sessionStore.loading;
  readonly searchFilter = signal<string>('');
  readonly currentSizeIndex = signal<number>(0);
  readonly currentQuery = computed<QueryOptions>(() => {
    return {
      search: this.searchFilter(),
    };
  });
  readonly sizeConfig = computed<GridItemSizeConfig>(() => {
    const sizes = this.availableSizes();
    const index = this.currentSizeIndex();
    return sizes[index] ?? sizes[0];
  });

  constructor() {
    effect(() => {
      this.currentSizeIndex.set(this.initialSizeIndex());
    });
  }

  ngOnInit() {
    this.sessionStore.load(this.currentQuery);
  }

  handleSizeChange(newIndex: number) {
    const maxIndex = this.availableSizes().length - 1;
    if (newIndex < 0 || newIndex > maxIndex) {
      return;
    }
    this.currentSizeIndex.set(newIndex);
  }

  async navigateToDetail(session: SessionData): Promise<void> {
    await this.router.navigate([
      routesStrings.sessions,
      sessionsRouteStrings.sessionDetail,
      session.id,
    ]);
  }
}
