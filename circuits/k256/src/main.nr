use dep::std;

fn main(
    owner_address: pub Field,
    owner_hash: pub Field,
    salt: pub [u8;32], 
    commitment_hash: pub [u8;32]
) {
    let copmputed_innter_owner_hash = std::hash::pedersen_hash([owner_address]);
    std::println(copmputed_innter_owner_hash);

    // todo: rename input to inner_owner_hash_with_salt
    let mut input: [Field; 33] = [0; 33];
    input[0] = copmputed_innter_owner_hash;
    for i in 0..32 {
        input[i + 1] = salt[i] as Field;    
    }

    let copmputed_owner_hash = std::hash::pedersen_hash(input);
    std::println(copmputed_owner_hash);
    assert(copmputed_owner_hash == owner_hash);
}

#[test]
fn test_main() {
    let owner_address: Field = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // owner_address == "test"
    let owner_hash: Field = 0x1701ab64077e0b7cd524be455316457954d1bdf8297e8e2fb832a02f168dddc0;
    
    // salt = chain id for test
    let salt: [u8;32] = [
        243, 159, 214, 229,  26, 173, 136, 246,
        244, 206, 106, 184, 130, 114, 121, 207,
        255, 185,  34, 102,   0,   0, 122, 105,
        0,   0,   0,   0,   0,   0,   0,   0
    ]; 

    let commitment_hash: [u8;32] = [
        135, 197,  57, 225, 58, 211, 248,  26,
        224,  27, 100,  27, 55, 170,  29, 241,
        169, 191,  63, 118, 94,   8, 209, 198,
        157, 254, 249,  95, 78,  14,  34,  39
    ];
    
    main(owner_address, owner_hash, salt, commitment_hash);

    // copmputed_owner_hash: 
}