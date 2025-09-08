// src/app/shared/map/map.component.ts
import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-map',
  template: `<div #mapContainer style="width:100%; height:300px;"></div>`,
  standalone: true
})
export class MapComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() lat = 0;
  @Input() lng = 0;
  @Input() zoom = 15;

  ngAfterViewInit() {
    if (this.lat && this.lng) {
      const coords = new google.maps.LatLng(this.lat, this.lng);//Cannot find name 'google'
      const map = new google.maps.Map(this.mapContainer.nativeElement, {
        center: coords,
        zoom: this.zoom
      });
      new google.maps.Marker({ position: coords, map });
    }
  }
}
