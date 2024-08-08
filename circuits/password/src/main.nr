use dep::std;

fn main(
    preimage: [Field;10],
    password_hash: pub Field,
    salt: pub [u8;32], 
    commitment_hash: pub [u8;32]
) {
    // let h = std::hash::keccak256(preimage, 10);
    let copmputed_innter_password_hash = std::hash::pedersen_hash(preimage);
    // std::println(copmputed_innter_password_hash);

    // todo: rename input to inner_password_hash_with_salt
    let mut input: [Field; 33] = [0; 33];
    input[0] = copmputed_innter_password_hash;
    for i in 0..32 {
        input[i + 1] = salt[i] as Field;    
    }

    let copmputed_password_hash = std::hash::pedersen_hash(input);
    // std::println(copmputed_password_hash);
    assert(copmputed_password_hash == password_hash);
}

#[test]
fn test_main() {
    // 
    let preimage: [Field; 10] = [116, 101, 115, 116, 0, 0, 0, 0, 0, 0]; // preimage == "test"
    let password_hash: Field = 0x032e60c0d43ea621d6f898a9596f7ca72cb6c127493094d691c032b66fa1f056;
    
    // salt = chain id for test
    let salt: [u8;32] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        // 0, 0, 0, 122, 105 // local
        0, 0, 170, 54, 167 // sepoliia
    ]; 

    let commitment_hash: [u8;32] = [
        135, 197,  57, 225, 58, 211, 248,  26,
        224,  27, 100,  27, 55, 170,  29, 241,
        169, 191,  63, 118, 94,   8, 209, 198,
        157, 254, 249,  95, 78,  14,  34,  39
    ];
    
    main(preimage, password_hash, salt, commitment_hash);

    // copmputed_password_hash: 
    // local: 0x16e1253d322e880f7431ece012507afb4638b74156c8bd99bb37d08a170d9887
    // sepolia: 0x032e60c0d43ea621d6f898a9596f7ca72cb6c127493094d691c032b66fa1f056
}