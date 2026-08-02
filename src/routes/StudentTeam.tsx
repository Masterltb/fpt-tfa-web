import { useState } from "react";
import { Users, Copy, Check, Plus, Send, ShieldCheck, Trash2, KeyRound, UserPlus, Globe, Building } from "lucide-react";
import { Badge, Button, Card, Initials } from "@/components/ui";
import { useCohorts, useRoster } from "@/lib/tfa";

// FPT University Business Rules: Capstone (SEP490/CAP490) & Entrepreneurship (EXE101/EXE201) allow cross-class team formation
const CROSS_CLASS_COURSES = ["SEP490", "CAP490", "EXE101", "EXE201"];

export default function StudentTeam() {
  const cohorts = useCohorts();
  const cohort = cohorts.data?.[0];
  const roster = useRoster(cohort?.id);

  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("SEP490"); // "SEP490" (Cross-class) vs "SWP391" (Same class)
  const [joinStatus, setJoinStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isCrossClassAllowed = CROSS_CLASS_COURSES.includes(selectedCourse);

  // Mock draft team state
  const [teamMembers, setTeamMembers] = useState(() => (roster.data ? roster.data.slice(0, 4) : []));
  const inviteCode = `TFA-${selectedCourse}-TEAM04`;

  function copyInvite() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleJoinByCode(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinStatus({ type: "error", msg: "Vui lòng nhập mã mời nhóm hợp lệ." });
      return;
    }

    if (!cleanCode.startsWith("TFA-")) {
      setJoinStatus({ type: "error", msg: "Mã mời không đúng định dạng. Ví dụ: TFA-SEP490-TEAM02" });
      return;
    }

    if (!isCrossClassAllowed && !cleanCode.includes(selectedCourse)) {
      setJoinStatus({
        type: "error",
        msg: `Môn ${selectedCourse} yêu cầu thành viên cùng lớp học phần. Không thể dùng mã nhóm khác môn.`,
      });
      return;
    }

    // Success simulation
    setJoinStatus({
      type: "success",
      msg: isCrossClassAllowed
        ? `🌐 Đã gia nhập thành công nhóm Liên lớp với mã "${cleanCode}"! (Cùng môn ${selectedCourse})`
        : `🏫 Đã gia nhập thành công nhóm Nội bộ lớp với mã "${cleanCode}"!`,
    });
    setJoinCodeInput("");

    if (roster.data && roster.data.length > 4 && teamMembers.length < 5) {
      setTeamMembers((prev) => [...prev, roster.data![4]]);
    }

    setTimeout(() => {
      setShowJoinModal(false);
      setJoinStatus(null);
    }, 2500);
  }

  function handleRemoveMember(id: string) {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Course Switcher & Rules Banner */}
      <Card className="p-4 bg-ink/[0.02] border-line">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[0.85rem] font-700 text-ink">Môn học đang chọn:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="rounded-lg border border-line bg-surface py-1 px-2.5 text-[0.85rem] font-700 text-ink cursor-pointer focus:outline-none"
            >
              <option value="SEP490">SEP490 — Đồ án Tốt nghiệp (Ghép liên lớp)</option>
              <option value="CAP490">CAP490 — Capstone Project (Ghép liên lớp)</option>
              <option value="EXE101">EXE101 — Trải nghiệm Khởi nghiệp (Ghép liên lớp)</option>
              <option value="SWP391">SWP391 — Software Project (Cùng lớp học phần)</option>
              <option value="PRN231">PRN231 — Cross-Platform App (Cùng lớp học phần)</option>
            </select>
          </div>

          <Badge tone={isCrossClassAllowed ? "blue" : "orange"} className="px-3 py-1 text-[0.78rem]">
            {isCrossClassAllowed ? (
              <span className="flex items-center gap-1.5 font-600">
                <Globe className="size-3.5" /> Ghép nhóm Liên Lớp (Cùng môn {selectedCourse})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-600">
                <Building className="size-3.5" /> Yêu cầu Ghép Nội Bộ Lớp (Môn {selectedCourse})
              </span>
            )}
          </Badge>
        </div>

        <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
          💡 <span className="font-600 text-ink">Quy định FPT University:</span>{" "}
          {isCrossClassAllowed ? (
            <span className="text-fpt-blue-ink font-500">
              Đối với môn <b>{selectedCourse}</b> (Đồ án tốt nghiệp / EXE), sinh viên <b>được phép tự do ghép nhóm với các bạn khác Lớp học phần</b> miễn là cùng mã môn học trong học kỳ.
            </span>
          ) : (
            <span className="text-fpt-orange-ink font-500">
              Đối với môn <b>{selectedCourse}</b>, sinh viên <b>bắt buộc phải ghép nhóm với các bạn trong cùng Lớp học phần</b> (ví dụ: SE1801).
            </span>
          )}
        </p>
      </Card>

      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.7rem] font-700 leading-[1.3] text-ink sm:text-[2rem]">
            Nhóm dự thảo của tôi 👥
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            Môn <span className="font-600 text-ink">{selectedCourse}</span> · {cohort?.name ?? "SE1801"} · Nhóm 04 ({teamMembers.length}/5 thành viên)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setShowJoinModal(true)}>
            <KeyRound className="size-4 text-fpt-orange-ink" /> Gia nhập nhóm bằng mã
          </Button>

          <Button variant="secondary" onClick={copyInvite}>
            {copied ? <Check className="size-4 text-fpt-green-ink" /> : <Copy className="size-4" />}
            {copied ? "Đã chép mã mời!" : `Mã mời: ${inviteCode}`}
          </Button>

          <Button
            variant="primary"
            disabled={submitted}
            onClick={() => setSubmitted(true)}
            className={submitted ? "bg-fpt-green" : undefined}
          >
            <Send className="size-4" />
            {submitted ? "Đã nộp đăng ký nhóm" : "Nộp nhóm lên Giảng viên"}
          </Button>
        </div>
      </div>

      {submitted && (
        <Card className="border-fpt-green/40 bg-fpt-green/10 p-4 text-[0.9rem] font-600 text-fpt-green-ink flex items-center gap-2">
          <ShieldCheck className="size-5 shrink-0" />
          Nhóm của bạn đã được nộp cho Giảng viên xem xét. Bạn vẫn có thể cập nhật cho đến khi hết hạn đăng ký.
        </Card>
      )}

      {/* Join Team Input Card / Banner */}
      {showJoinModal && (
        <Card className="border-fpt-orange/40 bg-gradient-to-r from-[#fffbf7] to-[#fef6f2] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-fpt-orange-ink" />
              <h3 className="text-[1.05rem] font-700 text-ink">Gia nhập nhóm bằng Mã mời ({selectedCourse})</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowJoinModal(false);
                setJoinStatus(null);
              }}
              className="text-[0.82rem] font-600 text-ink-soft hover:text-ink cursor-pointer"
            >
              Đóng ✕
            </button>
          </div>

          <p className="text-[0.85rem] text-ink-soft">
            {isCrossClassAllowed
              ? `Nhập mã mời của bất kỳ nhóm môn ${selectedCourse} nào (chấp nhận mã từ khác Lớp học phần):`
              : `Nhập mã mời của nhóm môn ${selectedCourse} trong cùng Lớp học phần SE1801:`}
          </p>

          <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row gap-2 max-w-[560px]">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              placeholder={`Ví dụ: TFA-${selectedCourse}-TEAM02`}
              className="flex-1 rounded-lg border border-line bg-surface py-2 px-3.5 text-[0.88rem] font-600 tracking-wide text-ink uppercase placeholder:text-ink-faint focus:border-fpt-orange focus:outline-none"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              <UserPlus className="size-4" /> Gia nhập ngay
            </Button>
          </form>

          {joinStatus && (
            <div
              className={`rounded-lg p-3 text-[0.85rem] font-600 ${
                joinStatus.type === "success"
                  ? "bg-fpt-green/15 text-fpt-green-ink border border-fpt-green/30"
                  : "bg-fpt-red/15 text-fpt-red-ink border border-fpt-red/30"
              }`}
            >
              {joinStatus.msg}
            </div>
          )}
        </Card>
      )}

      {/* Team Roster List */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-fpt-orange-ink" />
            <h2 className="text-[1.1rem] font-700 text-ink">Thành viên nhóm hiện tại ({teamMembers.length}/5)</h2>
          </div>
          <Badge tone={teamMembers.length >= 4 ? "green" : "orange"}>
            {teamMembers.length >= 4 ? "Đạt chỉ tiêu tối thiểu (≥4)" : "Thiếu thành viên"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {teamMembers.map((member, index) => (
            <div key={member.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3.5 bg-surface transition-all hover:border-fpt-blue/30">
              <div className="flex items-start gap-3 min-w-0">
                <Initials name={member.name} tone={index === 0 ? "orange" : "blue"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[0.92rem] font-700 text-ink">{member.name}</p>
                    {index === 0 && <Badge tone="orange" className="text-[0.68rem]">Trưởng nhóm</Badge>}
                  </div>
                  <p className="mt-0.5 text-[0.78rem] text-ink-soft">
                    <span className="font-600 text-ink">{member.id}</span> · Lớp {index === 2 && isCrossClassAllowed ? "SE1802 (Khác lớp)" : "SE1801"} · {member.desired_role}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill) => (
                      <span key={skill.name} className="rounded bg-ink/[0.05] px-1.5 py-0.5 text-[0.7rem] text-ink-soft">
                        {skill.name} ({skill.proficiency}/5)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-ink-faint hover:text-fpt-red p-1 transition-colors cursor-pointer"
                  title="Mời rời nhóm"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add Member Slot Placeholder */}
          {teamMembers.length < 5 && (
            <div
              onClick={() => setShowJoinModal(true)}
              className="group flex flex-col items-center justify-center rounded-xl border border-dashed border-line p-6 text-center bg-ink/[0.015] hover:border-fpt-orange hover:bg-fpt-orange/[0.02] cursor-pointer transition-all"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-fpt-orange/12 text-fpt-orange-ink group-hover:scale-110 transition-transform">
                <Plus className="size-5" />
              </div>
              <p className="mt-2 text-[0.88rem] font-600 text-ink">Thêm thành viên ({5 - teamMembers.length} vị trí trống)</p>
              <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                {isCrossClassAllowed ? "Bấm vào đây để Nhập mã nhóm liên lớp (SEP490/EXE)" : "Bấm vào đây để Nhập mã gia nhập nhóm trong lớp SE1801"}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
