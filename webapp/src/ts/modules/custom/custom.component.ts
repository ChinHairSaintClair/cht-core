import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToolBarComponent } from '@mm-components/tool-bar/tool-bar.component';
import { SettingsService } from '@mm-services/settings.service';

@Component({
  templateUrl: './custom.component.html',
  imports: [
    ToolBarComponent
  ]
})
export class CustomComponent implements OnInit {
  private readonly pageId;
  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
  ) { 
    this.pageId = this.route.snapshot.paramMap.get('pageId');
  }
  
  // We need to define some set of services or libs that the custom pages can have access to,
  // without foreclosing too much :/.
  // We can then allow the user to define a set of methods, maybe onInit, onDestroy, to which we pass data/methods.

  async ngOnInit() {
    const [settings] = await Promise.all([this.settingsService.get()]);
    console.log('Settings: ', settings);
    console.log('Page id: ', this.pageId);
    const customPageSettings = this.pageId ? settings?.pages?.[this.pageId] : {};
    console.log('custom page settings: ', customPageSettings);
    // TODO: load the actual UI here?
  }
}
