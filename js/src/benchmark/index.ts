import B from "benchmark";
import crypto from "crypto";
/*  import { hash as hashBlake3Lib, createHash } from 'blake3'   */
// Add  "blake3": "^2.1.7" (?) to dev dependencies to test the blake3 lib

import init, { hash as bhash } from '../../../rust/pkg/blake3_bindgen.js'
const wasmFetch = async (input: any) => (await (await import("node:fs/promises")).readFile(input)) as any // TODO fix types.
globalThis.fetch = wasmFetch // wasm-pack build --target web generated load with 'fetch' but node fetch can not load wasm yet, so we need to do this
await init();

// Run with "node --loader ts-node/esm ./src/benchmark/index.ts"

// Generate samples so we don't do that during benchmark
const sample: {[size: number]: Uint8Array[]} = {};
const NO_SAMPLES = 1e3;
const sizes = [1e3, 1e4, 1e6]; // Run benchmark 3 times with 3 kb 
for (const size of sizes) {
	sample[size] = [];
	for (let i = 0; i < NO_SAMPLES; i++) {
		sample[size].push(crypto.randomBytes(size));
	}
}


const getSample = (size: number): Uint8Array => {
	return sample[size][Math.floor(Math.random() * NO_SAMPLES)];
};

const suite = new B.Suite("_");
for (const [i, size] of sizes.entries()) {

	suite.add("sha256, size: " + size / 1e3 + "kb", {
		defer: true,
		fn: (deferred: any) => {
		
			const rng = getSample(size);
			crypto.createHash("sha256").update(rng).digest()
			deferred.resolve();
			
		},
	}); 


/* 	suite.add("blake3 lib: " + size / 1e3 + "kb", {
		defer: true,
		fn: (deferred: any) => {
			{
				const rng = getSample(size);
				createHash().update(new Uint8Array([1,2,3])).digest()
				deferred.resolve();
			}
		},
	});  */

	 suite.add("hash wasm simple: " + size / 1e3 + "kb", {
		defer: true,
		fn: (deferred: any) => {
			
			const rng = getSample(size);
			bhash(rng)
			deferred.resolve();
			
		},
	}); 
}
suite
	.on("cycle", (event: any) => {
		console.log(String(event.target));
	})
	.run({ async: true });

 