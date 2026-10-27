import { Top } from "@toss/tds-mobile";
import "./App.css";

function App() {
  return (
    <main>
      <Top
        title={<Top.TitleParagraph size={22}>구독레이더</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>구독 결제일과 예상 지출을 한눈에 관리</Top.SubtitleParagraph>}
      />
      <section className="intro" aria-label="서비스 안내">
        <h1>흩어진 구독을 한곳에서</h1>
        <p>직접 등록한 구독의 예상 결제일과 월·연 환산 예상 구독료를 확인하는 앱이에요.</p>
        <p>현재는 개발 환경 설정을 마친 초기 화면이에요. 구독 등록·저장 기능은 준비 중이에요.</p>
        <p>실제 결제를 진행하거나 결제 내역을 조회하지 않아요.</p>
      </section>
    </main>
  );
}

export default App;
