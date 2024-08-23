use dep::std;
use dep::ecrecover;

fn main(
    owner_hash: pub Field,
    hashed_message: pub [u8; 32],
    pub_key: [u8; 64], 
    signature: [u8; 64], 
) {
    let key = ecrecover::secp256k1::PubKey::from_unified(pub_key);

    let recovered_addr = ecrecover::ecrecover(
        key.pub_x, 
        key.pub_y,
        signature,
        hashed_message
    );

    let computed_hash = std::hash::pedersen_hash([recovered_addr]);
    assert(computed_hash == owner_hash);
}

#[test]
fn test_main() {

  let hashed_message = [
  162,  11, 221, 82, 101,  38, 145, 153,
  143, 140, 164, 97, 148, 164,  55, 133,
   17,  93, 198, 63, 125, 169, 147,  53,
  229, 221,  91, 27,   2, 153, 104, 166
  ];

  // slice(1, 65)
  let pub_key = [
   30, 208, 241, 215, 103,  94, 254, 117,  70, 152,
   81, 205,  82, 148,   1, 169, 164,  67,  60,   5,  20,
  174, 250, 221, 242,  79,   1,  65, 210,  85, 102, 168,
  120, 138,  73, 199,  27, 230, 199, 139,  88,  30, 223,
  222, 101,  80, 215, 183, 206, 127,  56, 111,  54,  82,
   44, 173,  86,  64, 143, 202,   3, 123,  35,   7
  ];

  let owner_hash = 0x137ad2247d8e089ca5dc03f9a70e5bc68392ac2916495968a80c35582c1a3c37;

    
  let signature = [
   25,  83, 188,  15,  31, 138, 125,  61,  75, 210,  21,
  189, 152,   0,  92, 131, 218, 172,  94, 192, 193, 134,
  157, 109, 196, 152, 210, 247, 229, 218,  78, 217,  93,
  135, 208,  54, 203, 151, 127,  76, 197, 189,  92,   5,
  141, 185,  59, 102, 220, 138, 219, 235,  91, 108, 193,
  227,  61, 200,  57, 163, 137,  92,  36, 209
  ];

 main(owner_hash,hashed_message, pub_key, signature);
}