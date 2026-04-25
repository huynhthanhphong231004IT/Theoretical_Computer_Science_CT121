# Họ và tên: Huỳnh Thanh Phong
# MSSV: B2207555
# STT: 10
# Học phần: Tin học lý thuyết HKI - 2526

from typing import Dict, List, Optional
import itertools
from itertools import islice
import random
import re


class Lab01:
    # Câu 01
    def hoan_doi_2_ky_tu_dau(chuoi1: str, chuoi2: str) -> str:
        phan_dau1 = chuoi1[:2]
        phan_dau2 = chuoi2[:2]
        phan_du1 = chuoi1[2:]
        phan_du2 = chuoi2[2:]
        moi1 = phan_dau2 + phan_du1
        moi2 = phan_dau1 + phan_du2
        return moi1 + " " + moi2

    # Câu 02
    def loai_bo_ky_tu_chan(chuoi: str) -> str:
        return "".join([ch for i, ch in enumerate(chuoi) if i % 2 == 1])

    # Câu 03
    def dem_tu(cau: str) -> Dict[str, int]:
        tu = cau.split()
        dem: Dict[str, int] = {}
        for t in tu:
            dem[t] = dem.get(t, 0) + 1
        return dem
    # Câu 04
    def ma_hoa_dich_trai_3(chuoi: str) -> str:
        def dich_ky_tu(k: str) -> str:
            if 'a' <= k <= 'z':
                return chr((ord(k) - ord('a') - 3) % 26 + ord('a'))
            if 'A' <= k <= 'Z':
                return chr((ord(k) - ord('A') - 3) % 26 + ord('A'))
            return k
        return "".join(dich_ky_tu(ch) for ch in chuoi)

    # Câu 05
    def chuoi_hop_le(chuoi: str, bo_chu: set) -> bool:
        for k in chuoi:
            if k not in bo_chu:
                return False
        return True

    # Câu 06
    def chuoi_thanh_danh_sach(chuoi: str) -> List[str]:
        return chuoi.split()


    # Câu 07
    def ky_tu_khong_lap_dau_tien(chuoi: str) -> Optional[str]:
        tan_suat: Dict[str, int] = {}
        for k in chuoi:
            tan_suat[k] = tan_suat.get(k, 0) + 1
        for k in chuoi:
            if tan_suat[k] == 1:
                return k
        return None

    # Câu 08
    def xoa_khoang_trang(chuoi: str) -> str:
        return chuoi.replace(" ", "")

    # Câu 09
    def tu_lap_dau_tien(chuoi: str) -> Optional[str]:
        danh_sach_tu = chuoi.split()
        da_gap = set()
        for t in danh_sach_tu:
            if t in da_gap:
                return t
            da_gap.add(t)
        return None

    # Câu 10
    def do_dai_0_lien_tiep_lon_nhat(chuoi: str) -> int:
        dai_max = 0
        hien_tai = 0
        for k in chuoi:
            if k == '0':
                hien_tai += 1
                if hien_tai > dai_max:
                    dai_max = hien_tai
            else:
                hien_tai = 0
        return dai_max

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

    def chay_thu():
        print("-"*60)
        print("Bài 1:", Lab01.hoan_doi_2_ky_tu_dau("abc", "efg"))
        print("-"*60)
        print("Bài 2:", Lab01.loai_bo_ky_tu_chan("python"))
        print("-"*60)
        print("Bài 3:", Lab01.dem_tu("no pain no gain"))
        print("-"*60)
        print("Bài 4:", Lab01.ma_hoa_dich_trai_3("def"))
        print("-"*60)
        bo = set("012")
        print("Bài 5:", Lab01.chuoi_hop_le("0011", bo))
        print("-"*60)
        print("Bài 6:", Lab01.chuoi_thanh_danh_sach("This is a list"))
        print("-"*60)
        print("Bài 7:", Lab01.ky_tu_khong_lap_dau_tien("abcabcdef"))
        print("-"*60)
        print("Bài 8:", Lab01.xoa_khoang_trang("a b c"))
        print("-"*60)
        print("Bài 9:", Lab01.tu_lap_dau_tien("ab ca bc ca ab bc"))
        print("-"*60)
        print("Bài 10:", Lab01.do_dai_0_lien_tiep_lon_nhat("1110001110000"))
        print("-"*60)
        a = ["110", "0011", "0110"]
        b = ["110110", "00", "110"]
        print("Nâng cao 1:", Lab01.hai_danh_sach_giong_nhau(a, b))
        print("-"*60)
        print("Nâng cao 2 (ATGCFNCCTAG):", Lab01.doan_gen_hop_le("ATGCFNCCTAG"))
        print("Nâng cao 2 (ATGCGTTGA):", Lab01.doan_gen_hop_le("ATGCGTTGA"))
