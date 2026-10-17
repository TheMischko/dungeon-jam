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
import { CdkDragDrop } from '@angular/cdk/drag-drop';
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
import {
  DisplayOrder,
  DisplayOrderPlacement,
} from '@shared/models/display-order.model';

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
  readonly reorderingEnabled = input<boolean>(false);
  readonly availableSizes = input<GridItemSizeConfig[]>(AllSizeGridItemConfigs);
  readonly initialSizeIndex = input<number>(0);

  readonly sessions = signal<SessionData[]>([]);
  readonly sessionsLoading = this.sessionStore.loading;
  readonly sessionImages = this.sessionStore.sessionImages;
  readonly orderMap = this.sessionStore.latestOrderMap;
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
    effect(() => {
      const orderMap = this.orderMap();
      this.sessions.set(
        [...this.sessionStore.entities()].sort((a, b) =>
          this.sortSessionsByDisplayOrder(orderMap, a, b)
        )
      );
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
    console.log(newIndex);
    this.currentSizeIndex.set(newIndex);
  }

  async navigateToDetail(session: SessionData): Promise<void> {
    await this.router.navigate([
      routesStrings.sessions,
      sessionsRouteStrings.sessionDetail,
      session.id,
    ]);
  }

  protected reorderSession(event: CdkDragDrop<SessionData[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const sessions = this.sessions();
    const item = sessions[event.previousIndex];
    const anchor = sessions[event.currentIndex];
    if (!item || !anchor) {
      return;
    }

    this.sessionStore.changeRelativeOrder({
      entityId: item.id,
      anchorEntityId: anchor.id,
      placement: DisplayOrderPlacement.BEFORE,
    });
  }

  private sortSessionsByDisplayOrder(
    orderMap: Map<string, DisplayOrder>,
    a: SessionData,
    b: SessionData
  ): number {
    return (orderMap.get(a.id)?.order ?? 0) - (orderMap.get(b.id)?.order ?? 0);
  }
}
