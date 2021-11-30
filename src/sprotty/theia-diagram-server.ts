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

import { inject, injectable, optional } from 'inversify';
import {
    ActionHandlerRegistry,  DiagramServerProxy,  ExportSvgAction, ICommand, ServerStatusAction
} from 'sprotty';
import {
    Action, ActionMessage, RequestModelAction, RequestPopupModelAction, SelectAction, SetPopupModelAction,
    SModelElement, SModelRoot
} from 'sprotty-protocol';
import { TheiaSprottyConnector } from './theia-sprotty-connector';

export const IRootPopupModelProvider = Symbol('IRootPopupModelProvider');
export interface IRootPopupModelProvider {
    getPopupModel(action: RequestPopupModelAction, rootElement: SModelRoot): Promise<SModelElement | undefined>;
}

/**
 * A sprotty DiagramServer that integrates with the Theia workbench.
 *
 * This class is the sprotty side of the Theia/sprotty integration. It
 * is instantiated with the DI container of the sprotty diagram. Theia
 * services are available via the TheiaDiagramServerConnector.
 */
@injectable()
export abstract class TheiaDiagramServer extends DiagramServerProxy {

    protected _sourceUri: string;

    protected _connector: TheiaSprottyConnector | undefined;

    @inject(IRootPopupModelProvider)@optional() protected rootPopupModelProvider: IRootPopupModelProvider;

    connect(connector: TheiaSprottyConnector): void {
        this._connector = connector;
    }

    disconnect(): void {
    }

    get connector() {
        if (!this._connector) {
            throw Error("TheiaDiagramServer is not connected.");
        }
        return this._connector!;
    }

    get sourceUri() {
        return this._sourceUri;
    }


    initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);
        registry.register(SelectAction.KIND, this);
    }

    handle(action: Action): void | ICommand | Action {
        if (action.kind === RequestModelAction.KIND && (action as RequestModelAction).options !== undefined) {
            this._sourceUri = (action as RequestModelAction).options!.sourceUri as string;
        }
        return super.handle(action);
    }

    handleLocally(action: Action): boolean {
        if (action.kind === RequestPopupModelAction.KIND) {
            return this.handleRequestPopupModel(action as RequestPopupModelAction);
        } else {
            return super.handleLocally(action);
        }
    }

    handleExportSvgAction(action: ExportSvgAction): boolean {
        this.connector.save(this.sourceUri, action);
        return true;
    }

    handleRequestPopupModel(action: RequestPopupModelAction): boolean {
        if (action.elementId === this.currentRoot.id) {
            this.rootPopupModelProvider.getPopupModel(action, this.currentRoot).then(model => {
                if (model)
                    this.actionDispatcher.dispatch(SetPopupModelAction.create(model));
            });
            return false;
        } else {
            return true;
        }
    }

    protected handleServerStateAction(status: ServerStatusAction): boolean {
        this.connector.showStatus(this.clientId, status);
        return false;
    }

    sendMessage(message: ActionMessage) {
        this.connector.sendMessage(message);
    }

    /**
     * made public
     */
    messageReceived(message: ActionMessage) {
        super.messageReceived(message);
    }
}
