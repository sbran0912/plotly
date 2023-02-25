// Version: 1.0 Stand Februar 2023

/** Interface Perlin
 * @typedef {Object} Perlin
 * @property {(x: number, y?: number, z?: number) => number} noise returns perlin noise value (between 0 and 1)
 * @property {(lod: number, falloff: number) => void} noiseDetail 
 * @property {(seed: number) => void} noiseSeed
*/

/** returns perlin object
 * @type {() => Perlin} */
export function perlinNoise() {
  const PERLIN_YWRAPB = 4;
  const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
  const PERLIN_ZWRAPB = 8;
  const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
  const PERLIN_SIZE = 4095;

  let perlin_octaves = 4; // default to medium smooth
  let perlin_amp_falloff = 0.5; // 50% reduction/octave

  /** @type {(i:number) => number} */
  const scaled_cosine = (i) => 0.5 * (1.0 - Math.cos(i * Math.PI));
  /** @type {number[]} */
  let perlin; // will be initialized lazily by noise() or noiseSeed()

  /** @method noise
   * @param  {Number} x   x-coordinate in noise space
   * @param  {Number} [y] y-coordinate in noise space
   * @param  {Number} [z] z-coordinate in noise space
   * @return {Number}     Perlin noise value (between 0 and 1) at specified coordinates */
  const noise = function (x, y = 0, z = 0) {
    if (perlin == null) {
      perlin = new Array(PERLIN_SIZE + 1);
      for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = Math.random();
      }
    }

    if (x < 0) {
      x = -x;
    }
    if (y < 0) {
      y = -y;
    }
    if (z < 0) {
      z = -z;
    }

    let xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;

    let r = 0;
    let ampl = 0.5;

    let n1, n2, n3;

    for (let o = 0; o < perlin_octaves; o++) {
      let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

      rxf = scaled_cosine(xf);
      ryf = scaled_cosine(yf);

      n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
      n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);

      of += PERLIN_ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
      n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);

      n1 += scaled_cosine(zf) * (n2 - n1);

      r += n1 * ampl;
      ampl *= perlin_amp_falloff;
      xi <<= 1;
      xf *= 2;
      yi <<= 1;
      yf *= 2;
      zi <<= 1;
      zf *= 2;

      if (xf >= 1.0) {
        xi++;
        xf--;
      }
      if (yf >= 1.0) {
        yi++;
        yf--;
      }
      if (zf >= 1.0) {
        zi++;
        zf--;
      }
    }
    return r;
  };

  /** @method noiseDetail
   * @param {Number} lod number of octaves to be used by the noise
   * @param {Number} falloff falloff factor for each octave */
  const noiseDetail = function (lod, falloff) {
    if (lod > 0) {
      perlin_octaves = lod;
    }
    if (falloff > 0) {
      perlin_amp_falloff = falloff;
    }
  };

  /** @method noiseSeed
   * @param {Number} seed   the seed value */
  const noiseSeed = function (seed) {
    // Linear Congruential Generator
    // Variant of a Lehman Generator
    const lcg = (() => {
      // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
      // m is basically chosen to be large (as it is the max period)
      // and for its relationships to a and c
      const m = 4294967296;
      // a - 1 should be divisible by m's prime factors
      const a = 1664525;
      // c and m should be co-prime
      const c = 1013904223;
      
      /** @type {number} */
      let seed;
      /** @type {number} */
      let z;
      return {
        /** @type {(val: number) => void} */
        setSeed(val) {
          // pick a random seed if val is undefined or null
          // the >>> 0 casts the seed to an unsigned 32-bit integer
          z = seed = (val == null ? Math.random() * m : val) >>> 0;
        },
        getSeed() {
          return seed;
        },
        rand() {
          // define the recurrence relationship
          z = (a * z + c) % m;
          // return a float in [0, 1)
          // if z = m then z / m = 0 therefore (z % m) / m < 1 always
          return z / m;
        }
      };
    })();

    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = lcg.rand();
    }
  };

  return {
    noise: noise,
    noiseDetail: noiseDetail,
    noiseSeed: noiseSeed
  };
}

/** randomgenerator between n1 and n2
 * @param {number} n1 
 * @param {number} n2 
 * @returns {number} */
export function random(n1, n2) {
  return Math.floor(Math.random() * (n2 - n1) + n1);
}

/** limits value between min and max
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number} */
export function constrain(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** scales value n to a new range
 * @param {number} n number to scale
 * @param {number} start1 old range
 * @param {number} stop1 old range
 * @param {number} start2 new range
 * @param {number} stop2 new range
 * @returns {number}
 */
export function map(n, start1, stop1, start2, stop2) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
}

/** Limits number 
 * @param {number} number 
 * @param {number} limit 
 * @returns {number} */
export function limitNum(number, limit) {
  const vorzeichen = number < 0 ? -1 : 1;
  let numberMag = Math.abs(number);
  if (numberMag > limit) {
    numberMag = limit;
  }
  return numberMag * vorzeichen;
}
/** array autofill 0 to len-1
 * @param {number} len length of array
 * @returns {number[]}
 */
export function range(len) {
  let arr = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = i;
  }
  return arr;
}
/** make shuffled copy of arr
 * @param {number[]} arr 
 * @returns {number[]}
 */
export function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length; i>0; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
  return a;
}

/** Fetching a CSV-File from Server
 * @param {string} file 
 */
export async function fetchCSV(file) {
	const response = await fetch(file);
	const data = await response.text();
	const rows = data.split('\n');
	let cols = new Array(rows.length);

	rows.forEach((row, i) => {
    cols[i] = row.split(',');

	});
	return cols;
}