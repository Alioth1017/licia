/* Read cgroup metrics inside container.
 */

/* example
 * cgroup.cpu.stat();
 */

/* module
 * env: node
 * test: manual
 * since: 1.35.0
 */

/* typescript
 * export declare const cgroup: {
 *     cpu: {
 *         stat(): {
 *             usage: number;
 *         };
 *         max(): number;
 *     };
 *     cpuset: {
 *         cpus(): {
 *             effective: number[];
 *         };
 *     };
 *     memory: {
 *         max(): number;
 *         current(): number;
 *     };
 *     version(): number;
 * };
 */

_('memoize each trim toNum contain concat range startWith');

const fs = require('fs');

const cpu = {
    stat() {
        let usage = 0;

        if (isV2()) {
            // microseconds
            const data = parseKeyValue(read('cpu.stat'));
            usage = toNum(data['usage_usec']);
        } else {
            // nanoseconds
            usage = Math.round(toNum(read('cpuacct/cpuacct.usage')) / 1000);
        }

        return {
            usage
        };
    },
    max() {
        let max = Infinity;

        if (isV2()) {
            let data = read('cpu.max');
            if (!startWith(data, 'max')) {
                data = data.split(' ');
                const quota = toNum(data[0]);
                const period = toNum(data[1]);
                max = quota / period;
            }
        } else {
            const quota = toNum(read('cpu/cpu.cfs_quota_us'));
            if (quota !== -1) {
                const period = toNum(read('cpu/cpu.cfs_period_us'));
                max = quota / period;
            }
        }

        return max;
    }
};

const cpuset = {
    cpus() {
        let effective = [];
        let p = 'cpuset/cpuset.effective_cpus';

        if (isV2()) {
            p = 'cpuset.cpus.effective';
        }

        effective = parseRange(read(p));

        return {
            effective
        };
    }
};

const memory = {
    max() {
        let max = Infinity;

        if (isV2()) {
            let data = read('memory.max');
            if (data !== 'max') {
                max = toNum(data);
            }
        } else {
            max = toNum(read('memory/memory.limit_in_bytes'));
        }

        return max;
    },
    current() {
        let p = 'memory/memory.usage_in_bytes';
        if (isV2()) {
            p = 'memory.current';
        }

        return toNum(read(p));
    }
};

const isV2 = memoize(function() {
    return fs.existsSync(resolve('cgroup.controllers'));
});

function read(p) {
    return fs.readFileSync(resolve(p), 'utf8');
}

/* a 1
 * b 2
 */
function parseKeyValue(data) {
    const ret = {};

    each(data.split('\n'), line => {
        line = trim(line);
        if (line) {
            line = line.split(' ');
            ret[line[0]] = line[1];
        }
    });

    return ret;
}

/* 1-2,4-5 */
function parseRange(data) {
    let ret = [];

    each(data.split(','), r => {
        if (!contain(r, '-')) {
            ret.push(toNum(r));
        } else {
            r = r.split('-');
            ret = concat(ret, range(toNum(r[0]), toNum(r[1]) + 1));
        }
    });

    return ret;
}

function resolve(p) {
    return `/sys/fs/cgroup/${p}`;
}

exports = {
    cpu,
    cpuset,
    memory,
    version() {
        return isV2() ? 2 : 1;
    }
};
