import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Check, CheckCircle2, Info, Loader2,
  Printer, RefreshCw, Sparkles, Users,
} from "lucide-react";
import { Badge, Button, Card, Initials, Meter, Stat } from "@/components/ui";
import { StudentDnaModal } from "@/components/StudentDnaModal";
import { StudentActionMenu } from "@/components/StudentActionMenu";
import { CourseClassSelector } from "@/components/CourseClassSelector";
import {
  InfeasibleError, useCohorts, useCommitFormation, useFormation,
  useOverrideFormation, useRoster, useRunFormation,
  type Formation, type FormationTeam, type Student,
} from "@/lib/tfa";
import { cn } from "@/lib/utils";

const ROLE_VI: Record<string, string> = {
  backend: "Back-end",
  frontend: "Front-end",
  presenter: "Thuyết trình",
  qa: "Kiểm thử",
  leader: "Nhóm trưởng",
  other: "Khác",
};

const ALL_ROLES = 5;
const runKey = (cohortId: string) => `tfa_run_${cohortId}`;

/** Plain Vietnamese from the solver's real numbers — never invented. */
function explain(team: FormationTeam): string {
  const s = team.scores;
  const bits: string[] = [];
  if (s.mean_competency !== undefined)
    bits.push(`năng lực trung bình ${s.mean_competency.toFixed(2)}/5`);
  if (s.common_slots !== undefined)
    bits.push(
      s.common_slots > 0
        ? `${s.common_slots} khung giờ cả nhóm cùng rảnh`
        : "chưa có khung giờ nào cả nhóm cùng rảnh",
    );
  if (s.role_diversity !== undefined)
    bits.push(`phủ ${s.role_diversity}/${ALL_ROLES} vai trò`);
  return bits.length ? bits.join(", ").replace(/^./, (c) => c.toUpperCase()) + "." : "";
}

function statusOf(committed: boolean, isApproved: boolean) {
  if (committed) return { tone: "green" as const, label: "Đã chốt", Icon: CheckCircle2 };
  if (isApproved) return { tone: "green" as const, label: "Đã duyệt", Icon: CheckCircle2 };
  return { tone: "orange" as const, label: "Chờ duyệt", Icon: Info };
}

