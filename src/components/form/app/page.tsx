"use client";

import ConversionForm from "@/components/form/src/components/forms/ConversionForm";

export default function Page() {
  return (
    <>
      <main className="pg-main">
        {/* 앵커 타겟 */}
        <div id="lead-form">
          <ConversionForm />
        </div>
      </main>
    </>
  );
}
