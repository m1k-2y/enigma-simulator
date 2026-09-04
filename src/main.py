from src.core import step_rotors
from src.core import right_rotor
from src.core import middle_rotor
from src.core import left_rotor
from src.core import reflect
from src.core import left_reverse
from src.core import middle_reverse
from src.core import right_reverse
from src.core import plugboard
from src.core import reset

def encrypt(sentence, rotor_set, ring_set, window_set, reflector_id, board_set):
    reset()
    out = []
    for key in sentence:
        step_rotors(rotor_set, window_set)
        key = plugboard(key, board_set)
        key = right_rotor(key, int(rotor_set[2]), ring_set[2], window_set[2])
        key = middle_rotor(key, int(rotor_set[1]), ring_set[1], window_set[1])
        key = left_rotor(key, int(rotor_set[0]), ring_set[0], window_set[0])
        key = reflect(key, reflector_id)
        key = left_reverse(key, int(rotor_set[0]), ring_set[0], window_set[0])
        key = middle_reverse(key, int(rotor_set[1]), ring_set[1], window_set[1])
        key = right_reverse(key, int(rotor_set[2]), ring_set[2], window_set[2])
        key = plugboard(key, board_set)
        out.append(key)
    return "".join(out)


def main():
    sentence = input("Input sentenc: ").upper().replace(" ", "")
    rotor_set = input("Input rotor id: ").split()
    ring_set = input("Input ring set: ").split()
    window_set = input("Input window_set: ").split()
    reflector_id = input("Input reflector id: ")
    board_set = [tuple(p) for p in input("Board set: ").split()]

    print(encrypt(sentence, rotor_set, ring_set, window_set, reflector_id, board_set))


if __name__ == "__main__":
    main()