class Lab02:
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
    
class Lab03:
    # Phần A
    def PhanA():
        with open("../Lab03/10.txt", "r", encoding="utf-8") as f:
            dong = f.readlines()

        print("A1:")
        for d in dong:
            if re.match(r'^[th].*re', d):
                print(d.strip())

        print("A2:")
        for d in dong:
            if len(d.strip()) >= 20:
                print(d.strip())

        print("A3:")
        for d in dong:
            if re.search(r'\?\!$', d.strip()):
                print(d.strip())

        print("A4:")
        for d in dong:
            if re.search(r'[arsml]', d):
                print(d.strip())

        print("A5:")
        for d in dong:
            if not re.search(r'[.,]', d):
                print(d.strip())

        print("A6:")
        for d in dong:
            if re.search(r'mouse', d):
                print(d.strip())

        print("A7:")
        chuoi = " ".join(dong)
        print(re.findall(r'\ba*b\b', chuoi))

        print("A8:")
        print(re.findall(r'@([\w.-]+)', chuoi))

        print("A9:")
        html = open("../Lab03/10.html", "r", encoding="utf-8").read()
        print(re.findall(r'<head>(.*?)</head>', html, re.DOTALL))

    # Phần B

    def PhanB():
        def kiem_tra_cau(c):
            if not re.match(r'^[A-Z][a-z]', c): return False
            if not re.search(r'(\.|[A-Z])$', c): return False
            if re.search(r' {2,}', c): return False
            if re.search(r'[A-Z]{2}', c): return False
            return True

        cau = input("Nhập câu kiểm tra: ")
        if kiem_tra_cau(cau):
            print("Câu đúng cú pháp")
        else:
            print("Câu sai cú pháp")

    # PhầnC

    def PhanC():
        van_ban = input("Nhập chuỗi văn bản: ")

        print("C1:", re.findall(r'\b[a-z0-9]+\b', van_ban))
        print("C2:", re.findall(r'\ba+b*\b', van_ban))
        print("C3:", re.findall(r'\ba.b\b', van_ban))
        print("C4:", re.findall(r'\b[a-z_]+\b', van_ban))
        print("C5:", re.findall(r'\b\w{5}\b', van_ban))
        print("C6:", re.findall(r'\b\w*h\w*\b', van_ban))
        print("C7:", re.findall(r'\b[0-9]\w*\b', van_ban))
        print("C8:", re.sub(r'_', ' ', van_ban))

        def doi_dinh_dang(m):
            t = m.group(0).split("-")
            return f"{t[1]}-{t[0]}-{t[2]}"

        print("C9:", re.sub(r'\b\d{2}-\d{2}-\d{2}\b', doi_dinh_dang, van_ban))


