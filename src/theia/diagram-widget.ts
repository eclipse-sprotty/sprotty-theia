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

import { RequestModelAction, CenterAction, InitializeCanvasBoundsAction, ServerStatusAction, IActionDispatcher,
    ModelSource, TYPES, DiagramServer, ViewerOptions } from 'sprotty';
import { Widget } from "@phosphor/widgets";
import { Message } from "@phosphor/messaging/lib";
import { BaseWidget } from '@theia/core/lib/browser/widgets/widget';
import { StatefulWidget } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { TheiaSprottyConnector } from '../sprotty/theia-sprotty-connector';
import { Container } from 'inversify';
import { TheiaDiagramServer } from '../sprotty/theia-diagram-server';

export interface DiagramWidgetOptions {
    uri: string
    diagramType: string
    label: string
    iconClass: string
}

export namespace DiagramWidgetOptions {
    export function is(options: any): options is DiagramWidgetOptions {
        return options.diagramType
            && options.uri
            && options.label
            && options.iconClass;
    }
}

export class DiagramWidget extends BaseWidget implements StatefulWidget {

    private statusIconDiv: HTMLDivElement;
    private statusMessageDiv: HTMLDivElement;

    protected options: DiagramWidgetOptions;
    protected _actionDispatcher: IActionDispatcher;

    protected _modelSource: ModelSource;

    get uri(): URI {
        return new URI(this.options.uri);
    }

    get actionDispatcher(): IActionDispatcher {
        return this.diContainer.get(TYPES.IActionDispatcher);
    }

    get viewerOptions(): ViewerOptions {
        return this.diContainer.get(TYPES.ViewerOptions);
    }

    get modelSource(): ModelSource {
        return this._modelSource;
    }

    get clientId(): string {
        if (this._modelSource instanceof DiagramServer)
            return this._modelSource.clientId;
        else
            return this.widgetId;
    }

    get id(): string {
        return this.widgetId;
    }

    constructor(options: DiagramWidgetOptions, readonly widgetId: string, readonly diContainer: Container, readonly connector?: TheiaSprottyConnector) {
        super();
        this.options = options;
        this.title.closable = true;
        this.title.label = options.label;
        this.title.iconClass = options.iconClass;
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);

        const svgContainer = document.createElement("div");
        svgContainer.id = this.viewerOptions.baseDiv;
        this.node.appendChild(svgContainer);

        const hiddenContainer = document.createElement("div");
        hiddenContainer.id = this.viewerOptions.hiddenDiv;
        document.body.appendChild(hiddenContainer);

        const statusDiv = document.createElement("div");
        statusDiv.setAttribute('class', 'sprotty-status');
        this.node.appendChild(statusDiv);

        this.statusIconDiv = document.createElement("div");
        statusDiv.appendChild(this.statusIconDiv);

        this.statusMessageDiv = document.createElement("div");
        this.statusMessageDiv.setAttribute('class', 'sprotty-status-message');
        statusDiv.appendChild(this.statusMessageDiv);
        this.initializeSprotty();
    }

    protected initializeSprotty() {
        const modelSource = this.diContainer.get<ModelSource>(TYPES.ModelSource);
        this._modelSource = modelSource;
        if (modelSource instanceof TheiaDiagramServer && this.connector)
            this.connector.connect(modelSource);
        this.disposed.connect(() => {
            if (modelSource instanceof TheiaDiagramServer && this.connector)
                this.connector.disconnect(modelSource);
        });
        this.actionDispatcher.dispatch(new RequestModelAction({
            sourceUri: this.options.uri,
            diagramType: this.options.diagramType
        }));
    }

    protected getBoundsInPage(element: Element) {
        const bounds = element.getBoundingClientRect();
        return {
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
        };
    }

    protected onResize(msg: Widget.ResizeMessage): void {
        super.onResize(msg);
        const newBounds = this.getBoundsInPage(this.node as Element);
        this.actionDispatcher.dispatch(new InitializeCanvasBoundsAction(newBounds));
        this.actionDispatcher.dispatch(new CenterAction([], false));
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const svgElement = this.node.querySelector(`#${this.viewerOptions.baseDiv} svg`) as HTMLElement;
        if (svgElement !== null)
            svgElement.focus();
    }

    /**
     * We cannot activate the widget before the SVG element is there, as it takes the focus.
     * This should happen within two animation frames, as the action dispatcher issues
     * a SetModelCommand in the constructor. OTOH, shell.activateWidget() is synchronous. So
     * after creating the widget and before activating it, we use this method to wait for the
     * SVG to be appended to the DOM.
     */
    async getSvgElement(): Promise<HTMLElement | undefined> {
        return new Promise<HTMLElement | undefined>((resolve) => {
            let frames = 0;
            const waitForSvg = () => {
                requestAnimationFrame(() => {
                    const svgElement = this.node.querySelector(`#${this.viewerOptions.baseDiv} svg`) as HTMLElement;
                    if (svgElement !== null)
                        resolve(svgElement);
                    else if (++frames < 5)
                        waitForSvg();
                    else
                        resolve(undefined);
                });
            };
            waitForSvg();
        });
    }

    setStatus(status: ServerStatusAction): void {
        this.statusMessageDiv.textContent = status.message;
        this.removeClasses(this.statusMessageDiv, 1);
        this.statusMessageDiv.classList.add(status.severity.toLowerCase());
        this.removeClasses(this.statusIconDiv, 0);
        const classes = this.statusIconDiv.classList;
        classes.add(status.severity.toLowerCase());
        switch (status.severity) {
            case 'FATAL':
                classes.add('fa');
                classes.add('fa-times-circle');
                break;
            case 'ERROR':
                classes.add('fa');
                classes.add('fa-exclamation-circle');
                break;
            case 'WARNING':
                classes.add('fa');
                classes.add('fa-exclamation-circle');
                break;
            case 'INFO':
                classes.add('fa');
                classes.add('fa-info-circle');
                break;
        }
    }

    protected removeClasses(element: Element, keep: number) {
        const classes = element.classList;
        while (classes.length > keep) {
            const item = classes.item(classes.length - 1);
            if (item)
                classes.remove(item);
        }
    }

    storeState(): object {
        return this.options;
    }

    restoreState(oldState: object): void {
        if (DiagramWidgetOptions.is(oldState))
            this.options = oldState;
    }
}
