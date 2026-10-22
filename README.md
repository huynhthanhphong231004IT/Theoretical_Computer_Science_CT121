<div align="center">

# Website tương tác giải bài tập Automata

**CT121 – Tin học lý thuyết - Trường CNTT&TT, Đại học Cần Thơ - HKI 2025–2026**

Sinh viên thực hiện: Huỳnh Thanh Phong (MSSV: B2207555 - Số thứ tự nhóm 10)  
Giáo viên hướng dẫn: ThS. Phạm Xuân Hiền

**Facbook**: https://www.facebook.com/huynh.thanh.phong.561667 

**Tiktok**: https://www.tiktok.com/@reorioll

**Youtobe**: https://www.youtube.com/@ReoRioll-2304CICTCTU

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-1766a6?style=for-the-badge)](https://huynhthanhphong231004it.github.io/Theoretical_Computer_Science_CT121/10_B2207555/Web/)
[![Báo cáo](https://img.shields.io/badge/Báo%20cáo-PDF-e74c3c?style=for-the-badge)](10_B2207555/THLT_Bao_Cao_final.pdf)

</div>

---

## 1. Tóm tắt

> Ôtômát hữu hạn (DFA, NFA, NFA-ε) là nền tảng của ngôn ngữ hình thức và trình biên dịch, nhưng người học thường chỉ tiếp cận chúng qua hình vẽ tĩnh trên bảng và phép biến đổi làm tay, nơi một sai sót nhỏ trong tập trạng thái cũng làm hỏng toàn bộ lời giải. Đồ án xây dựng một website tương tác cho phép nhập ôtômát, chạy từng bước một chuỗi đầu vào trên đồ thị trạng thái, và thực hiện tự động các phép chuyển đổi *NFA → DFA*, *NFA-ε → NFA* và *NFA-ε → DFA*, qua đó người học đối chiếu lời giải của mình với kết quả của thuật toán ngay lập tức. Kho lưu trữ này gồm sản phẩm web, báo cáo đồ án và bốn bài thực hành Python làm nền cho phần cài đặt.

**Từ khóa:** DFA · NFA · NFA-ε · subset construction · ε-closure · trực quan hóa thuật toán

```mermaid
flowchart LR
    %% Định nghĩa phong cách màu sắc chuẩn Academic (Nhiều màu, chuyên nghiệp)
    classDef input fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#0D47A1,font-weight:bold;
    classDef decision fill:#FFF3E0,stroke:#EF6C00,stroke-width:1.5px,color:#E65100,font-weight:bold;
    classDef process1 fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20;
    classDef process2 fill:#F3E5F5,stroke:#7B1FA2,stroke-width:1.5px,color:#4A148C;
    classDef graphNode fill:#E0F7FA,stroke:#00838F,stroke-width:1.5px,color:#006064;
    classDef output fill:#FFEBEE,stroke:#C62828,stroke-width:1.5px,color:#B71C1C;

    %% Các nút trong sơ đồ (đã ngắt dòng chủ động)
    A["Nhập ôtômát<br/>form hoặc file .txt"]:::input
    
    B{"Chức năng"}:::decision
    
    C["Kiểm tra chuỗi<br/>từng bước chuyển"]:::process1
    D["Chuyển đổi<br/>NFA-ε → NFA → DFA"]:::process2
    
    E["Đồ thị trạng thái<br/>vis-network"]:::graphNode
    
    F["Đối chiếu với<br/>bài giải tay"]:::output

    %% Luồng liên kết dữ liệu
    A --> B
    
    B -->|Kiểm tra| C
    B -->|Chuyển đổi| D
    
    C --> E
    D --> E
    
    E --> F
```

## 1. Tổng quan 
| Thư mục / tệp | Nội dung | Vai trò |
|---|---|---|
| `10_B2207555/Web/` | Website (HTML, CSS, JS thuần + vis-network) | Sản phẩm chính |
| `10_B2207555/THLT_Latex/` | Mã nguồn LaTeX và hình của báo cáo | Tài liệu |
| `Lab01` – `Lab04`, `Lap02` | Thực hành Python: chuỗi, DFA/NFA, regex, văn phạm | Nền tảng cài đặt |
| `BaoCaoTHLT.pdf`, `BaoCaoProject.pdf` | Báo cáo môn học và đồ án | Tài liệu |
| `Tài liệu ôn.pdf`, `BÀI TẬP TIN HỌC LÝ THUYẾT.docx` | Tài liệu ôn tập và bài tập | Tham khảo |

---

## 2. Lý thuyết ứng dụng

Ba mô hình DFA, NFA và NFA-ε có sức mạnh nhận dạng như nhau: cả ba đều chấp nhận đúng lớp ngôn ngữ chính quy. Sự khác biệt nằm ở hàm chuyển, nên cũng nằm ở độ khó khi người học phải hình dung chúng. Với DFA, mỗi cặp (trạng thái, ký tự) dẫn tới đúng một trạng thái; với NFA, nó dẫn tới *một tập* trạng thái; với NFA-ε, tập này còn mở rộng qua các cạnh không tiêu thụ ký tự. Chính bước nhảy từ "một trạng thái" sang "một tập trạng thái" là chỗ sinh viên vấp nhiều nhất khi học thuật toán *subset construction*.

```mermaid
flowchart LR
    %% Định nghĩa phong cách màu sắc chuẩn Academic (Nhiều màu, chuyên nghiệp)
    classDef neNode fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#0D47A1,font-weight:bold;
    classDef nNode fill:#FFF3E0,stroke:#EF6C00,stroke-width:1.5px,color:#E65100,font-weight:bold;
    classDef dNode fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20,font-weight:bold;

    %% Các nút trong sơ đồ (đã ngắt dòng chủ động tránh xén chữ)
    NE["NFA-ε<br/>δ: Q × (Σ ∪ ε) → 2^Q"]:::neNode
    
    N["NFA<br/>δ: Q × Σ → 2^Q"]:::nNode
    
    D["DFA<br/>δ: Q × Σ → Q"]:::dNode

    %% Luồng liên kết và chú thích chuyển đổi
    NE -->|"ε-closure"| N
    N -->|"subset construction"| D
    NE -->|"ε-closure + subset construction"| D
```

**Khoảng trống nghiên cứu.** Các công trình về dạy học ôtômát đã chỉ ra rằng công cụ trực quan, tương tác giúp tăng mức độ hiểu và tham gia của sinh viên, điển hình là ứng dụng web mô phỏng ôtômát hữu hạn và hướng chuyển phần học lý thuyết ôtômát lên nền tảng số (xem [3], [4]). Tuy nhiên, phần lớn công cụ hướng tới *vẽ và mô phỏng* một ôtômát cho trước, trong khi điều sinh viên thực sự cần khi giải bài tập là *kiểm chứng phép biến đổi*: thấy rõ tập ε-closure của từng trạng thái, thấy từng tập con được sinh ra trong DFA và tại sao một chuỗi bị từ chối. Thêm vào đó, các công cụ này ít khi gắn lý thuyết, bài tập và công cụ vào cùng một nơi, và hiếm khi dùng được ngay trên trình duyệt mà không cần cài đặt. Đồ án nhắm vào đúng khoảng trống này: biến các thuật toán chuyển đổi, vốn là phần trừu tượng nhất của chương, thành thứ có thể quan sát từng bước.

```mermaid
flowchart TB
    %% Định nghĩa phong cách màu sắc chuẩn Academic (Nhiều màu, chuyên nghiệp)
    classDef problem fill:#FFEBEE,stroke:#C62828,stroke-width:1.5px,color:#B71C1C,font-weight:bold;
    classDef gap1 fill:#FFF3E0,stroke:#EF6C00,stroke-width:1.5px,color:#E65100;
    classDef gap2 fill:#FFFDE7,stroke:#FBC02D,stroke-width:1.5px,color:#F57F17;
    classDef gap3 fill:#F3E5F5,stroke:#7B1FA2,stroke-width:1.5px,color:#4A148C;
    classDef solution fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20,font-weight:bold;

    %% Các nút trong sơ đồ (đã ngắt dòng chủ động tránh xén chữ)
    P["Thực trạng:<br/>học qua hình tĩnh, giải tay"]:::problem
    
    G1["Khoảng trống 1:<br/>khó kiểm chứng phép chuyển đổi"]:::gap1
    G2["Khoảng trống 2:<br/>lý thuyết, bài tập, công cụ tách rời"]:::gap2
    G3["Khoảng trống 3:<br/>cần cài đặt, khó dùng tại lớp"]:::gap3
    
    S1["Hiển thị ε-closure và<br/>tập con từng bước"]:::solution
    S2["Một trang web:<br/>lý thuyết, bài tập, kiểm tra, chuyển đổi"]:::solution
    S3["Chạy trên trình duyệt,<br/>triển khai GitHub Pages"]:::solution

    %% Luồng liên kết
    P --> G1
    P --> G2
    P --> G3
    
    G1 --> S1
    G2 --> S2
    G3 --> S3
```

**Từ thuật toán đến mô-đun.** Mỗi phép biến đổi lý thuyết được cài đặt thành một mô-đun JavaScript riêng, dùng chung một định dạng dữ liệu (trạng thái, bảng chữ cái, trạng thái đầu, trạng thái kết, bảng chuyển) để kết quả của mô-đun này làm đầu vào cho mô-đun kia.

| Cơ sở lý thuyết | Mô-đun | Trang |
|---|---|---|
| Chạy chuỗi trên DFA | `DFA.js` | `DFA.html` |
| Chạy chuỗi trên NFA (theo tập trạng thái hiện hành) | `NFA.js` | `NFA.html` |
| Chạy chuỗi trên NFA-ε (đóng bao ε tại mỗi bước) | `NFAe.js` | `NFAe.html` |
| Subset construction | `NFAtoDFA.js` | `NFADFA.html` |
| ε-closure rồi subset construction | `NFAe_to_DFA.js` | `NFAeNFADFA.html` |
| Tổng hợp định nghĩa và bài tập | — | `LyThuyet.html` |

```mermaid
flowchart TB
    %% Định nghĩa phong cách màu sắc chuẩn Academic (Nhiều màu, chuyên nghiệp)
    classDef startNode fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#0D47A1,font-weight:bold;
    classDef decisionNode fill:#FFF3E0,stroke:#EF6C00,stroke-width:1.5px,color:#E65100,font-weight:bold;
    classDef processNode fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20;
    classDef addNode fill:#F3E5F5,stroke:#7B1FA2,stroke-width:1.5px,color:#4A148C;
    classDef endNode fill:#FFEBEE,stroke:#C62828,stroke-width:1.5px,color:#B71C1C,font-weight:bold;

    %% Các nút trong sơ đồ (đã ngắt dòng chủ động tránh xén chữ)
    S["Tập trạng thái bắt đầu<br/>ε-closure của q0"]:::startNode
    
    W{"Còn tập con<br/>chưa xét?"}:::decisionNode
    
    M["Với mỗi ký tự a:<br/>T = ε-closure của move(S, a)"]:::processNode
    
    N{"T đã có<br/>trong DFA?"}:::decisionNode
    
    ADD["Thêm T làm<br/>trạng thái mới"]:::addNode
    
    LINK["Vẽ cạnh S → T<br/>với nhãn a"]:::processNode
    
    F["Trạng thái kết: tập con<br/>chứa ít nhất một trạng thái<br/>kết của NFA"]:::endNode

    %% Luồng liên kết
    S --> W
    
    W -->|Có| M
    M --> N
    
    N -->|Chưa| ADD
    N -->|Rồi| LINK
    
    ADD --> LINK
    LINK --> W
    
    W -->|Không| F
```

Số trạng thái của DFA thu được có thể lên tới 2ⁿ so với NFA gồm n trạng thái, đây cũng là giới hạn hiệu năng chính của một công cụ chạy hoàn toàn trên trình duyệt.

Dữ liệu ôtômát nhập từ file `.txt` có dạng khóa–giá trị, mỗi cạnh chuyển là một dòng `nguồn, ký hiệu, đích`:

```mermaid
flowchart LR
    %% Định nghĩa phong cách chuẩn Academic cho đồ thị trạng thái
    classDef startState fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1,font-weight:bold;
    classDef normalState fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#E65100,font-weight:bold;
    classDef acceptState fill:#E8F5E9,stroke:#2E7D32,stroke-width:3px,color:#1B5E20,font-weight:bold;
    classDef hidden fill:none,stroke:none;

    %% Điểm khởi đầu mũi tên chỉ trạng thái bắt đầu
    Start([ ]) --> q0

    %% Các trạng thái dạng hình tròn (( ))
    q0((q0)):::startState
    q1((q1)):::normalState
    q2((q2)):::acceptState

    %% Các chuyển đổi (Transitions)
    q0 -->|a| q1
    q1 -->|b| q2

    %% Ẩn node khởi đầu
    Start:::hidden
```

```text
states: q0, q1, q2
alphabet: a, b
start: q0
accept: q2
transitions:
q0, a, q1
q1, b, q2
```

Đồ thị dùng bảng màu cố định để người học nhận ra vai trò trạng thái ngay: **xanh lá** là trạng thái bắt đầu, **đỏ** là trạng thái kết, **xanh dương** là trạng thái còn lại.

**Lộ trình thực hành làm nền cho phần cài đặt**

```mermaid
flowchart LR
    %% Định nghĩa phong cách màu sắc chuẩn Academic (Nhiều màu, chuyên nghiệp)
    classDef lab1 fill:#E3F2FD,stroke:#1565C0,stroke-width:1.5px,color:#0D47A1,font-weight:bold;
    classDef lab2 fill:#FFF3E0,stroke:#EF6C00,stroke-width:1.5px,color:#E65100,font-weight:bold;
    classDef lab3 fill:#FFFDE7,stroke:#FBC02D,stroke-width:1.5px,color:#F57F17,font-weight:bold;
    classDef lab4 fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20,font-weight:bold;
    classDef webProject fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C,font-weight:bold;

    %% Các nút trong sơ đồ (đã ngắt dòng chủ động tránh xén chữ)
    L1["Lab 01<br/>Xử lý chuỗi<br/>Python"]:::lab1
    
    L2["Lab 02<br/>Lớp DFA, NFA"]:::lab2
    
    L3["Lab 03<br/>Biểu thức chính quy"]:::lab3
    
    L4["Lab 04<br/>Văn phạm tuyến tính<br/>và bài tổng hợp"]:::lab4
    
    W["Đồ án Web<br/>JavaScript & vis-network"]:::webProject

    %% Luồng liên kết tiến trình
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> W
```

---

## 3. Đóng góp và kết luận

Đồ án đóng góp một công cụ học tập đưa các phép chuyển đổi ôtômát từ dạng kết quả cuối sang dạng quá trình quan sát được, và gom lý thuyết, bài tập, kiểm tra chuỗi, chuyển đổi vào một trang web dùng ngay trên trình duyệt. Mỗi đóng góp dưới đây đáp lại một khoảng trống đã nêu ở phần 2.

| Khoảng trống | Đóng góp | Bằng chứng trong kho |
|---|---|---|
| Khó kiểm chứng phép chuyển đổi | Cài đặt subset construction và ε-closure có trực quan hóa trên đồ thị | `NFAtoDFA.js`, `NFAe_to_DFA.js` |
| Lý thuyết và công cụ tách rời | Trang lý thuyết, bài tập và công cụ chung một giao diện | `LyThuyet.html`, `index.html` |
| Khó dùng tại lớp | Chạy thuần phía trình duyệt, triển khai trên GitHub Pages | [Live Demo](https://huynhthanhphong231004it.github.io/Theoretical_Computer_Science_CT121/10_B2207555/Web/) |
| Thiếu nền tảng cài đặt | Chuỗi bài thực hành Python từ xử lý chuỗi đến văn phạm | `Lab01` – `Lab04` |

Hệ thống hiện còn một số giới hạn do báo cáo tự đánh giá: hiệu năng giảm với ôtômát lớn, chưa sinh bài tập tự động, chưa lưu tiến độ học và chưa tối ưu cho thiết bị di động. Các hướng mở rộng tương ứng được trình bày dưới đây.

```mermaid
flowchart LR
    %% Định nghĩa phong cách màu sắc chuẩn Academic (Nhiều màu, chuyên nghiệp)
    classDef current fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1,font-weight:bold;
    classDef featureA fill:#FFF3E0,stroke:#EF6C00,stroke-width:1.5px,color:#E65100;
    classDef featureB fill:#E8F5E9,stroke:#2E7D32,stroke-width:1.5px,color:#1B5E20;
    classDef featureC fill:#F3E5F5,stroke:#7B1FA2,stroke-width:1.5px,color:#4A148C;
    classDef nextNode fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#B71C1C,font-weight:bold;

    %% Các nút trong sơ đồ (đã ngắt dòng chủ động tránh xén chữ)
    NOW["Hiện tại:<br/>DFA · NFA · NFA-ε"]:::current
    
    A["Sinh bài tập tự động<br/>theo mức độ"]:::featureA
    B["Thống kê tiến độ<br/>và lưu kết quả"]:::featureB
    C["Tối ưu hiệu năng<br/>và giao diện di động"]:::featureC
    
    NEXT["Mô hình nâng cao:<br/>PDA · Máy Turing"]:::nextNode

    %% Luồng liên kết định hướng phát triển
    NOW --> A
    NOW --> B
    NOW --> C
    
    A --> NEXT
    B --> NEXT
    C --> NEXT
```

**Kết luận.** Điểm mới của đồ án không nằm ở thuật toán, vốn là kiến thức kinh điển, mà ở cách đặt người học vào bên trong thuật toán: thấy tập ε-closure, thấy từng tập con được sinh ra và thấy chuỗi đi qua trạng thái nào. Với ôtômát cỡ bài tập trên lớp, cách làm này thay việc "tin vào lời giải tay" bằng việc "tự kiểm chứng được lời giải". Mở rộng sang PDA và máy Turing sẽ đưa công cụ phủ hết các mô hình của học phần CT121.

---

### Tài liệu tham khảo

1. M. Sipser, *Introduction to the Theory of Computation*, 3rd ed., Cengage Learning, 2012.
2. J. E. Hopcroft, R. Motwani, J. D. Ullman, *Automata Theory, Languages, and Computation*, 3rd ed., Pearson, 2007.
3. *A Web App for Teaching Finite State Automata*, 2024.
4. *Migrating teaching of automata theory to a digital platform*, 2024.

<sub>© 2025 Huỳnh Thanh Phong · Đại học Cần Thơ · Sản phẩm phục vụ học tập.</sub>
