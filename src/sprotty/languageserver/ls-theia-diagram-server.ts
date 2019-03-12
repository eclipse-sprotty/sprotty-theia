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

import { inject, injectable } from "inversify";
import { ServerStatusAction } from "sprotty";
import { TheiaDiagramServer } from "../theia-diagram-server";
import { EditDiagramLocker } from "./edit-diagram-locker";
import { LSTheiaSprottyConnector } from "./ls-theia-sprotty-connector";

export const LSTheiaDiagramServerProvider = Symbol('LSTheiaDiagramServerProvider');

export type LSTheiaDiagramServerProvider = () => Promise<LSTheiaDiagramServer>;

@injectable()
export class LSTheiaDiagramServer extends TheiaDiagramServer {

    @inject(EditDiagramLocker) diagramLocker: EditDiagramLocker;

    connect(connector: LSTheiaSprottyConnector): void {
        super.connect(connector);
    }

    get workspace() {
        if (this.connector)
            return this.connector.workspace;
        else
            return undefined;
    }

    get connector(): LSTheiaSprottyConnector {
        return this._connector as LSTheiaSprottyConnector;
    }

    handleServerStateAction(action: ServerStatusAction) {
        this.diagramLocker.allowEdit = action.severity !== 'FATAL';
        return super.handleServerStateAction(action);
    }
}
