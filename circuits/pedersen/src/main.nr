use dep::std;

fn main(data: [Field;3]) {
    let ret = std::hash::pedersen_hash(data);
    std::println(ret);
}

#[test]
fn test_main() {
    let data: [Field; 3] = [1, 2, 3]; 
    main(data);
}