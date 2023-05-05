use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hash(data: &[u8]) -> Vec<u8> {
    blake3::hash(data).as_bytes().to_vec()
}

#[wasm_bindgen]
pub fn hash_unsafe(input_offset: *mut u8, input_length: usize) -> Vec<u8> {
    let input = unsafe {
        std::slice::from_raw_parts(input_offset, input_length )
    };
    blake3::hash(input).as_bytes().to_vec()
}

#[wasm_bindgen]
pub fn alloc(len: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    return ptr;
}