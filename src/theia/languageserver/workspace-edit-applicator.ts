import * as lang from '@theia/languages/lib/browser';
import { injectable, inject } from 'inversify'
import URI from '@theia/core/lib/common/uri';
import { ProtocolToMonacoConverter } from 'monaco-languageclient';
import { EditorManager } from '@theia/editor/lib/browser';
import { MonacoEditor } from '@theia/monaco/lib/browser/monaco-editor';

export const IWorkspaceEditApplicator = Symbol('IWorkspaceEditApplicator');

export interface IWorkspaceEditApplicator {
    applyEdit(changes: lang.WorkspaceEdit): Promise<boolean>;
}

@injectable()
export class WorkspaceEditApplicator implements IWorkspaceEditApplicator {

    @inject(ProtocolToMonacoConverter)
    protected readonly p2m: ProtocolToMonacoConverter;

    @inject(EditorManager)
    protected readonly editorManager: EditorManager;

    async applyEdit(changes: lang.WorkspaceEdit): Promise<boolean> {
        const workspaceEdit = this.p2m.asWorkspaceEdit(changes);
        await this.applyBulkEdit(workspaceEdit);
        return true;
    }

    async applyBulkEdit(workspaceEdit: monaco.languages.WorkspaceEdit): monaco.Promise<monaco.editor.IBulkEditResult> {
        let totalEdits = 0;
        let totalFiles = 0;
        const uri2Edits = this.groupEdits(workspaceEdit);
        for (const uri of uri2Edits.keys()) {
            const editorWidget = await this.editorManager.open(new URI(uri), { mode: 'open' });
            const editor = MonacoEditor.get(editorWidget);
            if (editor) {
                const model = editor.document.textEditorModel;
                const currentSelections = editor.getControl().getSelections();
                const edits = uri2Edits.get(uri)!;
                const editOperations: monaco.editor.IIdentifiedSingleEditOperation[] = edits.map(edit => ({
                    identifier: undefined!,
                    forceMoveMarkers: false,
                    range: new monaco.Range(edit.range.startLineNumber, edit.range.startColumn, edit.range.endLineNumber, edit.range.endColumn),
                    text: edit.text
                }));
                // start a fresh operation
                model.pushStackElement();
                model.pushEditOperations(currentSelections, editOperations, (undoEdits: monaco.editor.IIdentifiedSingleEditOperation[]) => currentSelections);
                // push again to make this change an undoable operation
                model.pushStackElement();
                totalFiles += 1;
                totalEdits += editOperations.length;
            }
        }
        const ariaSummary = this.getAriaSummary(totalEdits, totalFiles);
        return { ariaSummary };
    }

    protected getAriaSummary(totalEdits: number, totalFiles: number): string {
        if (totalEdits === 0) {
            return 'Made no edits';
        }
        if (totalEdits > 1 && totalFiles > 1) {
            return `Made ${totalEdits} text edits in ${totalFiles} files`;
        }
        return `Made ${totalEdits} text edits in one file`;
    }

    protected groupEdits(workspaceEdit: monaco.languages.WorkspaceEdit): Map<string, monaco.languages.TextEdit[]> {
        const result = new Map<string, monaco.languages.TextEdit[]>();
        for (const edit of workspaceEdit.edits) {
            const resourceTextEdit = edit as monaco.languages.ResourceTextEdit;
            const uri = resourceTextEdit.resource.toString();
            const edits = result.get(uri) || [];
            edits.push(...resourceTextEdit.edits);
            result.set(uri, edits);
        }
        return result;
    }
}