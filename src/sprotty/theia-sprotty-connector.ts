/********************************************************************************
 * Copyright (c) 2017-2020 TypeFox and others.
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

import { ActionMessage, ExportSvgAction, ServerStatusAction } from 'sprotty';
import { TheiaDiagramServer } from './theia-diagram-server';

/**
 * Connects sprotty DiagramServers to a Theia contribution.
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

