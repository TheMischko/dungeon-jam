import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { NgTemplateOutlet } from '@angular/common';
import { actionsIconSet } from '@general/icons/icons';
import { LucideDynamicIcon } from '@lucide/angular';
import { CollapsibleSectionConfig } from '../../../../../models/collapsible-section-component.model';

@Component({
  selector: 'lib-collapsible-section',
  imports: [
    NgTemplateOutlet,
    CdkAccordionModule,
    LucideDynamicIcon,
  ],
  templateUrl: './collapsible-section.component.html',
  styleUrl: './collapsible-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSectionComponent<T> {
  readonly data = input.required<CollapsibleSectionConfig<T>[]>();
  readonly trackBy = input<(index: number, item: T) => string>((index, _) => index.toString());

  readonly expandedMap = signal<Record<string, boolean>>({});

  readonly collapsedIcon = actionsIconSet.CollapsedArrowIcon;
  readonly expandedIcon = actionsIconSet.ExpandedArrowIcon;

  constructor() {
    effect(() => {
      const data: CollapsibleSectionConfig<T>[] = this.data();
      if (!data || data.length === 0) {
        return;
      }
      const items = data
        .map(item => item.value)
        .reduce((map, item, index, __) => {
          return {
            ...map,
            [this.trackBy()(index, item)]: index === 0,
          }
        }, {} as Record<string, boolean>);

      this.expandedMap.update((current) => ({
        ...items,
        ...current
      }))
    });
  }

  isExpanded(item: T, index: number) {
    const key = this.trackBy()(index, item);
    return this.expandedMap()[key];
  }

  toggleExpanded(item: T, index: number) {
    const key = this.trackBy()(index, item);
    this.expandedMap.update((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  protected getExpandedIcon(expanded: boolean) {
    return expanded ? this.expandedIcon : this.collapsedIcon;
  }
}
