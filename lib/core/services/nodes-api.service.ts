/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
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

import { Injectable } from '@angular/core';
import { MinimalNode, NodeEntry, NodePaging } from '@alfresco/js-api';
import { from, Observable, throwError } from 'rxjs';
import { AlfrescoApiService } from './alfresco-api.service';
import { UserPreferencesService } from './user-preferences.service';
import { catchError, map } from 'rxjs/operators';
import { NodeMetadata } from '../models/node-metadata.model';

@Injectable({
    providedIn: 'root'
})
export class NodesApiService {

    constructor(private api: AlfrescoApiService,
                private preferences: UserPreferencesService) {}

    private get nodesApi() {
        return this.api.getInstance().core.nodesApi;
    }

    private getEntryFromEntity(entity: NodeEntry) {
        return entity.entry;
    }

    /**
     * Gets the stored information about a node.
     * @param nodeId ID of the target node
     * @param options Optional parameters supported by JS-API
     * @returns Node information
     */
    getNode(nodeId: string, options: any = {}): Observable<MinimalNode> {
        const defaults = {
            include: [ 'path', 'properties', 'allowableOperations', 'permissions' ]
        };
        const queryOptions = Object.assign(defaults, options);

        return from(this.nodesApi.getNode(nodeId, queryOptions)).pipe(
            map(this.getEntryFromEntity),
            catchError((err) => throwError(err))
        );
    }

    /**
     * Gets the items contained in a folder node.
     * @param nodeId ID of the target node
     * @param options Optional parameters supported by JS-API
     * @returns List of child items from the folder
     */
    getNodeChildren(nodeId: string, options: any = {}): Observable<NodePaging> {
        const defaults = {
            maxItems: this.preferences.paginationSize,
            skipCount: 0,
            include: [ 'path', 'properties', 'allowableOperations', 'permissions' ]
        };
        const queryOptions = Object.assign(defaults, options);

        return from(this.nodesApi.getNodeChildren(nodeId, queryOptions)).pipe(
            catchError((err) => throwError(err))
        );
    }

    /**
     * Creates a new document node inside a folder.
     * @param parentNodeId ID of the parent folder node
     * @param nodeBody Data for the new node
     * @param options Optional parameters supported by JS-API
     * @returns Details of the new node
     */
    createNode(parentNodeId: string, nodeBody: any, options: any = {}): Observable<MinimalNode> {
        return from(this.nodesApi.addNode(parentNodeId, nodeBody, options)).pipe(
            map(this.getEntryFromEntity),
            catchError((err) => throwError(err))
        );
    }

    /**
     * Creates a new folder node inside a parent folder.
     * @param parentNodeId ID of the parent folder node
     * @param nodeBody Data for the new folder
     * @param options Optional parameters supported by JS-API
     * @returns Details of the new folder
     */
    createFolder(parentNodeId: string, nodeBody: any, options: any = {}): Observable<MinimalNode> {
        const body = Object.assign({ nodeType: 'cm:folder' }, nodeBody);
        return this.createNode(parentNodeId, body, options);
    }

    /**
     * Updates the information about a node.
     * @param nodeId ID of the target node
     * @param nodeBody New data for the node
     * @param options Optional parameters supported by JS-API
     * @returns Updated node information
     */
    updateNode(nodeId: string, nodeBody: any, options: any = {}): Observable<MinimalNode> {
        const defaults = {
            include: [ 'path', 'properties', 'allowableOperations', 'permissions', 'definition' ]
        };
        const queryOptions = Object.assign(defaults, options);

        return from(this.nodesApi.updateNode(nodeId, nodeBody, queryOptions)).pipe(
             map(this.getEntryFromEntity),
            catchError((err) => throwError(err))
        );
    }

    /**
     * Moves a node to the trashcan.
     * @param nodeId ID of the target node
     * @param options Optional parameters supported by JS-API
     * @returns Empty result that notifies when the deletion is complete
     */
    deleteNode(nodeId: string, options: any = {}): Observable<any> {
        return from(this.nodesApi.deleteNode(nodeId, options)).pipe(
            catchError((err) => throwError(err))
        );
    }

    /**
     * Restores a node previously moved to the trashcan.
     * @param nodeId ID of the node to restore
     * @returns Details of the restored node
     */
    restoreNode(nodeId: string): Observable<MinimalNode> {
        return from(this.nodesApi.restoreNode(nodeId)).pipe(
            map(this.getEntryFromEntity),
            catchError((err) => throwError(err))
        );
    }

    /**
     * Get the metadata and the nodeType for a nodeId cleaned by the prefix.
     * @param nodeId ID of the target node
     * @returns Node metadata
     */
    public getNodeMetadata(nodeId: string): Observable<NodeMetadata> {
        return from(this.nodesApi.getNode(nodeId))
            .pipe(map(this.cleanMetadataFromSemicolon));
    }

    /**
     * Create a new Node from form metadata.
     * @param path Path to the node
     * @param nodeType Node type
     * @param name Node name
     * @param nameSpace Namespace for properties
     * @param data Property data to store in the node under namespace
     * @returns The created node
     */
    public createNodeMetadata(nodeType: string, nameSpace: any, data: any, path: string, name?: string): Observable<NodeEntry> {
        const properties = {};
        for (const key in data) {
            if (data[key]) {
                properties[nameSpace + ':' + key] = data[key];
            }
        }

        return this.createNodeInsideRoot(name || this.generateUuid(), nodeType, properties, path);
    }

    /**
     * Create a new Node inside `-root-` folder
     * @param name Node name
     * @param nodeType Node type
     * @param properties Node body properties
     * @param path Path to the node
     * @returns The created node
     */
    public createNodeInsideRoot(name: string, nodeType: string, properties: any, path: string): Observable<NodeEntry> {
        const body = {
            name: name,
            nodeType: nodeType,
            properties: properties,
            relativePath: path
        };
        return from(this.nodesApi.addNode('-root-', body, {}));
    }

    private generateUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private cleanMetadataFromSemicolon(nodeEntry: NodeEntry): NodeMetadata {
        const metadata = {};

        if (nodeEntry && nodeEntry.entry.properties) {
            for (const key in nodeEntry.entry.properties) {
                if (key) {
                    if (key.indexOf(':') !== -1) {
                        metadata [key.split(':')[1]] = nodeEntry.entry.properties[key];
                    } else {
                        metadata [key] = nodeEntry.entry.properties[key];
                    }
                }
            }
        }

        return new NodeMetadata(metadata, nodeEntry.entry.nodeType);
    }

}
