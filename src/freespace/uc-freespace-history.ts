/**
 * Undo / redo for one FreeSpace view during an edit session.
 *
 * Holds snapshots of the view's config (not the whole dashboard), so undoing
 * here never rolls back changes made on another view. Every config change is
 * recorded, including ones made through Home Assistant's own dialogs (card
 * edits, deletes, duplicates), as long as this view is on screen.
 */

export const HISTORY_LIMIT = 50;
/** Changes closer together than this merge into one step (held arrow keys). */
export const HISTORY_MERGE_MS = 600;

export class FreeSpaceHistory<T> {
  private _past: T[] = [];
  private _future: T[] = [];
  private _lastPushAt = 0;

  constructor(
    private readonly _limit = HISTORY_LIMIT,
    private readonly _mergeMs = HISTORY_MERGE_MS,
    private readonly _now: () => number = () => Date.now()
  ) {}

  get canUndo(): boolean {
    return this._past.length > 0;
  }

  get canRedo(): boolean {
    return this._future.length > 0;
  }

  /** Record the state from before a change. Clears the redo stack. */
  record(previous: T): void {
    const now = this._now();
    const merge = this._past.length > 0 && now - this._lastPushAt < this._mergeMs;
    this._lastPushAt = now;
    this._future = [];
    if (merge) return;
    this._past.push(previous);
    if (this._past.length > this._limit) this._past.shift();
  }

  /** Step back: returns the state to restore, given the current one. */
  undo(current: T): T | undefined {
    const prev = this._past.pop();
    if (prev === undefined) return undefined;
    this._future.push(current);
    this._lastPushAt = 0;
    return prev;
  }

  /** Step forward again after an undo. */
  redo(current: T): T | undefined {
    const next = this._future.pop();
    if (next === undefined) return undefined;
    this._past.push(current);
    this._lastPushAt = 0;
    return next;
  }

  clear(): void {
    this._past = [];
    this._future = [];
    this._lastPushAt = 0;
  }
}
