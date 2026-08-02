import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { TeamDNA, SkillRating, CommitmentLevel } from '../../types/api';
import { Header } from '../../components/common/Header';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Sparkles, CheckCircle2, Star, Clock, Save } from 'lucide-react';

const AVAILABLE_SKILLS = [
  { id: 'skill_react', name: 'React / TypeScript', category: 'Frontend' },
  { id: 'skill_node', name: 'Node.js / Express', category: 'Backend' },
  { id: 'skill_python', name: 'Python / FastAPI', category: 'Backend' },
  { id: 'skill_sql', name: 'PostgreSQL / SQL', category: 'Database' },
  { id: 'skill_devops', name: 'Docker / CI-CD', category: 'DevOps' },
  { id: 'skill_uiux', name: 'Figma / UI-UX Design', category: 'Design' },
  { id: 'skill_pm', name: 'Agile / Project Management', category: 'Management' },
];

const TEAM_ROLES = [
  'Frontend Lead / Dev',
  'Backend Lead / Dev',
  'Fullstack Developer',
  'UI/UX Product Designer',
  'DevOps / Infra Engineer',
  'Project Manager / BA',
  'QA / Test Engineer',
];

const WEEKLY_SLOTS = [
  { id: 'MON_EVE', label: 'Tối Thứ 2 (18h-21h)' },
  { id: 'TUE_EVE', label: 'Tối Thứ 3 (18h-21h)' },
  { id: 'WED_EVE', label: 'Tối Thứ 4 (18h-21h)' },
  { id: 'THU_EVE', label: 'Tối Thứ 5 (18h-21h)' },
  { id: 'FRI_EVE', label: 'Tối Thứ 6 (18h-21h)' },
  { id: 'SAT_ALL', label: 'Cả Ngày Thứ 7' },
  { id: 'SUN_ALL', label: 'Cả Ngày Chủ Nhật' },
];

