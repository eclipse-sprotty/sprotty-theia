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

import { SModelElement, SModelExtension } from "sprotty/lib";
import { Range } from "@theia/languages/lib/browser";

export interface Ranged extends SModelExtension {
    range: string
}

export function isRanged<T extends SModelElement>(element: T): element is Ranged & T {
   return (element as any).range !== undefined
}

export function toLsRange(rangeString: string): Range {
    const numbers = rangeString.split(/[:-]/).map(s => parseInt(s, 10));
    return  <Range>{
        start: {
            line: numbers[0],
            character: numbers[1]
        },
        end: {
            line: numbers[2],
            character: numbers[3]
        }
    };
}