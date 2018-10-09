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

import { SLabel } from "sprotty/lib";
import { Ranged, toLsRange } from "./ranged";
import { inject, injectable } from "inversify";
import { TheiaDiagramServerProvider } from "../theia-diagram-server";
import { CompletionRequest, CompletionList, CompletionItem, TextEdit } from '@theia/languages/lib/browser';

@injectable()
export class CompletionLabelEditor {

    @inject(TheiaDiagramServerProvider) diagramServerProvider: TheiaDiagramServerProvider;

    async edit(element: SLabel & Ranged) {
        const range = toLsRange(element.range);
        const diagramServer = await this.diagramServerProvider();
        const connector = await diagramServer.getConnector();
        if (connector.quickPickService && connector.workspaceEditApplicator) {
            const languageClient = await connector.getLanguageClient();
            const uri = diagramServer.getSourceUri();
            const completions = await languageClient.sendRequest(CompletionRequest.type, {
                textDocument: { uri: diagramServer.getSourceUri() },
                position: range.start
            })
            if (completions) {
                const completionItems = ((completions as any)["items"])
                    ? (completions as CompletionList).items
                    : completions as CompletionItem[]
                const quickPickItems = completionItems.map(i => { return {
                    label: i.textEdit!.newText,
                    value: i
                }});
                const pick = await connector.quickPickService.show(quickPickItems)
                if (pick && pick.textEdit) {
                    const changes: { [uri: string]: TextEdit[] } = {};
                    changes[uri] = [ {
                        ...pick.textEdit, ...{ range }
                    }];
                    await connector.workspaceEditApplicator.applyEdit({
                        changes
                    })
                }
            }
        }
    }
}