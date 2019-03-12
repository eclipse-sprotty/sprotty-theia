/********************************************************************************
 * Copyright (c) 2019 TypeFox and others.
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

import { Action, CenterCommand, FitToScreenCommand, IDiagramLocker, ViewportCommand,
    HoverFeedbackCommand, RequestPopupModelAction, SetPopupModelCommand, SelectCommand,
    SelectAllCommand, ServerStatusAction, SetModelCommand, UpdateModelCommand } from "sprotty";
import { injectable } from "inversify";

/**
 * An `IDiagramLocker` for language-server based editable diagrams.
 *
 * Prevents displatching of edit actions when editing is disallowed, e.g.
 * because the LS's status is fatal.
 */
@injectable()
export class EditDiagramLocker implements IDiagramLocker {

    protected nonEditActions = [
        SetModelCommand.KIND, UpdateModelCommand.KIND,
        CenterCommand.KIND, FitToScreenCommand.KIND, ViewportCommand.KIND,
        SelectCommand.KIND, SelectAllCommand.KIND,
        HoverFeedbackCommand.KIND, RequestPopupModelAction.KIND, SetPopupModelCommand.KIND,
        ServerStatusAction.KIND
    ];

    allowEdit = true;

    isAllowed(action: Action): boolean {
        return this.allowEdit || this.nonEditActions.indexOf(action.kind) >= 0;
    }
}
