import { Provider } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

const providers: Provider[] = [
  provideNativeDateAdapter(),
  provideTranslateService(),
  {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        paramMap: convertToParamMap({}),
        queryParamMap: convertToParamMap({}),
      },
      paramMap: of(convertToParamMap({})),
      params: of({}),
      queryParamMap: of(convertToParamMap({})),
      queryParams: of({}),
      data: of({}),
    },
  },
];

export default providers;
