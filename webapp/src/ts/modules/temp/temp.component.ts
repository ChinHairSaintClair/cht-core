import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// import { HeaderTabsService } from '@mm-services/header-tabs.service';
import { ToolBarComponent } from '@mm-components/tool-bar/tool-bar.component';

@Component({
  templateUrl: './temp.component.html',
  imports: [
    ToolBarComponent
  ]
})
export class TempComponent implements OnInit {

  constructor(
    // private headerTabsService:HeaderTabsService,
    private router:Router,
  ) { }

  ngOnInit() {
    // return this.headerTabsService
    //   .getPrimaryTab() // Not passing settings since icons aren't needed.
    //   .then(tab => {
    //     const nextRoute = tab?.route ? [ tab.route ] : [ 'error', '403' ];
    //     this.router.navigate(nextRoute);
    //   });
  }
}
