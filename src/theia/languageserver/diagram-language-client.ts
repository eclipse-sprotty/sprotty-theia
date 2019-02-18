/********************************************************************************
 * Copyright (c) 2018 TypeFox and others.
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

import { ApplicationShell } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { EditorManager } from '@theia/editor/lib/browser';
import { ILanguageClient, LanguageClientContribution, Location, NotificationType } from '@theia/languages/lib/browser';
import { inject, injectable } from 'inversify';
import { ActionMessage } from 'sprotty';
import { DiagramWidget } from '../diagram-widget';

export interface ActionMessageReceiver {
    onMessageReceived(message: ActionMessage): void
}

export interface OpenInTextEditorMessage {
    location: Location
    forceOpen: boolean
}

const acceptMessageType = new NotificationType<ActionMessage, void>('diagram/accept');
const didCloseMessageType = new NotificationType<string, void>('diagram/didClose');
const openInTextEditorMessageType = new NotificationType<OpenInTextEditorMessage, void>('diagram/openInTextEditor');

@injectable()
export class DiagramLanguageClient {

    actionMessageReceivers: ActionMessageReceiver[] = [];

    @inject(ApplicationShell) readonly shell: ApplicationShell;

    constructor(readonly languageClientContribution: LanguageClientContribution,
                readonly editorManager: EditorManager) {
        this.languageClientContribution.languageClient.then(
            lc => {
                lc.onNotification(acceptMessageType, this.onMessageReceived.bind(this));
                lc.onNotification(openInTextEditorMessageType, this.openInTextEditor.bind(this));
            }
        ).catch(
            err => console.error(err)
        );
    }

    openInTextEditor(message: OpenInTextEditorMessage) {
        const uri = new URI(message.location.uri);
        if (!message.forceOpen) {
            this.editorManager.all.forEach(editorWidget => {
                const currentTextEditor = editorWidget.editor;
                if (editorWidget.isVisible && uri.toString(true) === currentTextEditor.uri.toString(true)) {
                    currentTextEditor.cursor = message.location.range.start;
                    currentTextEditor.revealRange(message.location.range);
                    currentTextEditor.selection = message.location.range;
                }
            });
        } else {
            const widgetOptions: ApplicationShell.WidgetOptions = {
                area: 'main'
            };
            const activeWidget = this.shell.activeWidget;
            if (activeWidget instanceof DiagramWidget) {
                widgetOptions.ref = activeWidget;
                widgetOptions.mode = 'open-to-left';
            }
            this.editorManager.open(uri, { widgetOptions }).then(
                editorWidget => {
                    const editor = editorWidget.editor;
                    editor.cursor = message.location.range.start;
                    editor.revealRange(message.location.range);
                    editor.selection = message.location.range;
                });
        }
    }

    sendThroughLsp(message: ActionMessage) {
        this.languageClientContribution.languageClient.then(lc =>
            lc.onReady().then(() =>
                lc.sendNotification(acceptMessageType, message)
            )
        );
    }

    onMessageReceived(message: ActionMessage) {
        this.actionMessageReceivers.forEach(client => {
            client.onMessageReceived(message);
        });
    }

    get languageClient(): Promise<ILanguageClient> {
        return this.languageClientContribution.languageClient;
    }

    didClose(clientId: string) {
        this.languageClientContribution.languageClient.then(lc => lc.sendNotification(didCloseMessageType, clientId));
    }

    connect(client: ActionMessageReceiver) {
        this.actionMessageReceivers.push(client);
    }

    disconnect(client: ActionMessageReceiver) {
        const index = this.actionMessageReceivers.indexOf(client);
        if (index >= 0) {
            this.actionMessageReceivers.splice(index);
        }
    }
}
