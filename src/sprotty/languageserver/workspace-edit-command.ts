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

import { Action, Command, CommandExecutionContext, CommandResult, TYPES } from "sprotty/lib";
import { Workspace, WorkspaceEdit } from "@theia/languages/lib/browser";
import { inject, injectable } from "inversify";
import { TheiaDiagramServer } from "../theia-diagram-server";

@injectable()
export abstract class AbstractWorkspaceEditCommand extends Command {

    @inject(TheiaDiagramServer) diagramServer: TheiaDiagramServer;

    abstract createWorkspaceEdit(context: CommandExecutionContext): WorkspaceEdit

    get workspace(): Workspace {
        return this.diagramServer.connector.workspace!;
    }

    protected workspaceEdit: WorkspaceEdit | undefined;

    execute(context: CommandExecutionContext): CommandResult {
        this.workspaceEdit = this.createWorkspaceEdit(context)
        this.workspace.applyEdit(this.workspaceEdit);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandResult {
        // TODO implement revert workspace edit
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandResult {
        // TODO implement revert workspace edit
        return context.root;
    }
}

@injectable()
export class WorkspaceEditCommand extends AbstractWorkspaceEditCommand {
    static readonly KIND = 'workspaceEdit';

    constructor(@inject(TYPES.Action) readonly action: WorkspaceEditAction) {
        super();
    }

    createWorkspaceEdit(context: CommandExecutionContext) {
        return this.action.workspaceEdit;
    }
}

/**
 * This is a client only action, so it does not have to be serializable
 */
export class WorkspaceEditAction implements Action {
    readonly kind = WorkspaceEditCommand.KIND;
    constructor(readonly workspaceEdit: WorkspaceEdit) {}
}
