ROTOR = {
    1: ['E','K','M','F','L','G','D','Q','V','Z','N','T','O',
        'W','Y','H','X','U','S','P','A','I','B','R','C','J'],
    2: ['A','J','D','K','S','I','R','U','X','B','L','H','W',
        'T','M','C','Q','G','Z','N','P','Y','F','V','O','E'],
    3: ['B','D','F','H','J','L','C','P','R','T','X','V','Z',
        'N','Y','E','I','W','G','A','K','M','U','S','Q','O'],
    4: ['E','S','O','V','P','Z','J','A','Y','Q','U','I','R',
        'H','X','L','N','F','T','G','K','D','C','M','W','B'],
    5: ['V','Z','B','R','G','I','T','Y','U','P','S','D','N',
        'H','L','X','A','W','M','J','Q','O','F','E','C','K'],
}

NOTCH = {
    1: 'Q',
    2: 'E',
    3: 'V',
    4: 'J',
    5: 'Z',
}

UKW = {
    'B': ['Y','R','U','H','Q','S','L','D','P','X','N','G','O',
          'K','M','I','E','B','F','Z','C','W','V','J','A','T'],
    'C': ['F','V','P','J','I','A','O','Y','E','D','R','Z','X',
          'W','G','C','T','K','U','Q','S','B','N','M','H','L'],
} 

POS = [0, 0, 0]

def step_rotors(
    rotor_ids: list[str],
    window_positions: list[str],
):

    notch = [NOTCH[int(rotor_ids[1])], NOTCH[int(rotor_ids[2])]]

    right_state = chr((ord(window_positions[2]) - 65 + POS[2]) % 26 + 65)
    middle_state = chr((ord(window_positions[1]) - 65 + POS[1]) % 26 + 65)

    state = [middle_state, right_state]

    if state[1] == notch[1]:
        POS[2] += 1
        if state[0] == notch[0]:
            POS[1] += 1
            POS[0] += 1

        else:
            POS[1] += 1

    else:
        POS[2] += 1
        if state[0] == notch[0]:
            POS[1] += 1
            POS[0] += 1

    for i in range(3):
        POS[i] = POS[i] % 26

def right_rotor(
    key: str,
    rotor_id: int,
    ring_set: str,
    window_position: str,
) -> str:

    rotor = ROTOR[rotor_id]

    key_num = ord(key) - 65
    ring_set_num = ord(ring_set) - 65
    window_num = ord(window_position) - 65

    key_num = (key_num + window_num + POS[2] - ring_set_num) % 26

    new_key_num = ord(rotor[key_num]) - 65

    new_key_num = (new_key_num - window_num - POS[2] + ring_set_num) % 26

    new_key = chr(new_key_num + 65)

    return new_key

def middle_rotor(
    key: str,
    rotor_id: int,
    ring_set: str,
    window_position: str,
) -> str:

    rotor = ROTOR[rotor_id]
    
    key_num = ord(key) - 65
    ring_set_num = ord(ring_set) - 65
    window_num = ord(window_position) - 65

    key_num = (key_num + window_num + POS[1] - ring_set_num) % 26

    new_key_num = ord(rotor[key_num]) - 65

    new_key_num = (new_key_num - window_num - POS[1] + ring_set_num) % 26

    new_key = chr(new_key_num + 65)

    return new_key

def left_rotor(
    key: str,
    rotor_id: int,
    ring_set: str,
    window_position: str,
) -> str:

    rotor = ROTOR[rotor_id]

    key_num = ord(key) - 65
    ring_set_num = ord(ring_set) - 65
    window_num = ord(window_position) - 65

    key_num = (key_num + window_num + POS[0] - ring_set_num) % 26

    new_key_num = ord(rotor[key_num]) - 65

    new_key_num = (new_key_num - window_num - POS[0] + ring_set_num) % 26

    new_key = chr(new_key_num + 65)

    return new_key

def reflect(
    key: str,
    reflector_id: str,
) -> str:

    reflector = UKW[reflector_id]

    new_key = reflector[ord(key) - 65]

    return new_key

def left_reverse(
    key: str,
    rotor_id: int,
    ring_set: str,
    window_position: str,
) -> str:

    rotor = ROTOR[rotor_id]
    
    key_num = ord(key) - 65
    ring_set_num = ord(ring_set) - 65
    window_num = ord(window_position) - 65

    key_num = (key_num + window_num + POS[0] - ring_set_num) % 26

    new_key = chr(key_num + 65)

    for i in range(26):
        if rotor[i] == new_key:
            new_key_num = i

    new_key_num = (new_key_num - window_num - POS[0] + ring_set_num) % 26
    
    new_key = chr(new_key_num + 65)
    
    return new_key

def middle_reverse(
    key: str,
    rotor_id: int,
    ring_set: str,
    window_position: str,
) -> str:

    rotor = ROTOR[rotor_id]
    
    key_num = ord(key) - 65
    ring_set_num = ord(ring_set) - 65
    window_num = ord(window_position) - 65

    key_num = (key_num + window_num + POS[1] - ring_set_num) % 26

    new_key = chr(key_num + 65)

    for i in range(26):
        if rotor[i] == new_key:
            new_key_num = i

    new_key_num = (new_key_num - window_num - POS[1] + ring_set_num) % 26
    
    new_key = chr(new_key_num + 65)
    
    return new_key

def right_reverse(
    key: str,
    rotor_id: int,
    ring_set: str,
    window_position: str,
) -> str:

    rotor = ROTOR[rotor_id]
    
    key_num = ord(key) - 65
    ring_set_num = ord(ring_set) - 65
    window_num = ord(window_position) - 65

    key_num = (key_num + window_num + POS[2] - ring_set_num) % 26

    new_key = chr(key_num + 65)

    for i in range(26):
        if rotor[i] == new_key:
            new_key_num = i

    new_key_num = (new_key_num - window_num - POS[2] + ring_set_num) % 26
    
    new_key = chr(new_key_num + 65)
    
    return new_key

def plugboard(
    key: str,
    board_set: list[tuple[str, str]],
) -> str:

    if len(board_set) == 0:
        return key

    for i in range(len(board_set)):
        if key in board_set[i]:
            if key == board_set[i][0]:
                return  board_set[i][1]

            return board_set[i][0]

    return key        

def reset():
    POS[0] = POS[1] = POS[2] = 0