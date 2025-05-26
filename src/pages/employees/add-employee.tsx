"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Props {
  drawerId: string;
}

interface Department {
  department_id: string;
  name: string;
  employee_count?: number;
}

interface Position {
  position_id: string;
  name: string;
  employee_count?: number;
}

export default function AddEmployee({ drawerId }: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://i.pravatar.cc/300"
  );
  const [fullName, setFullName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [joinDate, setJoinDate] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [department, setDepartment] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/departments", {
        method: "GET",
        headers: {
          Authorization: `x ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Phản hồi lỗi từ /api/departments:", errorData);
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error(
          `Lỗi khi lấy danh sách phòng ban: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API GET /api/departments response:", data);
      setDepartments(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng ban:", error);
      const errorMessage =
        (error as Error).message || "Không thể tải danh sách phòng ban";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/positions", {
        method: "GET",
        headers: {
          Authorization: `x ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Phản hồi lỗi từ /api/positions:", errorData);
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error(
          `Lỗi khi lấy danh sách vị trí: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API GET /api/positions response:", data);
      setPositions(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vị trí:", error);
      const errorMessage =
        (error as Error).message || "Không thể tải danh sách vị trí";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        const errorMessage = "Kích thước ảnh không được vượt quá 2MB";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!fullName || !email || !status) {
      const errorMessage =
        "Vui lòng điền đầy đủ các trường bắt buộc: Họ và Tên, Email, Trạng thái";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const errorMessage = "Email không hợp lệ";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (phone && !/^\+?\d{10,15}$/.test(phone)) {
      const errorMessage = "Số điện thoại không hợp lệ (10-15 chữ số)";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (birthDate && isNaN(new Date(birthDate).getTime())) {
      const errorMessage = "Ngày sinh không hợp lệ";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (joinDate && isNaN(new Date(joinDate).getTime())) {
      const errorMessage = "Ngày vào làm không hợp lệ";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    return true;
  };

  const handleReset = () => {
    setAvatarUrl("https://i.pravatar.cc/300");
    setFullName("");
    setBirthDate("");
    setGender("");
    setPhone("");
    setEmail("");
    setAddress("");
    setJoinDate("");
    setStatus("ACTIVE");
    setDepartment("");
    setPosition("");
    setError(null);
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phone || null,
          birth_date: birthDate ? new Date(birthDate).toISOString() : null,
          gender: gender || null,
          address: address || null,
          department_id: department || null,
          position_id: position || null,
          employment_status: status,
          join_date: joinDate ? new Date(joinDate).toISOString() : null,
          avatar_url:
            avatarUrl === "https://i.pravatar.cc/300" ? null : avatarUrl,
        }),
      });

      const data = await response.json();
      console.log("API POST /api/employees response:", {
        status: response.status,
        data,
      });

      if (response.ok) {
        toast.success("Thêm nhân viên thành công");
        handleReset();
        (document.getElementById(drawerId) as HTMLInputElement).checked = false;
      } else {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        const errorMessage =
          data.error ||
          `Lỗi khi thêm nhân viên: ${response.status} ${response.statusText}`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      const errorMessage = (error as Error).message || "Lỗi máy chủ nội bộ";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      {error && (
        <div className="alert alert-error p-6">
          <span>{error}</span>
        </div>
      )}
      <div
        style={{ maxHeight: "calc(100dvh - 143px)" }}
        className="overflow-y-auto"
      >
        <div className="flex flex-col items-center gap-2 p-6">
          <Image
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
            width={80}
            height={80}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered file-input-sm w-full max-w-xs"
          />
        </div>
        <div className="grid gap-4 p-6">
          <div>
            <label className="label">Họ và Tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="label">Ngày sinh</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="" disabled>
                Chọn giới tính
              </option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="label">Địa chỉ</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>
          <div>
            <label className="label">Ngày vào làm</label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="ACTIVE">Đang làm</option>
              <option value="PROBATION">Thử việc</option>
              <option value="TERMINATED">Nghỉ việc</option>
              <option value="MATERNITY">Nghỉ thai sản</option>
            </select>
          </div>
          <div>
            <label className="label">Phòng ban</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="select select-bordered w-full"
              disabled={departments.length === 0}
            >
              <option value="" disabled>
                Chọn phòng ban
              </option>
              {departments.map((dep) => (
                <option key={dep.department_id} value={dep.department_id}>
                  {dep.name} ({dep.employee_count || 0} nhân viên)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Vị trí công việc</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="select select-bordered w-full"
              disabled={positions.length === 0}
            >
              <option value="" disabled>
                Chọn vị trí
              </option>
              {positions.map((pos) => (
                <option key={pos.position_id} value={pos.position_id}>
                  {pos.name} ({pos.employee_count || 0} nhân viên)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4 px-6 py-4">
        <label htmlFor={drawerId} className="btn btn-soft">
          Đóng
        </label>
        <button
          className="btn btn-outline btn-primary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </button>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Thêm"
          )}
        </button>
      </div>
    </div>
  );
}
