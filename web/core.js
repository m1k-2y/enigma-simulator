const ROTOR = {
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
};

const NOTCH = {
    1: 'Q',
    2: 'E',
    3: 'V',
    4: 'J',
    5: 'Z',
};

const UKW = {
    'B': ['Y','R','U','H','Q','S','L','D','P','X','N','G','O',
          'K','M','I','E','B','F','Z','C','W','V','J','A','T'],
    'C': ['F','V','P','J','I','A','O','Y','E','D','R','Z','X',
          'W','G','C','T','K','U','Q','S','B','N','M','H','L'],
};

const POS = [0, 0, 0];

function mod26(n) {
    return ((n % 26) + 26) % 26;
}

function ord(c) {
    return c.charCodeAt(0);
}

function chr(n) {
    return String.fromCharCode(n);
}

function step_rotors(rotor_ids, window_positions) {
    const notch = [NOTCH[parseInt(rotor_ids[1], 10)], NOTCH[parseInt(rotor_ids[2], 10)]];

    const right_state = chr(mod26(ord(window_positions[2]) - 65 + POS[2]) + 65);
    const middle_state = chr(mod26(ord(window_positions[1]) - 65 + POS[1]) + 65);

    const state = [middle_state, right_state];

    if (state[1] === notch[1]) {
        POS[2] += 1;
        if (state[0] === notch[0]) {
            POS[1] += 1;
            POS[0] += 1;
        } else {
            POS[1] += 1;
        }
    } else {
        POS[2] += 1;
        if (state[0] === notch[0]) {
            POS[1] += 1;
            POS[0] += 1;
        }
    }

    for (let i = 0; i < 3; i++) {
        POS[i] = mod26(POS[i]);
    }
}

function right_rotor(key, rotor_id, ring_set, window_position) {
    const rotor = ROTOR[rotor_id];

    let key_num = ord(key) - 65;
    const ring_set_num = ord(ring_set) - 65;
    const window_num = ord(window_position) - 65;

    key_num = mod26(key_num + window_num + POS[2] - ring_set_num);

    let new_key_num = ord(rotor[key_num]) - 65;

    new_key_num = mod26(new_key_num - window_num - POS[2] + ring_set_num);

    const new_key = chr(new_key_num + 65);

    return new_key;
}

function middle_rotor(key, rotor_id, ring_set, window_position) {
    const rotor = ROTOR[rotor_id];

    let key_num = ord(key) - 65;
    const ring_set_num = ord(ring_set) - 65;
    const window_num = ord(window_position) - 65;

    key_num = mod26(key_num + window_num + POS[1] - ring_set_num);

    let new_key_num = ord(rotor[key_num]) - 65;

    new_key_num = mod26(new_key_num - window_num - POS[1] + ring_set_num);

    const new_key = chr(new_key_num + 65);

    return new_key;
}

function left_rotor(key, rotor_id, ring_set, window_position) {
    const rotor = ROTOR[rotor_id];

    let key_num = ord(key) - 65;
    const ring_set_num = ord(ring_set) - 65;
    const window_num = ord(window_position) - 65;

    key_num = mod26(key_num + window_num + POS[0] - ring_set_num);

    let new_key_num = ord(rotor[key_num]) - 65;

    new_key_num = mod26(new_key_num - window_num - POS[0] + ring_set_num);

    const new_key = chr(new_key_num + 65);

    return new_key;
}

function reflect(key, reflector_id) {
    const reflector = UKW[reflector_id];

    const new_key = reflector[ord(key) - 65];

    return new_key;
}

function left_reverse(key, rotor_id, ring_set, window_position) {
    const rotor = ROTOR[rotor_id];

    let key_num = ord(key) - 65;
    const ring_set_num = ord(ring_set) - 65;
    const window_num = ord(window_position) - 65;

    key_num = mod26(key_num + window_num + POS[0] - ring_set_num);

    let new_key = chr(key_num + 65);

    let new_key_num;
    for (let i = 0; i < 26; i++) {
        if (rotor[i] === new_key) {
            new_key_num = i;
        }
    }

    new_key_num = mod26(new_key_num - window_num - POS[0] + ring_set_num);

    new_key = chr(new_key_num + 65);

    return new_key;
}

function middle_reverse(key, rotor_id, ring_set, window_position) {
    const rotor = ROTOR[rotor_id];

    let key_num = ord(key) - 65;
    const ring_set_num = ord(ring_set) - 65;
    const window_num = ord(window_position) - 65;

    key_num = mod26(key_num + window_num + POS[1] - ring_set_num);

    let new_key = chr(key_num + 65);

    let new_key_num;
    for (let i = 0; i < 26; i++) {
        if (rotor[i] === new_key) {
            new_key_num = i;
        }
    }

    new_key_num = mod26(new_key_num - window_num - POS[1] + ring_set_num);

    new_key = chr(new_key_num + 65);

    return new_key;
}

function right_reverse(key, rotor_id, ring_set, window_position) {
    const rotor = ROTOR[rotor_id];

    let key_num = ord(key) - 65;
    const ring_set_num = ord(ring_set) - 65;
    const window_num = ord(window_position) - 65;

    key_num = mod26(key_num + window_num + POS[2] - ring_set_num);

    let new_key = chr(key_num + 65);

    let new_key_num;
    for (let i = 0; i < 26; i++) {
        if (rotor[i] === new_key) {
            new_key_num = i;
        }
    }

    new_key_num = mod26(new_key_num - window_num - POS[2] + ring_set_num);

    new_key = chr(new_key_num + 65);

    return new_key;
}

function plugboard(key, board_set) {
    if (board_set.length === 0) {
        return key;
    }

    for (let i = 0; i < board_set.length; i++) {
        if (board_set[i].includes(key)) {
            if (key === board_set[i][0]) {
                return board_set[i][1];
            }

            return board_set[i][0];
        }
    }

    return key;
}

function reset() {
    POS[0] = POS[1] = POS[2] = 0;
}

function encrypt(sentence, rotor_set, ring_set, window_set, reflector_id, board_set) {
    reset();
    const out = [];
    for (let key of sentence) {
        step_rotors(rotor_set, window_set);
        key = plugboard(key, board_set);
        key = right_rotor(key, parseInt(rotor_set[2], 10), ring_set[2], window_set[2]);
        key = middle_rotor(key, parseInt(rotor_set[1], 10), ring_set[1], window_set[1]);
        key = left_rotor(key, parseInt(rotor_set[0], 10), ring_set[0], window_set[0]);
        key = reflect(key, reflector_id);
        key = left_reverse(key, parseInt(rotor_set[0], 10), ring_set[0], window_set[0]);
        key = middle_reverse(key, parseInt(rotor_set[1], 10), ring_set[1], window_set[1]);
        key = right_reverse(key, parseInt(rotor_set[2], 10), ring_set[2], window_set[2]);
        key = plugboard(key, board_set);
        out.push(key);
    }
    return out.join("");
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { encrypt, reset, POS };
}
