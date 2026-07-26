import { TemplateRef } from '@angular/core';

export interface CollapsibleSectionConfig<T> {value: T, template: TemplateRef<{ $implicit: T }>, title: string}
