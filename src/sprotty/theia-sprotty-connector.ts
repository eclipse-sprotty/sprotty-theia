/********************************************************************************
 * Copyright (c) 2017-2018 TypeFox and others.
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
import { EditorManager } from '@theia/editor/lib/browser';
import { MonacoWorkspace } from "@theia/monaco/lib/browser/monaco-workspace";
import { ActionMessage, ExportSvgAction, ServerStatusAction } from 'sprotty';
import { DiagramManager } from '../theia/diagram-manager';
import { DiagramLanguageClient } from '../theia/languageserver';
import { TheiaDiagramServer } from './theia-diagram-server';
import { TheiaFileSaver } from './theia-file-saver';

export interface TheiaSprottyConnectorServices {
    readonly diagramLanguageClient: DiagramLanguageClient,
    readonly fileSaver: TheiaFileSaver,
    readonly editorManager: EditorManager,
    readonly widgetManager: WidgetManager,
    readonly diagramManager: DiagramManager,
    readonly workspace?: MonacoWorkspace,
    readonly quickPickService?: QuickPickService
}

/**
 * Connects sprotty DiagramServers to a Theia LanguageClientContribution.
 *
 * Instances bridge the gap between the sprotty DI containers (one per
 * diagram) and a specific connection client (e.g. LSP client) from the Theia DI container
 * (one per application).
 */
export interface TheiaSprottyConnector {
    connect(diagramServer: TheiaDiagramServer): void
    disconnect(diagramServer: TheiaDiagramServer): void
    save(uri: string, action: ExportSvgAction): void
    showStatus(clientId: string, status: ServerStatusAction): void
    sendMessage(message: ActionMessage): void
    onMessageReceived(message: ActionMessage): void
}

