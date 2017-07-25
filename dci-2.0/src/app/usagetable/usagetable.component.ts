import { Component, OnInit } from '@angular/core';
import { LoaderService, App2Hosts, String2String, CompanyID2Info, Host2PITypes } from '../loader.service';
import * as _ from 'lodash';

export interface AppUsage { appid: string; mins: number };

@Component({
  selector: 'app-usagetable',
  templateUrl: './usagetable.component.html',
  styleUrls: ['./usagetable.component.scss']
})
export class UsagetableComponent implements OnInit {
  
  selectedApps: AppUsage[] = [];
  showAdder = false;
  apps: string[];
  minUsage = 0;
  maxUsage = 50;

  constructor(private loader: LoaderService) { }

  ngOnInit() {
    this.loader.getAppToHosts().then((a2h) => this.apps = _.keys(a2h));
    (<any>window).selectedApps = this.selectedApps;
  }

  appValueChanged(appusage: AppUsage, event) {
    console.log('app value changed', appusage.appid, event);
  }

  addApp(appToAdd: string) {
    if (appToAdd) {
      console.log('got app to add ', appToAdd);      
      this.selectedApps.push({appid: appToAdd, mins: 0}); 
      const has = this.selectedApps.map((x) => x.appid);
      this.apps = _.difference(this.apps, has);
      this.showAdder = false;
    }
  }

}
