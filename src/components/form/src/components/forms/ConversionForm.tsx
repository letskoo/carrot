"use client";

import { useState } from "react";

export default function ConversionForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    region: "",
    memo: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isMarketingAgreed, setIsMarketingAgreed] = useState(false);

  const isFormValid = formData.name.trim() !== "" && formData.phone.trim() !== "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage("이름과 연락처는 필수 입력입니다.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        message: formData.memo ?? "",
      };

      console.log("Submitting form payload:", payload);

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Check content-type to ensure we're getting JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid response format:", text);
        setMessage("❌ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const data = await response.json();

      // ✅ Only show success if server explicitly returns ok: true
      if (data.ok === true) {
        setMessage("✅ 문의가 정상적으로 접수되었습니다. 감사합니다!");
        setFormData({ name: "", phone: "", region: "", memo: "" });
      } else {
        // Show error message from server, or generic message
        const errorMsg = data.message || "요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";
        setMessage(`❌ ${errorMsg}`);
        console.error("Server returned error:", data);
      }
    } catch (error) {
      setMessage("❌ 네트워크 오류가 발생했습니다.");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="lead-form"
      style={{
        width: "100%",
        padding: "80px 20px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,               // 폼 폭 고정
          background: "#fff",
          borderRadius: 16,
          padding: "32px 24px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          boxSizing: "border-box",
        }}
      >
        <h3
          style={{
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 20,
          }}
        >
          문의하기
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              name="name"
              placeholder="이름 *"
              value={formData.name || ""}
              onChange={handleChange}
              style={inputStyle()}
            />

            <input
              type="text"
              name="phone"
              placeholder="연락처 *"
              value={formData.phone || ""}
              onChange={handleChange}
              style={inputStyle()}
            />

            <input
              type="text"
              name="region"
              placeholder="지역"
              value={formData.region || ""}
              onChange={handleChange}
              style={inputStyle()}
            />

            <textarea
              name="memo"
              placeholder="문의 내용"
              rows={4}
              value={formData.memo || ""}
              onChange={handleChange}
              style={{
                ...inputStyle(),
                resize: "none",
              }}
            />

            {/* 마케팅 동의 체크박스 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "2px",
                marginBottom: "16px",
              }}
            >
              <input
                type="checkbox"
                id="marketing-agreement"
                checked={isMarketingAgreed}
                onChange={(e) => setIsMarketingAgreed(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#003DA5",
                }}
              />
              <label
                htmlFor="marketing-agreement"
                style={{
                  fontSize: "14px",
                  color: "#333",
                  cursor: "pointer",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                마케팅 활용에 동의합니다
                <a
                  href="http://pf.kakao.com/_zRMZj/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "14px",
                    color: "#003DA5",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "opacity 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  (내용보기)
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              style={{
                marginTop: 0,
                height: 52,
                borderRadius: 12,
                border: "none",
                background: isFormValid && !loading ? "#003DA5" : "#ccc",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: isFormValid && !loading ? "pointer" : "not-allowed",
                transition: "background 0.3s ease",
                outline: "none",
              }}
            >
              {loading ? "제출 중..." : "제출하기"}
            </button>

            {message && (
              <span
                style={{
                  fontSize: 13,
                  color: message.includes("✅") ? "#4caf50" : "#f44336",
                  marginTop: 8,
                  padding: "8px 12px",
                  backgroundColor:
                    message.includes("✅") ? "#f1f8e9" : "#ffebee",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                {message}
              </span>
            )}

            <span
              style={{
                fontSize: 12,
                color: "#999",
                marginTop: 4,
              }}
            >
              * 필수 입력
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "1px solid #e3e3e3",
    padding: "0 12px",
    fontSize: 14,
    boxSizing: "border-box",
  };
}
