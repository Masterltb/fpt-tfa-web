import { useNavigate } from "react-router-dom";
import { GraduationCap, ShieldCheck, Users2 } from "lucide-react";
import { Card } from "@/components/ui";
import { useAuth, type Role } from "@/lib/auth";

const HOME: Record<Role, string> = {
  student: "/student",
  lecturer: "/lecturer",
  admin: "/admin",
};

const ROLES: { role: Role; label: string; blurb: string; Icon: typeof Users2 }[] = [
  { role: "lecturer", label: "Giảng viên", blurb: "Xếp nhóm cho lớp, xem lý do và chốt danh sách", Icon: Users2 },
  { role: "student", label: "Sinh viên", blurb: "Xem nhóm của mình và thông tin thành viên", Icon: GraduationCap },
  { role: "admin", label: "Quản trị", blurb: "Quản lý lớp, danh sách và cấu hình", Icon: ShieldCheck },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-4 py-10">
      <div className="text-center">
        <h1 className="text-[2rem] font-800 leading-[1.25] tracking-[-0.02em] text-ink sm:text-[2.4rem]">
          Team Formation Assistant
        </h1>
        <p className="mx-auto mt-3 max-w-[48ch] text-[1rem] leading-relaxed text-ink-soft">
          Trợ lý xếp nhóm cho lớp học FPT. Gợi ý nhóm cân bằng về năng lực, lịch rảnh và vai trò —
          giảng viên vẫn là người quyết định cuối cùng.
        </p>
      </div>

      <Card className="mt-8 p-5 sm:p-6">
        <p className="text-[0.82rem] font-600 uppercase leading-[1.5] tracking-[0.08em] text-ink-faint">
          Chọn vai trò để tiếp tục
        </p>
        <ul className="mt-3 space-y-2.5">
          {ROLES.map(({ role, label, blurb, Icon }) => (
            <li key={role}>
              <button
                onClick={() => {
                  login(`dev-${role}`, role);
                  navigate(HOME[role], { replace: true });
                }}
                className="flex w-full items-center gap-4 rounded-[12px] border border-line px-4 py-3.5 text-left transition-colors hover:border-fpt-orange/45 hover:bg-fpt-orange/[0.045]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fpt-blue/10">
                  <Icon className="size-[18px] text-fpt-blue-ink" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.98rem] font-600 leading-[1.45] text-ink">{label}</span>
                  <span className="block text-[0.85rem] leading-[1.5] text-ink-soft">{blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-faint">
          Đây là đăng nhập tạm cho môi trường phát triển. Bản chính thức sẽ dùng tài khoản FPT.
        </p>
      </Card>
    </div>
  );
}

export { HOME };
