let wasmModule = await await WebAssembly.instantiateStreaming(fetch('./build/untouched.wasm'), {
	env: {
		hariom: ()=>{
			console.log('HARIOM')
		}
	}
});
export default wasmModule.instance.exports;