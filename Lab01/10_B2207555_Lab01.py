# Họ và tên: Huỳnh Thanh Phong
# MSSV: B2207555
# STT: 10
# Học phần: Tin học lý thuyết HKI - 2526

from typing import Dict, List, Optional
import itertools

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
    print("Bài 1:", hoan_doi_2_ky_tu_dau("abc", "efg"))
    print("-"*60)
    print("Bài 2:", loai_bo_ky_tu_chan("python"))
    print("-"*60)
    print("Bài 3:", dem_tu("no pain no gain"))
    print("-"*60)
    print("Bài 4:", ma_hoa_dich_trai_3("def"))
    print("-"*60)
    bo = set("012")
    print("Bài 5:", chuoi_hop_le("0011", bo))
    print("-"*60)
    print("Bài 6:", chuoi_thanh_danh_sach("This is a list"))
    print("-"*60)
    print("Bài 7:", ky_tu_khong_lap_dau_tien("abcabcdef"))
    print("-"*60)
    print("Bài 8:", xoa_khoang_trang("a b c"))
    print("-"*60)
    print("Bài 9:", tu_lap_dau_tien("ab ca bc ca ab bc"))
    print("-"*60)
    print("Bài 10:", do_dai_0_lien_tiep_lon_nhat("1110001110000"))
    print("-"*60)
    a = ["110", "0011", "0110"]
    b = ["110110", "00", "110"]
    print("Nâng cao 1:", hai_danh_sach_giong_nhau(a, b))
    print("-"*60)
    print("Nâng cao 2 (ATGCFNCCTAG):", doan_gen_hop_le("ATGCFNCCTAG"))
    print("Nâng cao 2 (ATGCGTTGA):", doan_gen_hop_le("ATGCGTTGA"))

if __name__ == "__main__":
    chay_thu()
