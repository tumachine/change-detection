import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlComponent } from './control/control.component';
import { TreeModule } from './tree/tree.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [ AppComponent, ControlComponent ],
  imports: [ BrowserModule, BrowserAnimationsModule, AppRoutingModule, TreeModule ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