class Lab04:
    def doc_van_pham(duong_dan):
        van_pham = {}
        with open(duong_dan, 'r', encoding='utf-8') as f:
            for dong in f:
                if '->' in dong:
                    trai, phai = dong.strip().split('->')
                    trai = trai.strip()
                    phai = [x.strip() for x in phai.split('|')]
                    if trai in van_pham:
                        van_pham[trai] += phai
                    else:
                        van_pham[trai] = phai
        return van_pham

    def kiem_tra_tuyen_tinh(van_pham):
        tuyen_trai = True
        tuyen_phai = True
        for trai, ds_phai in van_pham.items():
            for phai in ds_phai:
                if len(phai) > 2:
                    tuyen_trai = False
                    tuyen_phai = False
                elif len(phai) == 2:
                    if phai[0].isupper() and phai[1].islower():
                        tuyen_phai = False
                    elif phai[1].isupper() and phai[0].islower():
                        tuyen_trai = False
                    else:
                        tuyen_trai = False
                        tuyen_phai = False
        if tuyen_trai and not tuyen_phai:
            return "Văn phạm tuyến tính trái"
        elif tuyen_phai and not tuyen_trai:
            return "Văn phạm tuyến tính phải"
        elif tuyen_trai and tuyen_phai:
            return "Văn phạm tuyến tính trái và phải"
        else:
            return "Không phải văn phạm tuyến tính"

    def kiem_tra_chinh_quy(van_pham):
        for trai, ds_phai in van_pham.items():
            for phai in ds_phai:
                if len(phai) == 2:
                    if phai[0].isupper() and phai[1].isupper():
                        return False
        return True

    def sinh_regex(van_pham, bat_dau):
        ket_qua = {}
        for trai, ds_phai in van_pham.items():
            phien_bien = []
            for phai in ds_phai:
                phien_bien.append(''.join(['(' + ket_qua[x] + ')' if x.isupper() and x in ket_qua else x for x in phai]))
            ket_qua[trai] = '(' + '|'.join(phien_bien) + ')'
        return ket_qua[bat_dau]

    def kiem_tra_chuoi(van_pham, bat_dau, chuoi):
        regex = Lab04.sinh_regex(van_pham, bat_dau)
        return re.fullmatch(regex, chuoi) is not None
    def KQLab4():
        duong_dan = './10.txt'
        van_pham = Lab04.doc_van_pham(duong_dan)
        print(Lab04.kiem_tra_tuyen_tinh(van_pham))
        print("Văn phạm chính quy" if Lab04.kiem_tra_chinh_quy(van_pham) else "Không phải văn phạm chính quy")
        chuoi = input("Nhập chuỗi cần kiểm tra: ")
        if Lab04.kiem_tra_chuoi(van_pham, 'S', chuoi):
            print("Chuỗi thuộc văn phạm")
        else:
            print("Chuỗi không thuộc văn phạm")


class BaiTapTongHop:
    def buoi1():
        print("-"*30)
        print("Bài tập tổng hợp buổi 01")
        Lab01.chay_thu()
        print("-"*30)

    def buoi2_dfa():
        print("DFA: ----------------------------------\n")
        with open("../Lap02/Lab02.txt", "r") as f:
            content = f.read()
        local_vars = {}
        exec(content, {}, local_vars)

        states  = local_vars['states']
        alphabet = local_vars['alphabet']
        tf = local_vars['tf']
        start_state = local_vars['start_state']
        accept_states = local_vars['accept_states']
        W = local_vars['W']

        dfa = Lab02.DFA(states, alphabet, tf, start_state, accept_states)
        for w in W:
            print("Chuỗi nhập:", ''.join(w))
            if dfa.run_with_input_list(w):
                print("Chuỗi được chấp nhận!")
            else:
                print("Chuỗi không được chấp nhận!")
            print("-"*30)

    def buoi2_nfa():
        print("NFA: ----------------------------------\n")
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

        nfa = Lab02.NFA(states, alphabet, tf, start_state, accept_states)
        for w in W:
            print("Chuỗi nhập:", ''.join(w))
            if nfa.run_with_input_list(w):
                print("Chuỗi được chấp nhận!")
            else:
                print("Chuỗi không được chấp nhận!")
            print("-"*30)

    def buoi3():
        print("-"*30)
        print("Bài tập tổng hợp buổi 03")
        Lab03.PhanA()
        Lab03.PhanB()
        Lab03.PhanC()
        print("-"*30)

    def buoi4():
        print("-"*30)
        print("Bài tập tổng hợp buổi 04")
        Lab04.KQLab4()
        print("-"*30)

    def menu():
        while True:
            print("\n=== MENU BÀI TẬP TỔNG HỢP ===")
            print("1. Buổi 01")
            print("2. Buổi 02 - DFA")
            print("3. Buổi 02 - NFA")
            print("4. Buổi 03")
            print("5. Buổi 04")
            print("0. Thoát")
            chon = input("Chọn chức năng: ")
            if chon == '1':
                BaiTapTongHop.buoi1()
            elif chon == '2':
                BaiTapTongHop.buoi2_dfa()
            elif chon == '3':
                BaiTapTongHop.buoi2_nfa()
            elif chon == '4':
                BaiTapTongHop.buoi3()
            elif chon == '5':
                BaiTapTongHop.buoi4()
            elif chon == '0':
                print("Thoát chương trình.")
                break
            else:
                print("Lựa chọn không hợp lệ, thử lại.")

if __name__ == "__main__":
    BaiTapTongHop.menu()
