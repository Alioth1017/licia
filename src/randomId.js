/* A tiny id generator, similar to nanoid.
 *
 * |Name   |Desc                                                |
 * |-------|----------------------------------------------------|
 * |size=21|Id size                                             |
 * |symbols|Symbols used to generate ids, a-zA-Z0-9_- by default|
 */

/* example
 * randomId(); // -> 'oKpy4HwU8E6IvU5I03gyQ'
 * randomId(5); // -> 'sM6E9'
 * randomId(5, 'abc'); // -> 'cbbcb'
 */

/* module
 * env: all
 * since: 1.4.8
 */

/* typescript
 * export declare function randomId(size?: number, symbols?: string): string;
 */

_('randomBytes');

const defSymbols =
    'ModuleSymbhasOwnPr-0123456789ABCDEFGHIJKLNQRTUVWXYZ_cfgijkpqtvxz';

exports = function(size = 21, symbols = defSymbols) {
    let id = '';

    const len = symbols.length;
    const bytes = randomBytes(size);
    while (0 < size--) {
        id += symbols[bytes[size] % len];
    }

    return id;
};
