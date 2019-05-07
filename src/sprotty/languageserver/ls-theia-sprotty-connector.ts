/********************************************************************************
 * Copyright (c) 2019 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { QuickPickService, WidgetManager } from '@theia/core/lib/browser';
import { ILanguageClient } from '@theia/languages/lib/browser';
import { MonacoWorkspace } from "@theia/monaco/lib/browser/monaco-workspace";
import { ActionMessage, ExportSvgAction, ServerStatusAction } from 'sprotty';
import { DiagramManager } from '../../theia/diagram-manager';
import { DiagramWidget } from '../../theia/diagram-widget';
import { ActionMessageReceiver, DiagramLanguageClient } from '../../theia/languageserver';
import { TheiaDiagramServer } from '../theia-diagram-server';
import { TheiaFileSaver } from '../theia-file-saver';
import { EditorManager } from '@theia/editor/lib/browser';
import { TheiaSprottyConnector, TheiaSprottyConnectorServices } from '../theia-sprotty-connector';

/**
 * Connects sprotty DiagramServers to a Theia LanguageClientContribution.
 *
 * Used to tunnel sprotty actions to and from the sprotty server through
 * the LSP.
 *
 * Instances bridge the gap between the sprotty DI containers (one per
 * diagram) and a specific language client from the Theia DI container
 * (one per application).
 */
export class LSTheiaSprottyConnector implements TheiaSprottyConnector, TheiaSprottyConnectorServices, ActionMessageReceiver {
    private servers: TheiaDiagramServer[] = [];

    readonly diagramLanguageClient: DiagramLanguageClient;
    readonly fileSaver: TheiaFileSaver;
    readonly editorManager: EditorManager;
    readonly widgetManager: WidgetManager;
    readonly diagramManager: DiagramManager;
    readonly workspace?: MonacoWorkspace;
    readonly quickPickService?: QuickPickService;

    constructor(services: TheiaSprottyConnectorServices) {
        Object.assign(this, services);
        this.diagramLanguageClient.connect(this);
    }

    connect(diagramServer: TheiaDiagramServer) {
        this.servers.push(diagramServer);
        diagramServer.connect(this);
    }

    disconnect(diagramServer: TheiaDiagramServer) {
        const index = this.servers.indexOf(diagramServer);
        if (index >= 0)
            this.servers.splice(index, 1);
        diagramServer.disconnect();
        this.diagramLanguageClient.didClose(diagramServer.clientId);
    }

    save(uri: string, action: ExportSvgAction) {
        this.fileSaver.save(uri, action);
    }

    showStatus(clientId: string, status: ServerStatusAction): void {
        const widget = this.widgetManager
            .getWidgets(this.diagramManager.id)
            .find(w => w instanceof DiagramWidget && w.clientId === clientId);
        if (widget instanceof DiagramWidget)
            widget.setStatus(status);
    }

    sendMessage(message: ActionMessage) {
        this.diagramLanguageClient.sendThroughLsp(message);
    }

    getLanguageClient(): Promise<ILanguageClient> {
        return this.diagramLanguageClient.languageClient;
    }

    onMessageReceived(message: ActionMessage): void {
        this.servers.forEach(element => {
            element.messageReceived(message);
        });
    }
}
