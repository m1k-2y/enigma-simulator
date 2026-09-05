from src.main import encrypt

S  = (["1","2","3"], ["A","A","A"], ["A","A","A"], "B", [])
S2 = (["1","2","3"], ["A","A","A"], ["A","D","U"], "B", [])
P  = [("A","V"), ("B","S")]
S3 = (["1","2","3"], ["A","A","A"], ["A","A","A"], "B", P)

def test_standard_vector():
    assert encrypt("AAAAA", *S) == "BDZGO"

def test_custom_window_position():
    assert encrypt("AAAAA", *S2) == "EQIBM"

def test_encrypt_decrypt_round_trip():
    c = encrypt("HELLOWORLD", *S3)
    assert encrypt(c, *S3) == "HELLOWORLD"