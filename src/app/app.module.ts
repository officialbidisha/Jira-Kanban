import { HttpClientModule } from '@angular/common/http';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { LeftNavComponent } from './layout/left-nav/left-nav.component';
import { HeaderComponent } from './layout/header/header.component';
import { BoardComponent } from './pages/board/board.component';

import {CardModule} from 'primeng/card';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {MenuItem, MessageService} from 'primeng/api';
import { AvatarsWidgetComponent } from './layout/avatars-widget/avatars-widget.component';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {InputTextareaModule} from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {ToastModule} from 'primeng/toast';
import {InputTextModule} from 'primeng/inputtext';
import {SkeletonModule} from 'primeng/skeleton';
@NgModule({
  declarations: [
    AppComponent,
    LeftNavComponent,
    HeaderComponent,
    BoardComponent,
    AvatarsWidgetComponent,

  ],
  imports: [
    CardModule,
    DragDropModule,
    BreadcrumbModule,
    OverlayPanelModule,
    DialogModule,
    BrowserModule,
    ButtonModule,
    DropdownModule,
    InputTextareaModule,
    HttpClientModule,
    ToastModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    SkeletonModule
  ],
  providers: [MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
