import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dbsearch2Component } from './dbsearch2.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import {MatTableModule} from '@angular/material/table';
import { FileViewModule } from '../file-view/file-view.module';
import { Routes, RouterModule } from '@angular/router';
import { CoreModule, InfoDrawerModule } from '@alfresco/adf-core';
import { ContentModule, ContentDirectiveModule, VersionManagerModule, ContentMetadataModule } from '@alfresco/adf-content-services';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
//import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [
  {
      path: '',
      component: Dbsearch2Component
  }
];


@NgModule({
  declarations: [
    Dbsearch2Component
  ],
  exports: [
    Dbsearch2Component

  ],
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatTableModule,
    FileViewModule,
    CoreModule,
    ContentModule,
    InfoDrawerModule,
    ContentDirectiveModule,
    ContentMetadataModule,
    VersionManagerModule,RouterModule.forChild(routes),
    MatFormFieldModule, 
    MatSelectModule, 
    //FormsModule, 
    //ReactiveFormsModule,
    MatInputModule,
    //FormControl,
    MatIconModule
  ]
})
export class Dbsearch2Module { }
