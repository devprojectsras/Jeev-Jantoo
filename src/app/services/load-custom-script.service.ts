import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadCustomScriptService {

  constructor() { }

  public loadDashboardScripts() {
    const script = document.createElement('script');
    script.src = 'custom_assets/assets/js/dashboards-analytics.js';
    document.body.appendChild(script);
  }
}
