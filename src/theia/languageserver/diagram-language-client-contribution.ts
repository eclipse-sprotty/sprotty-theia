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

import { FrontendApplication } from '@theia/core/lib/browser';
import { BaseLanguageClientContribution, LanguageClientFactory, Languages, Workspace } from '@theia/languages/lib/browser';
import { inject, injectable, multiInject } from 'inversify';
import { DiagramManagerProvider } from '../diagram-manager';

@injectable()
export abstract class DiagramLanguageClientContribution extends BaseLanguageClientContribution {

    constructor(
        @inject(Workspace) workspace: Workspace,
        @inject(Languages) languages: Languages,
        @inject(LanguageClientFactory) languageClientFactory: LanguageClientFactory,
        @multiInject(DiagramManagerProvider) protected diagramManagerProviders: DiagramManagerProvider[]) {
        super(workspace, languages, languageClientFactory);
    }

    waitForActivation(app: FrontendApplication): Promise<any> {
        return Promise.race([
            super.waitForActivation(app),
            this.waitForOpenDiagrams()
        ]);
    }

    protected waitForOpenDiagrams(): Promise<any> {
        return Promise.race(this.diagramManagerProviders.map(diagramManagerProvider => {
            return diagramManagerProvider().then(diagramManager => {
                return new Promise<void>((resolve) => {
                    const disposable = diagramManager.onCreated((widget) => {
                        disposable.dispose();
                        resolve();
                    });
                });
            });
        }));
    }
}
