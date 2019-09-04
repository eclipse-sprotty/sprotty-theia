/********************************************************************************
 * Copyright (c) 2018 EclipseSource and others.
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
import { inject, injectable, } from "inversify";
import {
    Action, ActionHandlerRegistry, IActionHandler, SelectAction, TYPES, ViewerOptions,
    RequestModelAction, IActionHandlerInitializer
} from "sprotty";
import { SelectionService } from "@theia/core";


export interface SprottySelection {
    selectedElementsIDs: string[]
    widgetId: string
    sourceUri?: string
}

export function isSprottySelection(object?: any): object is SprottySelection {
    return object !== undefined && (<SprottySelection>object).selectedElementsIDs !== undefined
        && (<SprottySelection>object).widgetId !== undefined;
}

@injectable()
export class TheiaSprottySelectionForwarder implements IActionHandlerInitializer, IActionHandler {

    @inject(TYPES.ViewerOptions) protected viewerOptions: ViewerOptions;
    @inject(SelectionService) protected selectionService: SelectionService;

    protected sourceUri?: string;

    initialize(registry: ActionHandlerRegistry): any {
        registry.register(RequestModelAction.KIND, this);
        registry.register(SelectAction.KIND, this);
    }

    handle(action: Action): void {
        if (action instanceof SelectAction) {
            this.selectionService.selection = <SprottySelection>{
                selectedElementsIDs: action.selectedElementsIDs,
                widgetId: this.viewerOptions.baseDiv,
                sourceUri: this.sourceUri
            };
        } else if (action instanceof RequestModelAction && action.options !== undefined) {
            this.sourceUri = action.options.sourceUri;
        }
    }
}
