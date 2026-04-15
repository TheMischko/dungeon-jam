import { FilterConstrain, FilterMatchType } from '@shared/models/request.model';

export class FilterQuery {
  protected _matchType: FilterMatchType = FilterMatchType.ANY;
  protected _filters: FilterConstrain[] = [];

  constructor(matchType?: FilterMatchType, filters?: FilterConstrain[]) {
    if(matchType) {
      this._matchType = matchType;
    }
    if(filters) {
      this._filters = filters;
    }
  }

  get matchType() {
    return this._matchType;
  }

  get filters() {
    return this._filters;
  }

  updateMatchType(matchType: FilterMatchType): FilterQuery {
    return new FilterQuery(matchType, this._filters);
  }

  updateFilter(property: string, values: string[]): FilterQuery {
    const oldFilters = this._filters.filter(f => f.property !== property);
    const newFilters = [
      ...oldFilters,
      {
        property,
        values
      }
    ];
    return new FilterQuery(this._matchType, newFilters);
  }
}