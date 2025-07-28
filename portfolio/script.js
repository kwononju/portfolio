document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll("section");

  // 섹션 위치 정보
  let sectionPositions = [];
  let currentSection = "intro";

  // 초기 설정
  init();

  function init() {
    updateSectionPositions();
    updateActiveNav();
    initIntersectionObserver();
    bindEvents();

    // 인트로 애니메이션 시작
    setTimeout(startIntroAnimation, 500);
  }

  // 섹션 위치 업데이트
  function updateSectionPositions() {
    sectionPositions = [];
    sections.forEach((section) => {
      sectionPositions.push({
        id: section.id,
        offsetTop: section.offsetTop,
        offsetBottom: section.offsetTop + section.offsetHeight,
      });
    });
  }

  // 이벤트 바인딩
  function bindEvents() {
    // 스크롤 이벤트
    window.addEventListener("scroll", throttle(handleScroll, 16));

    // 리사이즈 이벤트
    window.addEventListener("resize", debounce(handleResize, 250));

    // 네비게이션 클릭 이벤트
    navItems.forEach((item) => {
      item.addEventListener("click", handleNavClick);
    });

    // 프로젝트 버튼 이벤트
    bindProjectButtons();

    // 다크모드 초기화 및 이벤트
    initDarkMode();
    bindDarkModeToggle();
  }

  // 스크롤 이벤트 핸들러
  function handleScroll() {
    updateActiveNav();
    checkFooterAnimation();
  }

  // 활성 네비게이션 업데이트
  function updateActiveNav() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    let activeSection = "intro";

    for (let i = 0; i < sectionPositions.length; i++) {
      const section = sectionPositions[i];

      // 섹션의 50% 이상이 화면에 보이면 활성화
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetBottom - section.offsetTop;
      const triggerPoint = sectionTop + sectionHeight * 0.8; // 섹션의 80% 지점

      if (scrollY >= triggerPoint - windowHeight * 0.1) {
        // 화면 상단에서 10% 지점
        activeSection = section.id;
      }
    }

    if (activeSection !== currentSection) {
      currentSection = activeSection;

      navItems.forEach((item) => {
        item.classList.remove("active");
        if (item.getAttribute("href") === `#${activeSection}`) {
          item.classList.add("active");
        }
      });
    }
  }

  // 네비게이션 클릭 핸들러
  function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      const offsetTop = targetSection.offsetTop;
      // 인트로는 0, 다른 섹션들은 정확히 섹션 시작점으로 스크롤
      if (targetId === "intro") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        window.scrollTo({
          top: offsetTop + window.innerHeight,
          behavior: "smooth",
        });
      }
    }
  }

  // 리사이즈 핸들러
  function handleResize() {
    updateSectionPositions();
  }

  // 인트로 애니메이션 시작 (타이핑 효과)
  function startIntroAnimation() {
    const introLines = document.querySelectorAll(".intro-section .intro-line");

    // 순차적으로 애니메이션 실행
    function animateLine(index) {
      if (index >= introLines.length) return;

      const line = introLines[index];
      const text = line.textContent;
      line.textContent = ""; // 텍스트 초기화

      // 두번째 줄이 시작될 때 첫번째 줄을 왼쪽으로 이동
      if (index === 1 && introLines.length > 1) {
        introLines[0].classList.add("align-left");
      }

      // 두번째 줄부터는 처음부터 왼쪽 정렬로 시작
      if (index > 0) {
        line.classList.add("align-left");
      }

      // 페이드인 효과를 적용
      if (index === 0) {
        // 첫번째 줄만 페이드인 애니메이션
        line.classList.add("show");
      } else {
        // 두번째 줄부터는 즉시 완전히 표시
        line.style.opacity = "1";
        line.style.transform = "translateX(0)";
      }

      // 첫번째 줄만 페이드인 애니메이션 후 타이핑, 나머지는 바로 타이핑 시작
      if (index === 0) {
        // 첫번째 줄은 페이드인 완료 후 타이핑 시작
        setTimeout(() => {
          typeText(line, text, 0, () => {
            // 타이핑이 완료되면 즉시 커서 제거하고 다음 줄 시작
            line.classList.add("typing-complete");
            animateLine(index + 1); // 즉시 다음 줄 시작
          });
        }, 500); // 페이드인 애니메이션 완료 후 타이핑 시작
      } else {
        // 두번째 줄부터는 바로 타이핑 시작 (페이드인 애니메이션 없음)
        typeText(line, text, 0, () => {
          // 타이핑이 완료되면 즉시 커서 제거하고 다음 줄 시작
          line.classList.add("typing-complete");
          animateLine(index + 1); // 즉시 다음 줄 시작
        });
      }
    }

    // 첫 번째 줄부터 시작
    animateLine(0);
  }

  // 타이핑 효과 함수
  function typeText(element, text, index, callback) {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      setTimeout(() => {
        typeText(element, text, index + 1, callback);
      }, 150); // 각 글자마다 150ms 간격 (조금 더 느리게)
    } else {
      // 타이핑 완료 후 즉시 콜백 실행 (커서 깜빡임 처리는 호출하는 곳에서)
      if (callback) callback();
    }
  }

  // 푸터 애니메이션 확인 (타이핑 효과)
  function checkFooterAnimation() {
    const footer = document.querySelector(".footer");
    const footerLines = footer.querySelectorAll(".footer-line");
    const footerTop = footer.offsetTop;
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    if (scrollY + windowHeight > footerTop + 200) {
      // 이미 애니메이션이 시작되었는지 확인
      if (!footer.classList.contains("animation-started")) {
        footer.classList.add("animation-started");

        // 순차적으로 애니메이션 실행
        function animateFooterLine(index) {
          if (index >= footerLines.length) return;

          const line = footerLines[index];
          if (!line.classList.contains("animated")) {
            line.classList.add("animated");
            const text = line.textContent;
            line.textContent = ""; // 텍스트 초기화

            // 모든 줄이 즉시 완전히 표시되도록 설정 (각자의 정렬 위치에서)
            line.style.opacity = "1";
            line.style.transform = "translateX(0)";

            // 바로 타이핑 시작
            typeText(line, text, 0, () => {
              // 타이핑이 완료되면 즉시 커서 제거하고 다음 줄 시작
              line.classList.add("typing-complete");
              animateFooterLine(index + 1); // 즉시 다음 줄 시작
            });
          }
        }

        // 첫 번째 줄부터 시작
        animateFooterLine(0);
      }
    }
  }

  // Intersection Observer로 스크롤 애니메이션
  function initIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    // 기존 project-item, profile-container용 observer (불필요시 삭제 가능)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
        }
      });
    }, observerOptions);

    // 섹션별 페이드인 애니메이션을 위한 옵저버
    const sectionObserverOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -50px 0px",
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, sectionObserverOptions);

    // (기존) 애니메이션할 요소들 관찰 (불필요시 삭제 가능)
    const animateElements = document.querySelectorAll(
      ".project-item, .profile-container"
    );
    animateElements.forEach((el) => {
      el.classList.add("animate-on-scroll");
      observer.observe(el);
    });

    // 섹션별 페이드인 애니메이션 적용
    const sections = document.querySelectorAll(
      ".profile-section, .project-detail-section"
    );
    sections.forEach((section) => {
      section.classList.add("section-fade-in");
      sectionObserver.observe(section);
    });
  }

  // 프로젝트 버튼 이벤트
  function bindProjectButtons() {
    const originalButtons = document.querySelectorAll(".btn-original");
    const figmaButtons = document.querySelectorAll(".btn-figma");

    originalButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        // 원본 사이트로 이동하는 로직
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);

        // 실제 URL이 있다면 여기에 추가
        console.log("원본 사이트로 이동");
      });
    });

    figmaButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        // Figma 디자인으로 이동하는 로직
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);

        // 실제 Figma URL이 있다면 여기에 추가
        console.log("Figma 디자인으로 이동");
      });
    });
  }

  // 유틸리티 함수들
  function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // 다크모드 토글 스위치 이벤트
  function bindDarkModeToggle() {
    const darkModeCheckbox = document.getElementById("darkModeCheckbox");
    if (darkModeCheckbox) {
      darkModeCheckbox.addEventListener("change", toggleDarkMode);
    }
  }

  // 다크모드 토글
  function toggleDarkMode() {
    const darkModeCheckbox = document.getElementById("darkModeCheckbox");
    const isDarkMode = darkModeCheckbox.checked;

    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // 논픽션 로고 이미지 변경
    updateNonfictionLogo(isDarkMode);

    localStorage.setItem("darkMode", isDarkMode);
  }

  // 다크모드 초기 설정
  function initDarkMode() {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const darkModeCheckbox = document.getElementById("darkModeCheckbox");

    if (savedDarkMode) {
      document.body.classList.add("dark-mode");
      if (darkModeCheckbox) {
        darkModeCheckbox.checked = true;
      }
    } else {
      document.body.classList.remove("dark-mode");
      if (darkModeCheckbox) {
        darkModeCheckbox.checked = false;
      }
    }

    // 논픽션 로고 이미지 초기 설정
    updateNonfictionLogo(savedDarkMode);
  }

  // 논픽션 로고 이미지 업데이트
  function updateNonfictionLogo(isDarkMode) {
    const nonfictionLogo = document.querySelector(".project-logo-image1");
    if (nonfictionLogo) {
      if (isDarkMode) {
        nonfictionLogo.src = "images/nonfiction logo.png";
      } else {
        nonfictionLogo.src = "images/nonfiction black logo.png";
      }
    }
  }
});
