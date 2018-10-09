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

import { RenameRequest } from '@theia/languages/lib/browser';
import { SingleTextInputDialog } from '@theia/core/lib/browser';
import { inject, injectable } from "inversify";
import { SLabel } from "sprotty/lib";
import { TheiaDiagramServerProvider } from "../theia-diagram-server";
import { Ranged, toLsRange } from "./ranged";

@injectable()
export class RenameLabelEditor {

    @inject(TheiaDiagramServerProvider) diagramServerProvider: TheiaDiagramServerProvider;

    async edit(element: SLabel & Ranged) {
        const range = toLsRange(element.range);
        const diagramServer = await this.diagramServerProvider();
        const connector = await diagramServer.getConnector();
        if (connector.workspaceEditApplicator) {
            const initialValue = element.text;
            const dialog = new SingleTextInputDialog({
                title: 'Rename Element',
                initialValue,
                initialSelectionRange: {
                    start: 0,
                    end: element.text.length
                },
                validate: (name, mode) => {
                    if (initialValue === name && mode === 'preview') {
                        return false;
                    }
                    return true;
                }
            });
            const newName = await dialog.open();
            if (newName) {
                const languageClient = await connector.getLanguageClient();
                const workspaceEdit = await languageClient.sendRequest(RenameRequest.type, {
                    textDocument: { uri: diagramServer.getSourceUri() },
                    position: range.start,
                    newName
                })
                if (workspaceEdit) {
                    await connector.workspaceEditApplicator.applyEdit(workspaceEdit)
                }
            }
        }
    }
}