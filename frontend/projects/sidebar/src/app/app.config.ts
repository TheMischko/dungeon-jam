import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import discordIconSvgson from '@general/icons/discord.json';

// Transform the svgson data into the format expected by Lucide
const discordIconData = discordIconSvgson.children.map((node: any) => [node.name, node.attributes]) as any;

const icons = {
  Discord: discordIconData,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider(icons),
    },
  ],
};
console.log(icons);
