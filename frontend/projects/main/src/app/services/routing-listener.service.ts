import {effect, inject, Injectable} from '@angular/core';
import {RedirectService} from '../../../../general/src/lib/redirect.service';
import {Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {RedirectPath} from '@shared/models/redirect.model';
import {playlistRouteStrings} from '../modules/playlist/playlist-route-strings';
import {routesStrings} from '../routes-strings';
import {libraryRouteStrings} from '../modules/library/library-route-strings';
import {homeRouteStrings} from '../modules/home/home-route-strings';

@Injectable({
  providedIn: 'root'
})
export class RoutingListenerService {
  private readonly redirectService = inject(RedirectService);
  private readonly router = inject(Router);

  private readonly redirect = toSignal(this.redirectService.redirect$);
  private isInitialized = false;

  constructor() { }

  initialize(): void{
    if(this.isInitialized){
      return;
    }

    effect(async () => {

      const redirect = this.redirect();
      if(!redirect){
        return;
      }

      switch (redirect){
        case RedirectPath.HOME:
          await this.router.navigate([routesStrings.home, homeRouteStrings.home]);
          break;
        case RedirectPath.PLAYLISTS:
          await this.router.navigate([routesStrings.playlists, playlistRouteStrings.playlists])
          break;
        case RedirectPath.LIBRARY:
          await this.router.navigate([routesStrings.library, libraryRouteStrings.library])
          break;
        default:
          console.error(`Unknow redirect to: ${redirect}`)
          break;
      }
    });

    this.isInitialized = true;
  }
}
