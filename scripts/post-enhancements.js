(function initPostEnhancements() {
  const content = document.querySelector(".content");
  if (!content) {
    return;
  }

  initNavigatebarAlignment(content);
  initCodeCopyButtons(content);
})();

function initNavigatebarAlignment(content) {
  const syncLayout = () => {
    // The IIFE is re-executed on every SPA render; skip detached content.
    if (!content.isConnected) {
      return;
    }
    alignNavigatebarWithContent(content);
  };

  syncLayout();
  window.addEventListener("resize", syncLayout);
  window.addEventListener("load", syncLayout);
}

function alignNavigatebarWithContent(content) {
  const navigatebar = document.querySelector(".navigatebar");
  const navigatebarMine = document.querySelector(".navigatebar-mine");
  const contentArea = document.querySelector(".content-area");

  if (!navigatebar || !navigatebarMine || !contentArea) {
    return;
  }

  if (window.innerWidth <= 600) {
    navigatebar.style.width = "";
    navigatebar.style.paddingLeft = "";
    return;
  }

  const targetWidth = Math.round(contentArea.getBoundingClientRect().width);

  navigatebar.style.width = `${targetWidth}px`;
  navigatebar.style.boxSizing = "border-box";

  const desiredLeft = Math.round(content.getBoundingClientRect().left);
  const currentLeft = Math.round(navigatebarMine.getBoundingClientRect().left);
  const currentPaddingLeft = Number.parseFloat(window.getComputedStyle(navigatebar).paddingLeft) || 0;
  const nextPaddingLeft = Math.max(0, Math.round(currentPaddingLeft + desiredLeft - currentLeft));

  navigatebar.style.paddingLeft = `${nextPaddingLeft}px`;
}

function initCodeCopyButtons(content) {
  const codeBlocks = Array.from(content.querySelectorAll("pre code"));

  for (const code of codeBlocks) {
    const pre = code.closest("pre");
    if (!pre) {
      continue;
    }

    const container = pre.closest("figure.highlight, div.highlight, div.highlighter-rouge") || pre;
    if (container.dataset.copyReady === "true") {
      continue;
    }

    container.dataset.copyReady = "true";
    container.classList.add("code-block-container", "has-copy-button");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.textContent = "复制";

    button.addEventListener("click", async () => {
      const codeText = code.textContent || "";
      const copied = await copyText(codeText);
      button.textContent = copied ? "已复制" : "复制失败";
      button.classList.toggle("is-success", copied);
      button.classList.toggle("is-failed", !copied);

      window.setTimeout(() => {
        button.textContent = "复制";
        button.classList.remove("is-success", "is-failed");
      }, 1800);
    });

    container.appendChild(button);
  }
}

async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch (_error) {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