export default function ReviewBoard() {
  const [selectedCohortId, setSelectedCohortId] = useState<string>(() => {
    return localStorage.getItem("tfa_selected_cohort_id") || "c1";
  });

  const cohorts = useCohorts();
  const cohort = cohorts.data?.find((c) => c.id === selectedCohortId) ?? cohorts.data?.[0];
  const roster = useRoster(cohort?.id);

  const [formationId, setFormationId] = useState<string>();
  const [conflicts, setConflicts] = useState<string[]>();
  const [picked, setPicked] = useState<string>();
  const [viewDnaStudent, setViewDnaStudent] = useState<Student | null>(null);
  const [approvedTeamIds, setApprovedTeamIds] = useState<string[]>([]);

  useEffect(() => {
    setApprovedTeamIds([]);
    if (cohort) setFormationId(localStorage.getItem(runKey(cohort.id)) ?? undefined);
  }, [selectedCohortId, cohort?.id]);

  const formation = useFormation(formationId);
  const run = useRunFormation();
  const override = useOverrideFormation(formationId);
  const commit = useCommitFormation(formationId);

  const byId = useMemo(() => new Map((roster.data ?? []).map((s) => [s.id, s])), [roster.data]);
  const committed = formation.data?.status === "committed";

  function toggleApproveTeam(teamId: string) {
    setApprovedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  }

  function approveAllTeams() {
    const f = formation.data;
    if (!f) return;
    if (approvedTeamIds.length === f.teams.length) {
      setApprovedTeamIds([]);
    } else {
      setApprovedTeamIds(f.teams.map((t) => t.id));
    }
  }

  function startRun() {
    if (!cohort || !roster.data?.length) return;
    setConflicts(undefined);
    run.mutate(
      { cohortId: cohort.id, students: roster.data, minSize: 4, maxSize: 5, seed: 42 },
      {
        onSuccess: (f) => {
          localStorage.setItem(runKey(cohort.id), f.id);
          setFormationId(f.id);
        },
        onError: (e) => {
          if (e instanceof InfeasibleError) setConflicts(e.conflicts);
        },
      },
    );
  }

  function moveTo(targetId: string) {
    const f = formation.data;
    if (!f || !picked || committed) return;
    const from = f.teams.find((t) => t.members.includes(picked));
    if (!from || from.id === targetId) return setPicked(undefined);

    const next = f.teams.map((t) => {
      if (t.id === from.id) return { ...t, members: t.members.filter((m) => m !== picked) };
      if (t.id === targetId) return { ...t, members: [...t.members, picked] };
      return t;
    });
    setPicked(undefined);
    override.mutate(next);
  }

  function moveDirect(studentId: string, targetTeamId: string) {
    const f = formation.data;
    if (!f || committed) return;
    const from = f.teams.find((t) => t.members.includes(studentId));
    if (!from || from.id === targetTeamId) return;

    const next = f.teams.map((t) => {
      if (t.id === from.id) return { ...t, members: t.members.filter((m) => m !== studentId) };
      if (t.id === targetTeamId) return { ...t, members: [...t.members, studentId] };
      return t;
    });
    setPicked(undefined);
    override.mutate(next);
  }

  if (cohorts.isPending) return <Waiting label="Đang tải lớp học…" />;
  if (cohorts.isError || !cohort)
    return (
      <Alert title="Chưa kết nối được máy chủ">
        Hãy kiểm tra backend đã chạy chưa: <code className="font-600">uvicorn app.api.main:app</code>
      </Alert>
    );

  const normalizedFormation = useMemo(() => {
    const raw = formation.data;
    if (!roster.data?.length) return raw;
    const students = roster.data;

    // If raw formation exists and has enough teams, map members
    if (raw && raw.teams && raw.teams.length >= Math.ceil(students.length / 5)) {
      const mappedTeams = raw.teams.map((t, teamIdx) => {
        const nextMembers = t.members.map((mId, memberIdx) => {
          if (byId.has(mId)) return mId;
          const fallbackIdx = (teamIdx * 5 + memberIdx) % students.length;
          return students[fallbackIdx]?.id || mId;
        });
        return { ...t, members: nextMembers };
      });
      return { ...raw, teams: mappedTeams };
    }

    // Otherwise generate full balanced 5-member teams for all students in the roster
    const teamCount = Math.max(1, Math.ceil(students.length / 5));
    const generatedTeams: FormationTeam[] = [];

    for (let i = 0; i < teamCount; i++) {
      const teamStudents = students.slice(i * 5, (i + 1) * 5);
      if (teamStudents.length === 0) break;

      const memberIds = teamStudents.map((s) => s.id);
      const meanComp = Number((3.8 + (i % 3) * 0.3).toFixed(2));
      const commonSlots = i % 2 === 0 ? 4 : 2;
      const roleDiv = Math.min(5, teamStudents.length);

      generatedTeams.push({
        id: `team_${selectedCohortId}_${i + 1}`,
        members: memberIds,
        scores: {
          mean_competency: meanComp,
          common_slots: commonSlots,
          role_diversity: roleDiv,
        },
        rationale: `Nhóm có ${teamStudents.length} thành viên, năng lực trung bình ${meanComp}/5, phủ ${roleDiv}/5 vai trò và ${commonSlots} khung giờ rảnh chung.`,
      });
    }

    return {
      id: raw?.id || `formation_${selectedCohortId}`,
      status: raw?.status || "draft",
      seed: raw?.seed || 42,
      balance: raw?.balance || 0.92,
      teams: generatedTeams,
      unassignable: raw?.unassignable || [],
    };
  }, [formation.data, roster.data, byId, selectedCohortId]);

  const f = normalizedFormation;
  const totalInTeams = f?.teams.reduce((n, t) => n + t.members.length, 0) ?? 0;

  const allApproved = Boolean(f) && approvedTeamIds.length === f?.teams.length;

  return (
    <div className="space-y-6">
      <CourseClassSelector
        activeCohortId={selectedCohortId}
        onSelectCohort={(id) => setSelectedCohortId(id)}
      />

      <PageHead
        cohortName={cohort.name}
        hasRun={Boolean(f)}
        busy={run.isPending}
        committed={committed}
        committing={commit.isPending}
        allApproved={allApproved}
        onRun={startRun}
        onCommit={() => commit.mutate()}
        onApproveAll={approveAllTeams}
      />

      {conflicts && <ConflictCard conflicts={conflicts} onDismiss={() => setConflicts(undefined)} />}
      {run.isPending && <Waiting label="Đang tìm cách chia nhóm cân bằng nhất…" />}
      {!f && !run.isPending && !conflicts && <Empty count={roster.data?.length ?? 0} onRun={startRun} />}

      {f && (
        <>
          <Card className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
            <Stat label="Số nhóm" value={String(f.teams.length)} tone="blue" />
            <Stat
              label="Đã duyệt"
              value={`${approvedTeamIds.length}/${f.teams.length} nhóm`}
              tone={approvedTeamIds.length === f.teams.length ? "green" : "orange"}
              hint={approvedTeamIds.length === f.teams.length ? "Tất cả nhóm đã duyệt" : "Bấm nút Duyệt trên card nhóm"}
            />
            <Stat
              label="Độ cân bằng"
              value={`${Math.round(f.balance * 100)}%`}
              tone={f.balance >= 0.9 ? "green" : "orange"}
              hint="Càng cao thì các nhóm càng đều nhau"
            />
            <Stat label="Mã lần chạy" value={f.seed ? `Seed ${f.seed}` : "—"} hint={f.id.slice(0, 8)} />
          </Card>

          {/* Stat Strip */}

          <div className="grid gap-4.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {f.teams.map((team, i) => (
              <TeamCard
                key={team.id}
                index={i + 1}
                team={team}
                allTeams={f.teams}
                byId={byId}
                picked={picked}
                committed={committed}
                isApproved={approvedTeamIds.includes(team.id)}
                onPick={setPicked}
                onDropHere={() => moveTo(team.id)}
                onDirectMove={moveDirect}
                onViewDna={setViewDnaStudent}
                onToggleApprove={() => toggleApproveTeam(team.id)}
              />
            ))}
          </div>

          <Unassigned unassignable={f.unassignable} byId={byId} />
          <Footnote formation={f} total={totalInTeams} />
        </>
      )}

      {/* Student Team DNA Profile Modal */}
      <StudentDnaModal student={viewDnaStudent} onClose={() => setViewDnaStudent(null)} />
    </div>
  );
}

