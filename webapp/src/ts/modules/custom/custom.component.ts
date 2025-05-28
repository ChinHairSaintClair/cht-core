import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DomSanitizer } from '@angular/platform-browser';

import { NgIf } from '@angular/common';

import { ToolBarComponent } from '@mm-components/tool-bar/tool-bar.component';
import { SettingsService } from '@mm-services/settings.service';

@Component({
  templateUrl: './custom.component.html',
  imports: [
    NgIf,
    ToolBarComponent
  ]
})
export class CustomComponent implements OnInit {
  config: Template | undefined;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly settingsService: SettingsService,
  ) {}

  async ngOnInit() {
    const [settings] = await Promise.all([this.settingsService.get()]);
    console.log('Settings: ', settings);

    this.route.paramMap.subscribe(params => {
      const pageId = params.get('pageId');
      console.log('Page id: ', pageId);

      const customPageSettings: CustomPageSettings = pageId ? settings?.pages?.[pageId] : {};
      console.log('custom page settings: ', customPageSettings);
      this.config = customPageSettings.template;
    });
  }

  isSupportedTemplate(){
    return this.config?.key && Object.values(SUPPORTED_TEMPLATES).includes(this.config?.key as any);
  }

  isIFrameTemplate = () => this.config?.key === SUPPORTED_TEMPLATES.IFRAME;

  getIFrameTemplateURL () {
    console.log('iframe template url: ', (this.config as iFrameTemplate)?.url);
    return this.isIFrameTemplate() && 
      this.sanitizer.bypassSecurityTrustResourceUrl((this.config as iFrameTemplate)?.url);
  }
}

const SUPPORTED_TEMPLATES = {
  IFRAME: 'iframe',
  GRID: 'grid'
} as const;

type WithKey<K extends string, T> = T & { key: K };

type iFrameTemplate = WithKey<typeof SUPPORTED_TEMPLATES.IFRAME, {
  url: string;
}>;

type GridTemplate = WithKey<typeof SUPPORTED_TEMPLATES.GRID, {
  items: Array<{ url: string, thumbnailResource?: string }>
}>;

// A more intricate template could be defined
// It would need a set of services or libs that can be accessed
// Without foreclosing too much :/.
// Perhaps allow the user to define a set of methods, maybe onInit, onDestroy, to which we pass data/methods.

type Template = iFrameTemplate | GridTemplate;

type CustomPageSettings = {
  permissions: Array<string>;
  template: Template;
};
