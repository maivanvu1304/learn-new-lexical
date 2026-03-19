# Huong Dan Chay Chuong Trinh

## 1) Yeu cau moi truong

- Node.js >= 20
- npm >= 10

Kiem tra nhanh:

```bash
node -v
npm -v
```

## 2) Cai dat dependencies

Chay o thu muc goc project (`my-project`):

```bash
npm install
```

## 3) Chay ung dung

### Frontend (bat buoc)

```bash
npm run dev
```

Sau do mo URL ma Vite in ra terminal (thuong la `http://localhost:5173`).

### Backend API (tuy chon cho sync/contracts)

Mo terminal moi va chay:

```bash
npm run dev:api
```

Mac dinh API chay o cong `4000`.

## 4) Chay kiem tra chat luong

### Chay test toan bo workspace

```bash
npm run test
```

### Chay lint

```bash
npm run lint
```

## 5) Luong su dung nhanh

1. Vao man hinh Dashboard.
2. Vao Cards de tao tu vung moi.
3. Quay lai Dashboard, bam **Start Review**.
4. Chon che do hoc (Flip / Multiple Choice / Typing) va lam review.
5. Xem tien do, favorites/mistakes va Import/Export tren Dashboard/Focus Lists.

## 6) Lenh huu ich theo tung phan

- Frontend tests nhanh:

```bash
npm exec --workspace frontend vitest run
```

- Backend contract tests:

```bash
npm run test --workspace backend
```

## 7) Xu ly loi thuong gap

### Loi: `EADDRINUSE: address already in use :::4000`

Nguyen nhan: cong `4000` da duoc tien trinh khac su dung.

Cach nhanh nhat (Git Bash):

```bash
PORT=4001 npm run dev:api
```

Neu dung PowerShell:

```powershell
$env:PORT="4001"; npm run dev:api
```

Neu muon giai phong cong 4000 (can quyen phu hop):

```bash
netstat -ano | findstr :4000
# lay PID, sau do
 taskkill /PID <PID> /F
```
