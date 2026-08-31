import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DisplayOrderApiWindow } from '../../../models/api/display-order-api.model';
import {
  DisplayOrder,
  DisplayOrderMapQuery,
} from '@shared/models/display-order.model';

@Injectable({
  providedIn: 'root',
})
export class DisplayOrderApiService {
  private readonly window: DisplayOrderApiWindow =
    window as DisplayOrderApiWindow;

  public getOrderMap(
    query: DisplayOrderMapQuery
  ): Observable<Map<string, DisplayOrder>> {
    const response = new Subject<Map<string, DisplayOrder>>();

    this.window.DISPLAY_ORDER_API.getOrderMap(query)
      .then((orderMap) => {
        response.next(orderMap);
        response.complete();
      })
      .catch((err) => {
        response.error(err);
        response.complete();
      });

    return response.asObservable();
  }
}
