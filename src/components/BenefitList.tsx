export default function BenefitList() {
  const benefits = [
    {
      number: 1,
      title: "렌탈 실비 20만원 (4H)",
      description: "선입금 금지, 행사 종료 후 정산",
    },
    {
      number: 2,
      title: "운송비 등 추가비용 X",
      description: "인화지 500장 지원, 전문 인력 현장 배치",
    },
    {
      number: 3,
      title: "원하는 문구로 사진 출력",
      description: "사진 프레임에 원하는 로고, 문구 추가 가능",
    },
    {
      number: 4,
      title: "AI 보정 기능",
      description: "인물 포토샵, 라이트룸 필터 제공",
    },
    {
      number: 5,
      title: "결혼식 뿐 아니라 어디든 렌탈 대상",
      description: "돌잔치, 학교/유치원, 대학교 축제, 스포츠경기 또는 기업행사",
    },
  ];

  return (
    <div className="space-y-5 py-5 mb-12">
      <div className="space-y-5">
      {benefits.map((benefit) => (
        <div key={benefit.number} className="flex gap-2.5">
          <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold mt-0.5 md:w-5 md:h-5 md:text-[11px]">
            {benefit.number}
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1 leading-tight md:text-base md:mb-1">{benefit.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed md:text-[13px]">{benefit.description}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
