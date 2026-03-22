# TC Setlist Dashboard (敬拜歌單管理系統 MVP)

這是一個專為教會敬拜團打造的現代化、響應式「服事歌單與排班」儀表板 (Dashboard) 系統 MVP。透過此系統，可以取代傳統的 Word 表格，讓團隊成員在手機或電腦上都能獲得專業且美觀的服事資訊體驗。

## ✨ 核心特色 (Features)

- **深色高質感 UI (Premium Dark UI)**：使用現代化設計風格、玻璃擬物化 (Glassmorphism) 卡片與漸層特效。
- **互動式排班表 (Interactive Team Roster)**：點擊下拉式選單即可快速選擇 主領、樂手、音控 等服事人員。
- **清晰的歌單呈現 (Structured Setlist)**：每首詩歌清楚標示 Key、BPM、拍號與主領，一目了然。
- **快速連結區 (Quick Links)**：內建常用連結（如：YouTube 參考影片、線上轉調工具、便當訂購連結），方便團隊隨時取用。

## 🛠 技術堆疊 (Tech Stack)

- **框架**: [Next.js 16](https://nextjs.org/) (App Router, React)
- **樣式**: [Tailwind CSS](https://tailwindcss.com/)
- **圖示庫**: [Lucide React](https://lucide.dev/icons/)

## 🚀 快速開始 (Getting Started)

請在終端機 (Terminal) 中執行以下指令來啟動本地開發伺服器：

```bash
# 1. 安裝所需依賴套件 (如果您尚未安裝)
npm install

# 2. 啟動開發伺服器
npm run dev
```

然後在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 即可查看結果。

## 📝 如何修改內容 (Customization)

所有的基礎資料目前都寫在 `src/app/page.tsx` 檔案的頂部，您可以非常簡單地進行修改：

1. **修改人員名單 (Personnel List)**：
   尋找 `const PERSONNEL = [...]` 陣列，直接新增或刪除裡面的名字即可更新下拉選單的選項。
   
2. **修改每週詩歌 (Songs)**：
   尋找 `const SONGS = {...}` 物件，您可以更改 `worship1` 和 `worship2` 陣列中的詩歌標題、作者、Key、BPM等資訊。

3. **修改聚會時間與連結**：
   在 JSX 程式碼區塊中直接搜尋並修改對應的文字與 `href` 網址。

## 📦 未來擴充建議 (Future Roadmap)

這個 MVP 可以進一步擴充為更完整的系統：
- 串接資料庫 (如 Supabase, Firebase 或 Notion API)，達成資料永久儲存。
- 加入登入系統 (Authentication)，讓只有同工可以修改排班，一般團員只能檢視。
- 新增 PDF/圖片匯出功能，方便發佈到 LINE 群組。
