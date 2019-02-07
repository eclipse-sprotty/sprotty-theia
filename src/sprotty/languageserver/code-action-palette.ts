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

import { inject, injectable } from "inversify";
import { Action, EMPTY_ROOT, HtmlRootSchema, PopupHoverMouseListener, RequestPopupModelAction,
    SButton, SButtonSchema, SetPopupModelAction, SModelElement, SModelElementSchema, SModelRootSchema } from "sprotty/lib";
import { TheiaDiagramServerProvider, IRootPopupModelProvider } from '../theia-diagram-server';
import { CodeAction, CodeActionParams, CodeActionRequest, Range } from '@theia/languages/lib/browser';
import { WorkspaceEditAction } from "./workspace-edit-command";
import { getRange } from "./traceable";

@injectable()
export class CodeActionProvider {

    @inject(TheiaDiagramServerProvider) diagramServerProvider: TheiaDiagramServerProvider;

    async getCodeActions(range: Range, codeActionKind: string) {
        const diagramServer = await this.diagramServerProvider();
        const connector = diagramServer.connector;
        const languageClient = await connector.getLanguageClient();
        return await languageClient.sendRequest(CodeActionRequest.type, <CodeActionParams>{
            textDocument: {
                uri: diagramServer.sourceUri
            },
            range,
            context: {
                diagnostics: [],
                only: [codeActionKind]
            }
        });
    }
}

/**
 * A popup-palette based on code actions.
 */
@injectable()
export class CodeActionPalettePopupProvider implements IRootPopupModelProvider {

    @inject(CodeActionProvider) codeActionProvider: CodeActionProvider;

    async getPopupModel(action: RequestPopupModelAction, rootElement: SModelRootSchema): Promise<SModelElementSchema | undefined> {
        const range = getRange(rootElement);
        if (range !== undefined) {
            const codeActions = await this.codeActionProvider.getCodeActions(range, 'sprotty.create');
            if (codeActions) {
                const buttons: PaletteButtonSchema[] = [];
                codeActions.forEach(codeAction => {
                    if (CodeAction.is(codeAction)) {
                        buttons.push(<PaletteButtonSchema>{
                            id: codeAction.title,
                            type: 'button:create',
                            codeActionKind: codeAction.kind,
                            range
                        });
                    }
                });
                return <HtmlRootSchema>{
                    id: "palette",
                    type: "palette",
                    classes: ['sprotty-palette'],
                    children: buttons,
                    canvasBounds: action.bounds
                };
            }
        }
        return undefined;
    }
}

export interface PaletteButtonSchema extends SButtonSchema {
    codeActionKind: string;
    range: Range;
}

export class PaletteButton extends SButton {
    codeActionKind: string;
    range: Range;
}

@injectable()
export class PaletteMouseListener extends PopupHoverMouseListener {

    @inject(CodeActionProvider) codeActionProvider: CodeActionProvider;
    @inject(TheiaDiagramServerProvider) diagramServerProvider: TheiaDiagramServerProvider;

    mouseDown(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        if (target instanceof PaletteButton) {
            return [this.getWorkspaceEditAction(target)];
        }
        return [];
    }

    async getWorkspaceEditAction(target: PaletteButton): Promise<Action> {
        const diagramServer = await this.diagramServerProvider();
        const workspace = diagramServer.connector.workspace;
        if (workspace) {
            const codeActions = await this.codeActionProvider.getCodeActions(target.range, target.codeActionKind);
            if (codeActions) {
                for (let codeAction of codeActions) {
                    if (CodeAction.is(codeAction) && codeAction.edit)
                        return new WorkspaceEditAction(codeAction.edit);
                }
            }
        }
        return new SetPopupModelAction(EMPTY_ROOT);
    }
}
