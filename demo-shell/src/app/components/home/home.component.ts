/*!
 * @license
 * Copyright © 2005-2023 Hyland Software, Inc. and its affiliates. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { PreviewService } from '../../services/preview.service';
import { Component,ViewChild,Input } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentNodeDialogService, UploadService, DiscoveryApiService,RowFilter } from '@alfresco/adf-content-services';
import { AlfrescoApiService, AppConfigService } from '@alfresco/adf-core';
import { SitePaging, SiteEntry, MinimalNodeEntryEntity, Node } from '@alfresco/js-api';
import { AppDefinitionRepresentationModel,TaskAttachmentListComponent,TaskUploadService } from '@alfresco/adf-process-services';

export function taskUploadServiceFactory(api: AlfrescoApiService, config: AppConfigService, discoveryApiService: DiscoveryApiService) {
        return new TaskUploadService(api, config, discoveryApiService);
    }

@Component({
    selector: 'app-home-view',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [
        {
            provide: UploadService,
            useFactory: (taskUploadServiceFactory),
            deps: [AlfrescoApiService, AppConfigService, DiscoveryApiService]
        }
    ]
})

export class HomeComponent  {
    @ViewChild(MatAccordion) accordion: MatAccordion;
    panelOpenState = false;

    @ViewChild('taskAttachList')
    taskAttachList: TaskAttachmentListComponent;

    @Input()
    showViewer: boolean = false;

    nodeId: string;
    zindex = "-1";
   
    @Input()
    taskId: string;
    appId: number;
    defaultAppId: number;

    prefix = "files/"
    dropdownHideMyFiles = false;
    showFiles = false;
    showFolders = false;
    enableImageResolver = false;
    validSelection = false;

    customSideGuid = '';
    customSideTitle = '';
    actualPageSize = 2;
    
    rowFilterFunction: RowFilter = null;
    excludeSiteContentList: string[] = ContentNodeDialogService.nonDocumentSiteContent;
    customImageResolver: any = null;


    constructor(
        private router:Router,
        private route:ActivatedRoute,
        private preview: PreviewService
    ){
        console.log("router",this.router)
        console.log("route",this.route);
    }

    showPreview(event) {
        if (event.value.entry.isFile) {
            this.zindex = "10000";
            this.nodeId = event.value.entry.id;
            this.showViewer = true;
        }
    }

    showFile(event) {
        const entry = event.value.entry;
        if (entry && entry.isFile) {
            this.preview.showResource(entry.id);
        }
    }

    onClickAddSite() {
        const newSiteEntry: SiteEntry = new SiteEntry({ entry: { title: this.customSideTitle, guid: this.customSideGuid } });
        this.customSites.list.entries.push(newSiteEntry);
        this.customSideGuid = '';
        this.customSideTitle = '';
    }

    onClickResetSite() {
        this.customSites.list.entries = this.defaultSites;
        this.customSideGuid = '';
        this.customSideTitle = '';
    }

    onNodeClicked(event: any)
    {
        console.log("event",event)
    }

    onFileUploadComplete(content: any) {
        this.taskAttachList.add(content);
    }

    defaultSites: SiteEntry[] = [
        new SiteEntry({ entry: { title: 'MINE', guid: '-my-' } }),
        new SiteEntry({ entry: { title: 'ROOTY', guid: '-root-' } })];

    customSites: SitePaging = new SitePaging({
        list: {
            entries: [
                { entry: { title: 'MINE', guid: '-my-' } },
                { entry: { title: 'ROOTY', guid: '-root-' } }],
            pagination: {}
        }
    });

    onNodeSelect(selection: Node[]) {
        console.log("nodeid",selection[0].id);
        //this.router.navigate([this.prefix, selection[0].id]);
    }

    customIsValidFunction(entry: MinimalNodeEntryEntity): boolean {
        return entry.name.startsWith('a') || entry.name.startsWith('A');
    }

    customBreadcrumbFunction(node: MinimalNodeEntryEntity) {
        if (node && node.path && node.path.elements) {
            node.path.elements = node.path.elements.filter((element) => !element.name.toLocaleLowerCase().startsWith('d') ? element : null );
        }
        return node;
    }

    onAppClicked(app: AppDefinitionRepresentationModel) {
        console.log("app id",app.id);

        if(app.id == null){
            this.router.navigate(['/task-list']);
        } else{
            this.router.navigate(['/activiti/apps', app.id,'processes']);
        }
}
    routeToFolder(folderName){
        console.log("folderName",folderName);
        this.navigate(folderName);
    }

    navigate(folderName){
        if (folderName == 'search')
        {this.router.navigateByUrl("search-filter-chips");}
        else if (folderName = 'dbsearch')
            {this.router.navigateByUrl("dbsearch2");
        }
        else
        {this.router.navigateByUrl(this.prefix + this.getNodeIDByFolderName(folderName));}
    }
    taskRowClick(){
        console.log("task clickced");
        this.router.navigateByUrl('activiti/apps/0/tasks');

    }
    getNodeIDByFolderName(folderName){
        switch(folderName){
            //the names and folder nodeIDs below can be changed at will!
            case 'drawings': return '9ceffb48-0cc0-4341-8720-e16d21166005/';
            case 'eq': return '0a9f912f-fba4-480d-9ee2-c4f2e894ccf8';
            case 'airbrakes': return '7d5cb795-9ba5-40cb-97f9-6e93b3e80406';
            case 'dbsearch': return 'dbsearch2';
            default:return '295621ee-6a31-4251-86ac-fb5df2920501';
        }
    }
}
