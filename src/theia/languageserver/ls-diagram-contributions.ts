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

import { CommandContribution, CommandRegistry } from "@theia/core";
import { ApplicationShell, KeybindingContribution, KeybindingRegistry } from "@theia/core/lib/browser";
import { inject, injectable } from "inversify";
import { DeleteWithWorkspaceEditAction } from "../../sprotty/languageserver/delete";
import { DiagramCommandHandler, DiagramCommands } from "../diagram-commands";
import { DiagramKeybindingContext } from "../diagram-keybinding";
import { DiagramWidget } from "../diagram-widget";
import { LSTheiaSprottyConnector } from "../../sprotty/languageserver/ls-theia-sprotty-connector";

@injectable()
export class LSDiagramCommandContribution implements CommandContribution {

    @inject(ApplicationShell) protected readonly shell: ApplicationShell;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand({
            id: DiagramCommands.DELETE,
            label: 'Delete selected'
        });
        registry.registerHandler(
            DiagramCommands.DELETE,
            new DiagramCommandHandler(this.shell, widget => {
                if (widget instanceof DiagramWidget) {
                    const workspace = widget.connector instanceof LSTheiaSprottyConnector ? widget.connector.workspace : undefined;
                    if (workspace) {
                        const action = new DeleteWithWorkspaceEditAction(workspace, widget.uri.toString(true));
                        widget.actionDispatcher.dispatch(action);
                    }
                }
            })
        );
    }
}

@injectable()
export class LSDiagramKeybindingContribution implements KeybindingContribution {

    @inject(DiagramKeybindingContext) protected readonly diagramKeybindingContext: DiagramKeybindingContext;

    registerKeybindings(registry: KeybindingRegistry): void {
        registry.registerKeybinding({
            command: DiagramCommands.DELETE,
            context: this.diagramKeybindingContext.id,
            keybinding: 'del'
        });
        registry.registerKeybinding({
            command: DiagramCommands.DELETE,
            context: this.diagramKeybindingContext.id,
            keybinding: 'backspace'
        });
    }
}
