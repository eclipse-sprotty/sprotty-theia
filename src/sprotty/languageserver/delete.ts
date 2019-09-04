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

import { TextEdit, Workspace, WorkspaceEdit } from "@theia/languages/lib/browser";
import { Action, CommandExecutionContext, isSelectable, SEdge, Selectable, SModelElement, SChildElement, TYPES } from "sprotty";
import { AbstractWorkspaceEditCommand } from "./workspace-edit-command";
import { getRange, Traceable, isTraceable, getURI } from "./traceable";
import { Range } from "@theia/languages/lib/browser";
import { injectable, inject } from "inversify";

export class DeleteWithWorkspaceEditAction implements Action {
    static readonly KIND = 'deleteWithWorkspaceEdit';
    readonly kind = DeleteWithWorkspaceEditAction.KIND;

    // TODO: consider URIs from individual element traces
    constructor(readonly workspace: Workspace, readonly sourceUri: string) {}
}

@injectable()
export class DeleteWithWorkspaceEditCommand extends AbstractWorkspaceEditCommand {
    static readonly KIND = DeleteWithWorkspaceEditAction.KIND;

    constructor(@inject(TYPES.Action) readonly action: DeleteWithWorkspaceEditAction) {
        super();
    }

    createWorkspaceEdit(context: CommandExecutionContext): WorkspaceEdit {
        const elements = new Set<SModelElement & Traceable>();
        const index = context.root.index;
        index.all().forEach(e => {
            if (e && this.shouldDelete(e))
                elements.add(e);
            else if (e instanceof SEdge && isTraceable(e)) {
                const source = index.getById(e.sourceId);
                const target = index.getById(e.targetId);
                if (this.shouldDeleteParent(source)
                    || this.shouldDeleteParent(target))
                    elements.add(e);
            }
        });
        const uri2ranges: Map<string, Range[]> = new Map();
        elements.forEach(element => {
            const uri = getURI(element).withoutFragment().toString(true);
            const range = getRange(element);
            let ranges = uri2ranges.get(uri);
            if (!ranges) {
                ranges = [];
                uri2ranges.set(uri, ranges);
            }
            let mustAdd = true;
            for (let i = 0; i < ranges.length; ++i) {
                const r = ranges[i];
                if (this.containsRange(r, range)) {
                    mustAdd = false;
                    break;
                } else if (this.containsRange(range, r)) {
                    mustAdd = false;
                    ranges[i] = range;
                    break;
                }
            }
            if (mustAdd)
                ranges.push(range);
        });
        const changes = {};
        uri2ranges.forEach((ranges, uri) => {
            (changes as any)[uri] = ranges.map(range => {
                return <TextEdit> {
                    range,
                    newText: ''
                };
            });
        });
        const workspaceEdit: WorkspaceEdit = {
            changes
        };
        return workspaceEdit;
    }

    private containsRange(range: Range, otherRange: Range): boolean {
        if (otherRange.start.line < range.start.line || otherRange.end.line < range.start.line) {
            return false;
        }
        if (otherRange.start.line > range.end.line || otherRange.end.line > range.end.line) {
            return false;
        }
        if (otherRange.start.line === range.start.line && otherRange.start.character < range.start.character) {
            return false;
        }
        if (otherRange.end.line === range.end.line && otherRange.end.character > range.end.character) {
            return false;
        }
        return true;
    }

    private shouldDelete<T extends SModelElement>(e: T): e is (Traceable & Selectable & T) {
        return isSelectable(e) && e.selected && isTraceable(e);
    }

    private shouldDeleteParent(source: SModelElement | undefined): boolean {
        while (source) {
            if (this.shouldDelete(source)) {
                return true;
            }
            source = (source instanceof SChildElement) ? source.parent : undefined;
        }
        return false;
    }
}

