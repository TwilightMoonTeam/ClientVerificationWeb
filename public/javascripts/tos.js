// 문서가 로드된 후 실행되는 함수
document.addEventListener("DOMContentLoaded", function () {
  // 모든 질문의 버튼 요소를 가져옵니다.
  const buttons = document.querySelectorAll(".mx-auto button");

  // 모든 질문에 대해 반복합니다.
  buttons.forEach((button, index) => {
    const content = document.getElementById(`tos-${index}`);

    // 클릭 이벤트 리스너를 추가합니다.
    button.addEventListener("click", function () {
      // 클릭 시 토글 동작
      if (content.style.display === "none") {
        content.style.display = "block"; // 문장을 보이도록 설정
        button.setAttribute("aria-expanded", "true"); // 버튼 속성 변경

        // 버튼 아이콘 변경
        button.querySelector("svg:last-child").classList.remove("hidden");
        button.querySelector("svg:first-child").classList.add("hidden");
      } else {
        content.style.display = "none"; // 문장을 숨기도록 설정
        button.setAttribute("aria-expanded", "false"); // 버튼 속성 변경

        // 버튼 아이콘 변경
        button.querySelector("svg:first-child").classList.remove("hidden");
        button.querySelector("svg:last-child").classList.add("hidden");
      }
    });
  });
});
