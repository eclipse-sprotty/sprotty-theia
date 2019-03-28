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

import { SLabel } from "sprotty";
import { inject, injectable } from "inversify";
import { LSTheiaDiagramServerProvider } from "./ls-theia-diagram-server";
import { CompletionRequest, CompletionList, CompletionItem, TextEdit, CompletionItemKind } from '@theia/languages/lib/browser';
import { Traceable, getRange } from "./traceable";

@injectable()
export class CompletionLabelEditor {

    @inject(LSTheiaDiagramServerProvider) diagramServerProvider: LSTheiaDiagramServerProvider;

    async edit(element: SLabel & Traceable) {
        const range = getRange(element);
        const diagramServer = await this.diagramServerProvider();
        const connector = diagramServer.connector;
        if (connector.quickPickService && connector.workspace) {
            const languageClient = await connector.getLanguageClient();
            const uri = diagramServer.sourceUri;
            const completions = await languageClient.sendRequest(CompletionRequest.type, {
                textDocument: { uri },
                position: range.start
            });
            if (completions) {
                const completionItems = ((completions as any)["items"])
                    ? (completions as CompletionList).items
                    : completions as CompletionItem[];
                const quickPickItems = this.filterCompletionItems(completionItems)
                    .map(i => { return {
                        label: i.textEdit!.newText,
                        value: i
                    };
                });
                const pick = await connector.quickPickService.show(quickPickItems);
                if (pick && pick.textEdit) {
                    const changes: { [uri: string]: TextEdit[] } = {};
                    changes[uri] = [ {
                        ...pick.textEdit, ...{ range }
                    }];
                    await connector.workspace.applyEdit({
                        changes
                    });
                }
            }
        }
    }

    protected filterCompletionItems(items: CompletionItem[]): CompletionItem[] {
        return items.filter(item => item.kind === CompletionItemKind.Reference);
    }
}
