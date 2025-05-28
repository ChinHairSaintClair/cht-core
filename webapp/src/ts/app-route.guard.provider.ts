import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { from, Observable} from 'rxjs';

import { AuthService } from '@mm-services/auth.service';
import { SettingsService } from '@mm-services/settings.service';

@Injectable()
export class AppRouteGuardProvider implements CanActivate {
  constructor(
    private router:Router,
    private authService:AuthService,
    private settingsService: SettingsService
  ) {}

  private hasPermissions = async (route: ActivatedRouteSnapshot, isCustomPage: boolean): Promise<boolean> => {
    console.log('Is custom page: ', isCustomPage);

    const permissions: Array<string> = [];
    if (isCustomPage){
      const [settings] = await Promise.all([this.settingsService.get()]);
      const pageId = route.paramMap.get('pageId');
      console.log('settings: ', settings);
      console.log('pageId: ', pageId);
      const customPageSettings = pageId ? settings?.pages?.[pageId] : {};
      console.log('custom page settings: ', customPageSettings);
      const customPermissions = customPageSettings?.permissions;
      console.log('Check: ', customPermissions);
      permissions.push(...customPermissions);
    } else {
      permissions.push(...(route?.data?.permissions ?? []));
    }

    if (permissions.length === 0) {
      return Promise.resolve(true);
    }

    console.log('Permissions: ', permissions);

    return this.authService.has(permissions).then((canActivate) => {
      if (!canActivate) {
        const redirectPath = route.data.redirect || ['error', '403'];
        this.router.navigate(redirectPath);
      }
      return canActivate;
    });
  };

  canActivate(route: ActivatedRouteSnapshot):Observable<boolean> {
    console.log('Route: ', route);
    
    const url = (route?.url ?? []);
    console.log('url: ', url);
    const path = url.length > 0 ? url[0].path : null;
    console.log('path: ', path);
    const isCustomPage = path === 'custom';

    // if (!isCustomPage && (!route.data || !route.data.permissions)) {
    //   return of(true);
    // }

    return from(this.hasPermissions(route, isCustomPage));
    // return from(
    //   this.authService.has(route.data.permissions).then((canActivate) => {
    //     if (!canActivate) {
    //       const redirectPath = route.data.redirect || ['error', '403'];
    //       this.router.navigate(redirectPath);
    //     }
    //     return canActivate;
    //   })
    // );
  }
}
