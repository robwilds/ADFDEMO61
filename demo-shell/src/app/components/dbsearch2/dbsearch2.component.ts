import { Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {ContentService,AllowableOperationsEnum,PermissionsEnum,NodesApiService,FileUploadErrorEvent} from '@alfresco/adf-content-services';
import { PreviewService } from '../../services/preview.service';
import {NotificationService} from '@alfresco/adf-core';
//import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'dbsearch2',
  templateUrl: './dbsearch2.component.html',
  styleUrls: ['./dbsearch2.component.css']
})

export class Dbsearch2Component implements OnInit {

  //VARIABLES
  align = "end"
  nodeId: string = null;
    versionId: string = null;
    displayEmptyMetadata = false;
    expanded: boolean;
    multi = false;
    isReadOnly = false;
    isPreset = false;
    customPreset: string = null;
    displayDefaultProperties = true;
    showToolbar = true;
    urlFile = null;
    allowGoBack = true;
    openWith = false;
    allowDownload = false;
    allowPrint = true;
    allowRightSidebar = true;
    allowLeftSidebar = true;
    moreActions = true;
    moreActionsMenu = false;
    fileUrlSwitch = false;
    showLeftSidebar = null;
    showRightSidebar = false;
    customToolbar = false;
    isCommentEnabled = false;
    showTabWithIcon = false;
    showTabWithIconAndLabel = false;
    desiredAspect: string = null;
    showAspect: string = null;
    name: string;
    fileName: string;
    blobFile: Blob;
    showViewer = false;

  constructor(
    private http: HttpClient,
    private router:Router,
        private route:ActivatedRoute,
        private nodeApiService: NodesApiService,
        private contentServices: ContentService,
        private preview: PreviewService,
        private notificationService: NotificationService,
    )
    {
      console.log("router",this.router)
      console.log("route",this.route); 
    }


  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      const id = params.nodeId;
      this.versionId = params.versionId;
      if (id) {
          this.nodeApiService.getNode(id).subscribe(
              (node) => {
                  if (node && node.isFile) {
                      this.isCommentEnabled = this.contentServices.hasPermissions(node, PermissionsEnum.NOT_CONSUMER) ||
                          this.contentServices.hasAllowableOperations(node, AllowableOperationsEnum.UPDATE);
                      this.nodeId = id;
                      return;
                  }
                  this.router.navigate(['/files', id]);
              },
              () => this.router.navigate(['/files', id])
          );
      } else if (this.preview?.content) {
          this.blobFile = this.preview.content;
          this.fileName = this.preview.name;
      }
  });
  }

  //variables
  baseurl = 'https://cat-fact.herokuapp.com/facts/';
jsonData: any;
parsedJson: [];

/* @Input()
nodeId = "f2e3cc0d-2d36-4bad-8927-b08cc92819e0" */


displayedColumns: string[] = ['ID', 'text'];
//dataSource = this.parsedJson;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  items = ['Football', 'Tennis', 'Basketball', 'Rugby', 'Golf'];

  drop(event: CdkDragDrop<string[]>) {
  
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
  
  getImage(ID) {
    this.showViewer = false;
  console.log("row id is: ",ID);
  this.showViewer = true;
  this.nodeId = "f2e3cc0d-2d36-4bad-8927-b08cc92819e0";
  //beab72f6-a17e-4090-bd02-987f970f93a7
  }

  homeButtonClicked(){
    this.router.navigate(['/home']);
  }

  apiClicked(){

    //get data from rest api end point and display
    this.http.get(this.baseurl).subscribe((data) => {
      this.jsonData = JSON.stringify(data);
      this.parsedJson = JSON.parse(this.jsonData);
      console.log("newDat",this.parsedJson);
    
    });

  }

  onUploadError(event: FileUploadErrorEvent) {
    const errorMessage = event.error;
    this.notificationService.showError(errorMessage);
}
}