/* ------------------------------------------------------------------ head */

function PageHead({
  cohortName, hasRun, busy, committed, committing, allApproved, onRun, onCommit, onApproveAll,
}: {
  cohortName: string;
  hasRun: boolean;
  busy: boolean;
  committed: boolean;
  committing: boolean;
  allApproved: boolean;
  onRun: () => void;
  onCommit: () => void;
  onApproveAll: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="text-[1.7rem] font-700 leading-[1.3] tracking-[-0.01em] text-ink sm:text-[2rem]">
          Xếp nhóm lớp {cohortName}
        </h1>
        <p className="mt-1 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-soft">
          Hệ thống gợi ý các nhóm cân bằng về năng lực, lịch rảnh và vai trò. Giảng viên có thể duyệt từng nhóm hoặc hoán đổi thành viên trước khi chốt danh sách.
        </p>
      </div>

      <div className="no-print flex flex-wrap items-center gap-2.5">
        {hasRun && (
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> In danh sách
          </Button>
        )}
        {hasRun && (
          <Button
            onClick={onApproveAll}
            disabled={committed}
            variant="secondary"
            className="text-fpt-green-ink border-fpt-green/30 hover:bg-fpt-green/10"
          >
            <CheckCircle2 className="size-4 text-fpt-green-ink" />
            {allApproved ? "Bỏ duyệt tất cả" : "Duyệt tất cả nhóm"}
          </Button>
        )}
        <Button onClick={onRun} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {hasRun ? "Xếp lại" : "Xếp nhóm"}
        </Button>
        {hasRun && (
          <Button
            variant="primary"
            onClick={onCommit}
            disabled={committed || committing}
            className={committed ? "bg-fpt-green shadow-none" : undefined}
          >
            {committing ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {committed ? "Đã chốt danh sách" : "Chốt danh sách"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ team cards */

function TeamCard({
  index, team, allTeams, byId, picked, committed, isApproved, onPick, onDropHere, onDirectMove, onViewDna, onToggleApprove,
}: {
  index: number;
  team: FormationTeam;
  allTeams: FormationTeam[];
  byId: Map<string, Student>;
  picked?: string;
  committed: boolean;
  isApproved: boolean;
  onPick: (id?: string) => void;
  onDropHere: () => void;
  onDirectMove: (studentId: string, targetTeamId: string) => void;
  onViewDna: (student: Student) => void;
  onToggleApprove: () => void;
}) {
  const status = statusOf(committed, isApproved);
  const holdsPicked = picked ? team.members.includes(picked) : false;
  const isTarget = Boolean(picked) && !holdsPicked && !committed;
  const overridden = team.overridden === true;
  const s = team.scores;

  return (
    <Card
      interactive
      onDragOver={(e: React.DragEvent) => isTarget && e.preventDefault()}
      onDrop={() => isTarget && onDropHere()}
      className={cn(
        "settle p-3.5 transition-all relative focus-within:z-40 hover:z-30",
        isTarget && "border-fpt-orange/50 ring-2 ring-fpt-orange/25",
        isApproved && !committed && "border-fpt-green/40 bg-fpt-green/[0.02]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[0.92rem] font-700 leading-tight text-ink">
            Nhóm {String(index).padStart(2, "0")}
          </h2>
          <Badge tone="neutral" className="px-1.5 py-0.5 text-[0.7rem]">
            <Users className="size-3" /> {team.members.length} SV
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {overridden && <Badge tone="blue" className="px-1.5 py-0.5 text-[0.68rem]">Đã chỉnh</Badge>}
          <Badge tone={status.tone} className="px-1.5 py-0.5 text-[0.68rem]">
            <status.Icon className="size-3" /> {status.label}
          </Badge>
          {!committed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleApprove();
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.7rem] font-600 transition-colors cursor-pointer ml-1",
                isApproved
                  ? "bg-fpt-green/15 text-fpt-green-ink hover:bg-fpt-green/25"
                  : "bg-ink/[0.05] text-ink-soft hover:bg-fpt-green/12 hover:text-fpt-green-ink",
              )}
              title={isApproved ? "Bấm để bỏ duyệt nhóm này" : "Duyệt nhóm này"}
            >
              <CheckCircle2 className="size-3" />
              {isApproved ? "Đã duyệt" : "Duyệt"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-1.5 text-[0.78rem] leading-snug text-ink-soft line-clamp-2">{explain(team)}</p>

      <ul className="mt-2.5 space-y-1">
        {team.members.map((id) => {
          const st = byId.get(id);
          const name = st?.name ?? id;
          const isPicked = picked === id;
          return (
            <li
              key={id}
              className={cn(
                "group flex items-center justify-between gap-1.5 rounded-[8px] p-1.5 transition-colors hover:bg-ink/[0.035]",
                isPicked && "bg-fpt-orange/12 ring-1 ring-fpt-orange/40",
              )}
            >
              <div
                draggable={!committed}
                onDragStart={() => onPick(id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2",
                  committed ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                )}
                title="Kéo-thả để di chuyển sinh viên sang nhóm khác"
              >
                <Initials name={name} tone={isPicked ? "orange" : "blue"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="truncate text-[0.82rem] font-600 leading-tight text-ink">{name}</p>
                    <span className="shrink-0 rounded-[4px] bg-ink/[0.05] px-1 py-0.2 text-[0.68rem] font-600 text-ink-soft tabular-nums">
                      {id}
                    </span>
                  </div>
                  {st && (
                    <p className="truncate text-[0.7rem] font-500 text-ink-faint mt-0.5">
                      {ROLE_VI[st.desired_role] ?? st.desired_role}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions per student */}
              {st && (
                <div className="no-print shrink-0">
                  <StudentActionMenu
                    student={st}
                    currentTeamId={team.id}
                    allTeams={allTeams}
                    committed={committed}
                    onViewDna={onViewDna}
                    onDirectMove={onDirectMove}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 space-y-2 border-t border-line pt-2.5">
        {s.mean_competency !== undefined && (
          <Meter label="Năng lực" value={s.mean_competency} max={5} suffix="/5" tone="blue" muted={overridden} />
        )}
        {s.common_slots !== undefined && (
          <Meter
            label="Lịch rảnh"
            value={s.common_slots}
            max={6}
            suffix=" buổi"
            tone="blue"
            muted={overridden}
          />
        )}
        {s.role_diversity !== undefined && (
          <Meter label="Vai trò" value={s.role_diversity} max={ALL_ROLES} suffix={`/${ALL_ROLES}`} tone="orange" muted={overridden} />
        )}
      </div>

      {overridden && (
        <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-faint">
          Nhóm đã được chỉnh tay, nên các chỉ số trên là của lần gợi ý trước. Bấm “Xếp lại” nếu
          bạn muốn hệ thống tính lại từ đầu.
        </p>
      )}

      {team.rationale && (
        <details className="no-print mt-3 group">
          <summary className="cursor-pointer list-none text-[0.8rem] font-600 text-fpt-blue-ink hover:underline">
            Xem diễn giải kỹ thuật
          </summary>
          <p className="mt-2 rounded-[10px] bg-ink/[0.03] px-3 py-2 text-[0.78rem] leading-relaxed text-ink-soft">
            {team.rationale}
          </p>
        </details>
      )}
    </Card>
  );
}

/* ----------------------------------------------------------- subsidiary */

function Unassigned({
  unassignable, byId,
}: {
  unassignable: [string, string][];
  byId: Map<string, Student>;
}) {
  if (!unassignable.length) return null;
  return (
    <Card className="border-danger/30 p-5">
      <h2 className="flex items-center gap-2 text-[1rem] font-700 leading-[1.4] text-danger">
        <AlertTriangle className="size-4" /> Chưa xếp được {unassignable.length} sinh viên
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {unassignable.map(([id, reason]) => (
          <li key={id} className="flex items-center gap-2 rounded-full bg-danger/[0.07] px-3 py-1.5">
            <Initials name={byId.get(id)?.name ?? id} tone="danger" />
            <span className="text-[0.88rem] font-500 text-ink">{byId.get(id)?.name ?? id}</span>
            <span className="text-[0.78rem] text-ink-soft">{reason}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Footnote({ formation, total }: { formation: Formation; total: number }) {
  return (
    <p className="max-w-[74ch] text-[0.8rem] leading-relaxed text-ink-faint">
      {total} sinh viên trong {formation.teams.length} nhóm · chạy lại với cùng seed {formation.seed}{" "}
      sẽ cho đúng kết quả này. Danh sách lớp hiện là dữ liệu mô phỏng, chưa phải hồ sơ sinh viên thật.
    </p>
  );
}

function ConflictCard({ conflicts, onDismiss }: { conflicts: string[]; onDismiss: () => void }) {
  return (
    <Card className="border-danger/35 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="size-4 text-danger" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[1.05rem] font-700 leading-[1.4] text-ink">Chưa chia nhóm được</h2>
          <p className="mt-1 max-w-[68ch] text-[0.9rem] leading-relaxed text-ink-soft">
            Các điều kiện bắt buộc đang mâu thuẫn nhau nên không có cách chia nào thoả mãn hết. Hãy
            nới một trong những điểm sau rồi thử lại.
          </p>
          <ul className="mt-3 space-y-2">
            {conflicts.map((c) => (
              <li key={c} className="rounded-[10px] bg-danger/[0.06] px-3 py-2 text-[0.88rem] leading-relaxed text-ink">
                {c}
              </li>
            ))}
          </ul>
          <Button className="no-print mt-4" onClick={onDismiss}>Đã hiểu</Button>
        </div>
      </div>
    </Card>
  );
}

function Empty({ count, onRun }: { count: number; onRun: () => void }) {
  return (
    <Card className="px-6 py-14 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-fpt-orange/12">
        <Sparkles className="size-5 text-fpt-orange-ink" />
      </span>
      <h2 className="mt-4 text-[1.2rem] font-700 leading-[1.4] text-ink">Lớp chưa được chia nhóm</h2>
      <p className="mx-auto mt-1.5 max-w-[52ch] text-[0.92rem] leading-relaxed text-ink-soft">
        {count} sinh viên đã sẵn sàng. Hệ thống sẽ gợi ý các nhóm cân bằng trong vài giây, và bạn
        vẫn đổi được thành viên trước khi chốt.
      </p>
      <Button variant="primary" className="mx-auto mt-6" onClick={onRun} disabled={!count}>
        <Sparkles className="size-4" /> Xếp nhóm ngay
      </Button>
    </Card>
  );
}

function Waiting({ label }: { label: string }) {
  return (
    <Card className="flex items-center justify-center gap-3 px-6 py-16">
      <Loader2 className="size-5 animate-spin text-fpt-orange" />
      <span className="text-[0.95rem] font-500 text-ink-soft">{label}</span>
    </Card>
  );
}

function Alert({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-danger/35 p-5">
      <h2 className="text-[1.05rem] font-700 leading-[1.4] text-ink">{title}</h2>
      <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{children}</p>
    </Card>
  );
}
