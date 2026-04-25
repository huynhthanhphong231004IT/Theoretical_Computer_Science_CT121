import re
# Phần A

with open("./10.txt", "r", encoding="utf-8") as f:
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
html = open("./10.html", "r", encoding="utf-8").read()
print(re.findall(r'<head>(.*?)</head>', html, re.DOTALL))

# Phần B

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
