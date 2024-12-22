export function* halton(base: number) : Generator<number> {
        let n = 0;
        let d = 1;
        while (true) {
                let x = d - n;
                if (x == 1) {
                        n = 1;
                        d *= base;
                } else {
                        let y = Math.floor(d / base);
                        while (x <= y) {
                                y = Math.floor(y/base);
                        }
                        n = (base + 1) * y - x;
                }
                yield n / d;
        }
}
