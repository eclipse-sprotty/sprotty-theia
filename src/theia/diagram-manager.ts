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

import { injectable, inject } from "inversify";
import { WidgetOpenHandler, WidgetManager, WidgetOpenerOptions, ApplicationShell, Widget, WidgetFactory } from "@theia/core/lib/browser";
import { DiagramWidget, DiagramWidgetOptions } from "./diagram-widget";
import URI from "@theia/core/lib/common/uri";
import { EditorManager } from "@theia/editor/lib/browser";
import { TheiaSprottyConnector } from "../sprotty/theia-sprotty-connector";
import { DiagramConfigurationRegistry } from "./diagram-configuration";

export const DiagramManagerProvider = Symbol('DiagramManagerProvider');

export type DiagramManagerProvider = () => Promise<DiagramManager>;

@injectable()
export abstract class DiagramManager extends WidgetOpenHandler<DiagramWidget> implements WidgetFactory {

    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(EditorManager) protected editorManager: EditorManager;
    @inject(DiagramConfigurationRegistry) diagramConfigurationRegistry: DiagramConfigurationRegistry;

    abstract get diagramType(): string;

    abstract get iconClass(): string

    private widgetCount = 0;

    canHandle(uri: URI, options?: WidgetOpenerOptions | undefined): number {
        return 10;
    }

    async doOpen(widget: DiagramWidget, options?: WidgetOpenerOptions) {
        const op: WidgetOpenerOptions = {
            mode: options && options.mode ? options.mode : 'activate',
            ...options
        };
        if (!widget.isAttached) {
            const currentEditor = this.editorManager.currentEditor;
            const widgetOptions: ApplicationShell.WidgetOptions = {
                area: 'main',
                ...(options && options.widgetOptions ? options.widgetOptions : {})
            };
            if (!!currentEditor && currentEditor.editor.uri.toString(true) === widget.uri.toString(true)) {
                widgetOptions.ref = currentEditor;
                widgetOptions.mode = options && options.widgetOptions && options.widgetOptions.mode ? options.widgetOptions.mode : 'open-to-right';
            } 
            this.shell.addWidget(widget, widgetOptions);
        }
        const promises: Promise<void>[] = [];
        if (op.mode === 'activate') {
            await widget.getSvgElement();
            promises.push(this.onActive(widget));
            promises.push(this.onReveal(widget));
            this.shell.activateWidget(widget.widgetId);
        } else if (op.mode === 'reveal') {
            promises.push(this.onReveal(widget));
            this.shell.revealWidget(widget.widgetId);
        }
        await Promise.all(promises);
    }

    get id() {
        return this.diagramType + "-diagram-manager";
    }

    protected createWidgetOptions(uri: URI, options?: WidgetOpenerOptions): Object {
        const widgetOptions = options && options.widgetOptions;
        return {
            ...<DiagramWidgetOptions> {
                diagramType: this.diagramType,
                uri: uri.toString(true),
                iconClass: this.iconClass,
                label: uri.path.base
            },
            ...widgetOptions
        };
    }

    async createWidget(options?: any): Promise<Widget> {
        if (DiagramWidgetOptions.is(options)) {
            const clientId = this.createClientId();
            const config = this.diagramConfigurationRegistry.get(options.diagramType);
            const diContainer = config.createContainer(clientId);
            const diagramWidget = new DiagramWidget(options, clientId + '_widget', diContainer, this.diagramConnector);
            return diagramWidget;
        }
        throw Error('DiagramWidgetFactory needs DiagramWidgetOptions but got ' + JSON.stringify(options));
    }

    protected createClientId() {
        return this.diagramType + '_' + (this.widgetCount++);
    }

    get diagramConnector(): TheiaSprottyConnector | undefined {
        return undefined;
    }
}
