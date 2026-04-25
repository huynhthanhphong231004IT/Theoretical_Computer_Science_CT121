# Họ và tên: Huỳnh Thanh Phong
# MSSV: B2207555
# STT: 10
# HP Tin học Lý thuyết HKI 2526
# Bài thực hành buổi 2

# Câu 01
from itertools import islice
import random
def Cau01a():
    try:
        f = open('./Lab02.txt','r')
        print(f.read())
    except Exception as e:
        print(e)
    finally:    
        f.close()
        print("File closed!")
def Cau01b():
    f = open('./Lab02.txt','r')
    print(f.readlines())
    f.close()
    print("File closed!")
def Cau01c():
    f = open('./Lab02.txt','r')
    L =f.readlines()
    print(L[1])
    f.close()
def Cau01d():
    f = open('./Lab02.txt','r')
    print(f.readline())
    f.close()
    print("File closed!")

def Cau01e():
    f = open('./Lab02.txt','r')
    lines = f.readlines()[1:]
    print(lines)
    f.close()
def Cau01f():
    f = open('./Lab02.txt','r')
    L =f.readlines()
    f.close()
    print(L)
    for i in range(len(L)):
        line = list(islice(L[i],len(L[i])))
        print(line)


# Câu 02
class DFA(object):
    def __init__(self, states, alphabet, transition_function, start_state, accept_states):
        self.states = states
        self.alphabet = alphabet
        self.transition_function = transition_function
        self.start_state = start_state
        self.accept_states = accept_states
        self.current_state = start_state

    def transition_to_state_with_input(self, input_value):
        old_state = self.current_state
        if (self.current_state, input_value) not in self.transition_function:
            self.current_state = None
            print(f"Biểu tượng {input_value} không hợp lệ từ trạng thái {old_state}")
            return
        self.current_state = self.transition_function[(self.current_state, input_value)]
        print(f"Trạng thái trước: {old_state}, ký tự nhập: '{input_value}' -> trạng thái sau: {self.current_state}")

    def in_accept_state(self):
        return self.current_state in self.accept_states

    def go_to_initial_state(self):
        self.current_state = self.start_state

    def run_with_input_list(self, input_list):
        self.go_to_initial_state()
        for inp in input_list:
            self.transition_to_state_with_input(inp)
        return self.in_accept_state()
    

# Câu 03:
class NFA(object):
    def __init__(self, states, alphabet, transition_function, start_state, accept_states):
        self.states = states
        self.alphabet = alphabet
        self.transition_function = transition_function
        self.start_state = start_state
        self.accept_states = accept_states
        self.current_states = {start_state} 

    def transition_to_state_with_input(self, input_value):
        new_states = set()
        for state in self.current_states:
            next_states = self.transition_function.get((state, input_value), set())
            if not next_states:
                print(f"Trạng thái {state} + ký tự '{input_value}' không hợp lệ")
            for ns in next_states:
                print(f"Trạng thái trước: {state}, ký tự: '{input_value}' -> trạng thái sau: {ns}")
            new_states.update(next_states)
        self.current_states = new_states

    def in_accept_state(self):
        return any(state in self.accept_states for state in self.current_states)

    def go_to_initial_state(self):
        self.current_states = {self.start_state}

    def run_with_input_list(self, input_list):
        self.go_to_initial_state()
        for inp in input_list:
            self.transition_to_state_with_input(inp)
        return self.in_accept_state()
    
from typing import List
import itertools
# Bài tập 1 nâng cao
def hai_danh_sach_giong_nhau(danh_sach_a: List[str], danh_sach_b: List[str]) -> bool:
    if sum(len(x) for x in danh_sach_a) != sum(len(x) for x in danh_sach_b):
        return False
    ket_qua_a = set()
    for hoan_vi in itertools.permutations(danh_sach_a):
        ket_qua_a.add("".join(hoan_vi))
    for hoan_vi in itertools.permutations(danh_sach_b):
        if "".join(hoan_vi) in ket_qua_a:
            return True
    return False

# Bai tập 2 nâng cao
def doan_gen_hop_le(chuoi: str) -> bool:
    doan = chuoi.upper()
    if len(doan) < 9:
        return False
    if len(doan) % 3 != 0:
        return False
    if not doan.startswith("ATG"):
        return False
    if not (doan.endswith("TAA") or doan.endswith("TAG") or doan.endswith("TGA")):
        return False
    return True

if __name__ == "__main__":
    print("Câu 1a: ----------------------------------\n")
    Cau01a()
    print("Câu 1b: ----------------------------------\n")
    Cau01b()
    print("Câu 1c: ----------------------------------\n")
    Cau01c()
    print("Câu 1d: ----------------------------------\n")
    Cau01d()
    print("Câu 1e: ----------------------------------\n")
    Cau01e()
    print("Câu 1f: ----------------------------------\n")
    Cau01f()

    print("Câu 2 DFA: ----------------------------------\n")
    with open("./Lab02.txt", "r") as f:
        content = f.read()
    local_vars = {}
    exec(content, {}, local_vars)
    print("Nội dung file sau khi đọc:")
    print(local_vars)

    states  = local_vars['states']
    alphabet = local_vars['alphabet']
    tf = local_vars['tf']
    start_state = local_vars['start_state']
    accept_states = local_vars['accept_states']
    W = local_vars['W']
    dfa = DFA(states, alphabet, tf, start_state, accept_states)
    for w in W:
        print("Chuỗi nhập:", ''.join(w))
        if dfa.run_with_input_list(w):
            print("Chuỗi được chấp nhận!")
        else:
            print("Chuỗi không được chấp nhận!")
        print("-" * 60)

    print("Câu 3 NFA: ----------------------------------\n")
    states = {0, 1, 2}
    alphabet = {'0', '1'}
    tf = {
        (0, '0'): {0},
        (0, '1'): {1},
        (1, '0'): {2},
        (1, '1'): {0},
        (2, '0'): {1},
        (2, '1'): {2},
    }
    start_state = 0
    accept_states = {0}
    W = ["".join(random.choice(['0', '1']) for _ in range(15))]
    nfa = NFA(states, alphabet, tf, start_state, accept_states)
    for w in W:
        print("\nChuỗi nhập:", ''.join(w))
        if nfa.run_with_input_list(w):
            print("Chuỗi được chấp nhận!")
        else:
            print("Chuỗi không được chấp nhận!")
        print("-"*60)
    print("Bài thực hành buổi 01 nâng cao:")
    a = ["110", "0011", "0110"]
    b = ["110110", "00", "110"]
    print("Nâng cao 1:", hai_danh_sach_giong_nhau(a, b))
    print("-"*60)
    print("Nâng cao 2 (ATGCFNCCTAG):", doan_gen_hop_le("ATGCFNCCTAG"))
    print("Nâng cao 2 (ATGCGTTGA):", doan_gen_hop_le("ATGCGTTGA"))