export function TeamDnaWizard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);

  // Initial State from API or Mock defaults
  const { data: profile } = useQuery<TeamDNA>({
    queryKey: ['students', 'me', 'team-profile'],
    queryFn: () => apiClient.get('/students/me/team-profile'),
    retry: false,
  });

  const [skills, setSkills] = useState<SkillRating[]>(profile?.skills || [
    { skillId: 'skill_react', skillName: 'React / TypeScript', category: 'Frontend', level: 4 },
    { skillId: 'skill_python', skillName: 'Python / FastAPI', category: 'Backend', level: 4 },
  ]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(
    profile?.preferredRoles || ['Fullstack Developer', 'Backend Lead / Dev']
  );
  const [commitment, setCommitment] = useState<CommitmentLevel>(profile?.commitmentLevel || 'HIGH');
  const [targetGrade, setTargetGrade] = useState<string>(profile?.targetGrade || 'A (8.5 - 10.0)');
  const [availableSlots, setAvailableSlots] = useState<string[]>(
    profile?.availableTimeSlots || ['MON_EVE', 'WED_EVE', 'SAT_ALL']
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mutation to save DNA Profile
  const mutation = useMutation({
    mutationFn: (data: Partial<TeamDNA>) => apiClient.put('/students/me/team-profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'me', 'team-profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  // Calculate live completeness score (0-100%)
  const calculateCompleteness = () => {
    let score = 0;
    if (skills.length >= 3) score += 35;
    else if (skills.length > 0) score += 20;
    if (preferredRoles.length >= 1) score += 25;
    if (availableSlots.length >= 2) score += 25;
    if (commitment && targetGrade) score += 15;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();

  const handleSkillLevelChange = (skillId: string, name: string, category: string, level: number) => {
    setSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId);
      if (level === 0) return prev.filter((s) => s.skillId !== skillId);
      if (exists) return prev.map((s) => (s.skillId === skillId ? { ...s, level } : s));
      return [...prev, { skillId, skillName: name, category, level }];
    });
  };

  const toggleRole = (role: string) => {
    setPreferredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : prev.length < 2 ? [...prev, role] : prev
    );
  };

  const toggleSlot = (slotId: string) => {
    setAvailableSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleSave = () => {
    mutation.mutate({
      skills,
      preferredRoles,
      commitmentLevel: commitment,
      targetGrade,
      availableTimeSlots: availableSlots,
      completenessScore: completeness,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive DNA Builder Stepper */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Khai Báo Hồ Sơ Team DNA</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cung cấp chính xác kỹ năng & nguyện vọng để AI CP-SAT phân nhóm cân bằng nhất.
              </p>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-semibold text-center">
              {[
                { step: 1, label: '1. Kỹ Năng' },
                { step: 2, label: '2. Vai Trò' },
                { step: 3, label: '3. Lịch Rảnh' },
                { step: 4, label: '4. Cam Kết' },
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => setActiveTab(item.step as any)}
                  className={`py-3 transition border-b-2 ${
                    activeTab === item.step
                      ? 'border-orange-600 text-orange-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Step 1: Skills Matrix */}
            {activeTab === 1 && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Đánh Giá Kỹ Năng Cá Nhân (1 - 5 Sao)</h3>
                  <p className="text-xs text-slate-500">
                    Chọn tối thiểu 3 kỹ năng mạnh nhất của bạn trong các môn học dự án.
                  </p>
                </div>
                <div className="space-y-3">
                  {AVAILABLE_SKILLS.map((item) => {
                    const current = skills.find((s) => s.skillId === item.id);
                    const level = current?.level || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                      >
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            {item.category}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleSkillLevelChange(item.id, item.name, item.category, star)}
                              className={`p-1 rounded-lg transition ${
                                star <= level ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                              }`}
                            >
                              <Star size={18} fill={star <= level ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Preferred Roles */}
            {activeTab === 2 && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Vai Trò Mong Muốn Trong Nhóm (Chọn tối đa 2)</h3>
                  <p className="text-xs text-slate-500">
                    AI sẽ ưu tiên xếp bạn vào nhóm chưa có người đảm nhận các vị trí này.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TEAM_ROLES.map((role) => {
                    const isSelected = preferredRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`p-4 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{role}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-orange-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Weekly Availability Matrix */}
            {activeTab === 3 && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lịch Rảnh Làm Việc Nhóm Hàng Tuần</h3>
                  <p className="text-xs text-slate-500">
                    AI tối đa hóa thời gian chung (Schedule Overlap) giữa các thành viên trong nhóm.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {WEEKLY_SLOTS.map((slot) => {
                    const isSelected = availableSlots.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => toggleSlot(slot.id)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Clock size={16} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                          {slot.label}
                        </span>
                        {isSelected && <CheckCircle2 size={16} className="text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Commitment & Target Grade */}
            {activeTab === 4 && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mức Độ Cam Kết & Mục Tiêu Điểm Số</h3>
                  <p className="text-xs text-slate-500">
                    Ngăn ngừa rủi ro xung đột làm việc do chênh lệch mục tiêu điểm số.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Mức Độ Cam Kết Thời Gian</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setCommitment(level)}
                          className={`py-3 px-4 rounded-xl border text-xs font-bold transition ${
                            commitment === level
                              ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {level === 'HIGH' ? '🔥 Cao (20h+/tuần)' : level === 'MEDIUM' ? '⚡ Vừa (10-15h)' : '💡 Cơ bản (< 10h)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-700 block">Mục Tiêu Điểm Số Môn Học</label>
                    <select
                      value={targetGrade}
                      onChange={(e) => setTargetGrade(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="A (8.5 - 10.0)">A (8.5 - 10.0) — Mục tiêu Xuất Sắc</option>
                      <option value="B (7.0 - 8.4)">B (7.0 - 8.4) — Mục tiêu Khá Giỏi</option>
                      <option value="C (5.5 - 6.9)">C (5.5 - 6.9) — Hoàn thành đạt chuẩn</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                disabled={activeTab === 1}
                onClick={() => setActiveTab((prev) => Math.max(1, prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                ← Bước trước
              </button>
              {activeTab < 4 ? (
                <button
                  onClick={() => setActiveTab((prev) => Math.min(4, prev + 1) as any)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm"
                >
                  Bước tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={mutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Save size={16} /> {mutation.isPending ? 'Đang lưu...' : 'Lưu & Hoàn Thành DNA'}
                </button>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Đã cập nhật hồ sơ Team DNA thành công! Hệ thống AI CP-SAT đã nhận dữ liệu mới.
            </div>
          )}

          {mutation.isError && (
            <ErrorAlert
              title="Lỗi cập nhật hồ sơ"
              detail={(mutation.error as any)?.detail || 'Không thể lưu hồ sơ DNA. Vui lòng kiểm tra lại kết nối.'}
              onRetry={handleSave}
            />
          )}
        </div>

        {/* Right 1 Col: Sticky Live DNA Radar & Score Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-orange-600" /> Live DNA Completeness
              </h3>
              <span className="text-lg font-black text-orange-600">{completeness}%</span>
            </div>

            {/* Radar / Completeness Gauge Visual */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  className="text-slate-100"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  className="text-orange-500 transition-all duration-500 ease-out"
                  strokeWidth="12"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * completeness) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900 block">{completeness}%</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Độ hoàn thiện</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kỹ năng mạnh (≥ 3):</span>
                <span className={`font-bold ${skills.length >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {skills.length} / 3 {skills.length >= 3 && '✓'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Vai trò mong muốn:</span>
                <span className={`font-bold ${preferredRoles.length >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {preferredRoles.length} / 2 {preferredRoles.length >= 1 && '✓'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Lịch rảnh hàng tuần:</span>
                <span className={`font-bold ${availableSlots.length >= 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {availableSlots.length} buổi {availableSlots.length >= 2 && '✓'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
              💡 <strong>Lời khuyên:</strong> Hồ sơ đạt &gt; 80% giúp AI tăng tỷ lệ xếp bạn vào nhóm có điểm cân bằng cao nhất và hạn chế xáo trộn.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
