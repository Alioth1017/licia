/* Simplified redux like state container.
 *
 * ### constructor
 *
 * |Name        |Desc                       |
 * |------------|---------------------------|
 * |reducer     |Function returns next state|
 * |initialState|Initial state              |
 *
 * ### subscribe
 *
 * Add a change listener.
 *
 * |Name    |Desc                                |
 * |--------|------------------------------------|
 * |listener|Callback to invoke on every dispatch|
 * |return  |Function to unsubscribe             |
 *
 * ### dispatch
 *
 * Dispatch an action.
 *
 * |Name  |Desc                       |
 * |------|---------------------------|
 * |action|Object representing changes|
 * |return|Same action object         |
 *
 * ### getState
 *
 * Get the current state.
 */

/* example
 * const store = new ReduceStore(function (state, action) {
 *     switch (action.type) {
 *         case 'INCREMENT': return state + 1;
 *         case 'DECREMENT': return state - 1;
 *         default: return state;
 *     }
 * }, 0);
 *
 * store.subscribe(function () {
 *     console.log(store.getState());
 * });
 *
 * store.dispatch({type: 'INCREMENT'}); // 1
 * store.dispatch({type: 'INCREMENT'}); // 2
 * store.dispatch({type: 'DECREMENT'}); // 1
 */

/* module
 * env: all
 * test: all
 */

/* typescript
 * export declare class ReduceStore {
 *     constructor(reducer: Function, initialState: any);
 *     subscribe(listener: Function): Function;
 *     dispatch(action: any): any;
 *     getState(): any;
 * }
 */

_('Class clone remove');

exports = Class({
    initialize: function ReduceStore(reducer, initialState) {
        this._reducer = reducer;
        this._state = initialState;
        this._curListeners = [];
        this._nextListeners = this._curListeners;
    },
    subscribe(listener) {
        let isSubscribed = true;

        this._ensureCanMutateNextListeners();
        this._nextListeners.push(listener);

        const self = this;

        return function() {
            if (!isSubscribed) return;

            isSubscribed = false;

            self._ensureCanMutateNextListeners();

            remove(self._nextListeners, function(val) {
                return val === listener;
            });
        };
    },
    dispatch(action) {
        this._state = this._reducer(this._state, action);

        const listeners = (this._curListeners = this._nextListeners);

        for (let i = 0, len = listeners.length; i < len; i++) listeners[i]();

        return action;
    },
    getState() {
        return this._state;
    },
    _ensureCanMutateNextListeners() {
        if (this._nextListeners === this._curListeners) {
            this._nextListeners = clone(this._curListeners);
        }
    }
});
