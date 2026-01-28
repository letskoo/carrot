"use client";

import { useState } from "react";

const tabs = ["홈", "예비부부", "결혼식장", "제휴"];

export default function CategoryTabs() {
  const [active, setActive] = useState("홈");

  const handleTabClick = (tab: string) => {
    if (tab === "홈") {
      setActive(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "예비부부") {
      setActive(tab);
      setTimeout(() => {
        const element = document.getElementById("photo-slide");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else if (tab === "결혼식장") {
      setActive(tab);
      setTimeout(() => {
        const element = document.getElementById("promo-tiles");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else if (tab === "제휴") {
      window.open("https://www.photogroove.co.kr", "_blank");
    }
  };

  return (
    <div className="tabs-container-wrapper">
      <div
        className="category-tabs-container tabs-wrap"
        style={{
          display: "flex",
          gap: 18,
          height: 40,
          alignItems: "flex-end",
          whiteSpace: "nowrap",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            style={{
              height: 40,
              padding: "0 6px",
              background: "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
              fontSize: 14,
              whiteSpace: "nowrap",
              color: "#000",
              fontWeight: active === tab ? 800 : 500,
              flexShrink: 0,
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
