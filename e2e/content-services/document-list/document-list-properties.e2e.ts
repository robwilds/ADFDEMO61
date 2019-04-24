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

import { LoginPage } from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../pages/adf/contentServicesPage';
import { NavigationBarPage } from '../../pages/adf/navigationBarPage';

import { AcsUserModel } from '../../models/ACS/acsUserModel';
import TestConfig = require('../../test.config');
import resources = require('../../util/resources');

import { AlfrescoApiCompatibility as AlfrescoApi } from '@alfresco/js-api';
import { UploadActions } from '../../actions/ACS/upload.actions';
import { DropActions } from '../../actions/drop.actions';
import { FileModel } from '../../models/ACS/fileModel';

describe('Document List Component - Properties', () => {

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const navigationBar = new NavigationBarPage();

    let subFolder, parentFolder;
    const uploadActions = new UploadActions();
    let acsUser = null;

    const pngFile = new FileModel({
        'name': resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': resources.Files.ADF_DOCUMENTS.PNG.file_location
    });

    beforeAll(() => {
        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: TestConfig.adf.url
        });
    });

    describe('Allow drop files property', async () => {

        beforeEach(async (done) => {
            acsUser = new AcsUserModel();

            await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

            await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

            await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

            parentFolder = await uploadActions.createFolder(this.alfrescoJsApi, 'parentFolder', '-my-');

            subFolder = await uploadActions.createFolder(this.alfrescoJsApi, 'subFolder', parentFolder.entry.id);

            loginPage.loginToContentServicesUsingUserModel(acsUser);

            done();
        });

        afterEach(async (done) => {
            await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
            await uploadActions.deleteFilesOrFolder(this.alfrescoJsApi, subFolder.entry.id);
            await uploadActions.deleteFilesOrFolder(this.alfrescoJsApi, parentFolder.entry.id);
            done();
        });

        it('[C299154] Should disallow upload content on a folder row if allowDropFiles is false', () => {
            navigationBar.clickContentServicesButton();
            contentServicesPage.doubleClickRow(parentFolder.entry.name);

            contentServicesPage.disableDropFilesInAFolder();

            const dragAndDropArea = contentServicesPage.getRowByName(subFolder.entry.name);

            const dragAndDrop = new DropActions();
            dragAndDrop.dropFile(dragAndDropArea, pngFile.location);

            contentServicesPage.checkContentIsDisplayed(pngFile.name);
            contentServicesPage.doubleClickRow(subFolder.entry.name);
            contentServicesPage.checkEmptyFolderTextToBe('This folder is empty');
        });

        it('[C91319] Should allow upload content on a folder row if allowDropFiles is true', () => {
            navigationBar.clickContentServicesButton();
            contentServicesPage.doubleClickRow(parentFolder.entry.name);

            contentServicesPage.enableDropFilesInAFolder();

            const dragAndDropArea = contentServicesPage.getRowByName(subFolder.entry.name);

            const dragAndDrop = new DropActions();
            dragAndDrop.dropFile(dragAndDropArea, pngFile.location);

            contentServicesPage.checkContentIsNotDisplayed(pngFile.name);
            contentServicesPage.doubleClickRow(subFolder.entry.name);
            contentServicesPage.checkContentIsDisplayed(pngFile.name);
        });
    });
});
