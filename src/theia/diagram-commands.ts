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

import {
    CenterAction,
    FitToScreenAction,
    RequestExportSvgAction,
    UndoAction,
    RedoAction,
    SelectAllAction,
    LayoutAction
} from 'sprotty';
import { DiagramWidget } from './diagram-widget';
import { injectable, inject } from 'inversify';
import { MAIN_MENU_BAR, MenuContribution, MenuModelRegistry, CommandContribution,
         CommandHandler, CommandRegistry, MenuPath } from '@theia/core/lib/common';
import { ApplicationShell, OpenerService, CommonCommands } from '@theia/core/lib/browser';
import { EDITOR_CONTEXT_MENU, EditorManager } from "@theia/editor/lib/browser";
import { DiagramManager } from './diagram-manager';

export namespace DiagramCommands {
    export const CENTER = 'diagram:center';
    export const FIT = 'diagram:fit';
    export const EXPORT = 'diagram:export';
    export const SELECT_ALL = 'diagram.selectAll';
    export const OPEN_IN_DIAGRAM = 'diagram.open';
    export const DELETE = 'diagram.delete';
    export const LAYOUT = 'diagram.layout';
}

export namespace DiagramMenus {
    export const DIAGRAM: MenuPath = MAIN_MENU_BAR.concat("3_diagram");
    export const EDITOR_CONTEXT_DIAGRAM: MenuPath = EDITOR_CONTEXT_MENU.concat("a_diagram");
}

@injectable()
export class DiagramMenuContribution implements MenuContribution {

    registerMenus(registry: MenuModelRegistry) {
        registry.registerSubmenu(DiagramMenus.DIAGRAM, "Diagram");

        registry.registerMenuAction(DiagramMenus.DIAGRAM, {
            commandId: DiagramCommands.CENTER
        });
        registry.registerMenuAction(DiagramMenus.DIAGRAM, {
            commandId: DiagramCommands.FIT
        });
        registry.registerMenuAction(DiagramMenus.DIAGRAM, {
            commandId: DiagramCommands.EXPORT
        });
        registry.registerMenuAction(DiagramMenus.DIAGRAM, {
            commandId: DiagramCommands.LAYOUT
        });
        registry.registerMenuAction(DiagramMenus.EDITOR_CONTEXT_DIAGRAM, {
            commandId: DiagramCommands.OPEN_IN_DIAGRAM
        });
    }
}

export class DiagramCommandHandler implements CommandHandler {

    constructor(protected readonly shell: ApplicationShell,
                protected readonly doExecute: (diagram: DiagramWidget) => any) {
    }

    execute(...args: any[]) {
        return this.isEnabled()
            ? this.doExecute((this.shell.activeWidget || this.shell.currentWidget) as DiagramWidget)
            : undefined;
    }

    isEnabled(): boolean {
        return (this.shell.activeWidget || this.shell.currentWidget) instanceof DiagramWidget;
    }
}

export class OpenInDiagramHandler implements CommandHandler {

    constructor(protected readonly editorManager: EditorManager,
                protected readonly openerService: OpenerService) {
    }

    execute(...args: any[]) {
        const editor = this.editorManager.currentEditor;
        if (editor !== undefined) {
            const uri = editor.editor.uri;
            const openersPromise = this.openerService.getOpeners(uri);
            openersPromise.then(openers => {
                const opener = openers.find(o => o instanceof DiagramManager);
                if (opener !== undefined)
                    opener.open(uri);
            });
        }
    }

    isEnabled(): boolean {
        const editor = this.editorManager.currentEditor;
        if (editor) {
            const uri = editor.editor.uri;
            return uri.scheme !== 'diff';
        }
        return false;
    }
}

@injectable()
export class DiagramCommandContribution implements CommandContribution {

    @inject(ApplicationShell) protected readonly shell: ApplicationShell;
    @inject(EditorManager) protected readonly editorManager: EditorManager;
    @inject(OpenerService) protected readonly openerService: OpenerService;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand({
            id: DiagramCommands.CENTER,
            label: 'Center'
        });
        registry.registerCommand({
            id: DiagramCommands.FIT,
            label: 'Fit to screen'
        });
        registry.registerCommand({
            id: DiagramCommands.EXPORT,
            label: 'Export'
        });
        registry.registerCommand({
            id: DiagramCommands.LAYOUT,
            label: 'Layout'
        });
        registry.registerCommand({
            id: DiagramCommands.SELECT_ALL,
            label: 'Select all'
        });
        registry.registerCommand({
            id: DiagramCommands.OPEN_IN_DIAGRAM,
            label: 'Open in Diagram'
        });

        registry.registerHandler(
            DiagramCommands.CENTER,
            new DiagramCommandHandler(this.shell, widget =>
                widget.actionDispatcher.dispatch(new CenterAction([]))
            )
        );
        registry.registerHandler(
            DiagramCommands.FIT,
            new DiagramCommandHandler(this.shell, widget =>
                widget.actionDispatcher.dispatch(new FitToScreenAction([]))
            )
        );
        registry.registerHandler(
            DiagramCommands.EXPORT,
            new DiagramCommandHandler(this.shell, widget =>
                widget.actionDispatcher.dispatch(new RequestExportSvgAction())
            )
        );
        registry.registerHandler(
            DiagramCommands.LAYOUT,
            new DiagramCommandHandler(this.shell, widget =>
                widget.actionDispatcher.dispatch(new LayoutAction())
            )
        );
        registry.registerHandler(
            DiagramCommands.SELECT_ALL,
            new DiagramCommandHandler(this.shell, widget => {
                const action = new SelectAllAction(true);
                widget.actionDispatcher.dispatch(action);
            })
        );
        registry.registerHandler(
            DiagramCommands.OPEN_IN_DIAGRAM,
            new OpenInDiagramHandler(this.editorManager, this.openerService)
        );
        registry.registerHandler(
            CommonCommands.UNDO.id,
            new DiagramCommandHandler(this.shell, widget =>
                widget.actionDispatcher.dispatch(new UndoAction())
            )
        );
        registry.registerHandler(
            CommonCommands.REDO.id,
            new DiagramCommandHandler(this.shell, widget =>
                widget.actionDispatcher.dispatch(new RedoAction())
            )
        );
    }
}
