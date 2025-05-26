import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

// Hàm format ngày sang YYYY-MM-DD cho input date
const formatDateForInput = (date: string | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};
type Gender = "Nam" | "Nữ";
type EmploymentStatus = "Đang làm" | "Thử việc" | "Nghỉ việc" | "Nghỉ thai sản";

interface Employee {
  employee_id: string;
  avatar_url: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  gender: Gender | "MALE" | "FEMALE"; // Chấp nhận cả MALE/FEMALE từ API
  address: string;
  department_id: string;
  department_name: string;
  position_id: string;
  position_name: string;
  employment_status: EmploymentStatus;
  join_date: string;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  item: Employee | null;
  drawerId: string;
  fetchTasks: (page: number) => Promise<void>;
}

interface Department {
  department_id: string;
  name: string;
}

interface Position {
  position_id: string;
  name: string;
}

export default function DetailEmployee({ item, drawerId, fetchTasks }: Props) {
  const [formData, setFormData] = useState<Employee | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://i.pravatar.cc/300"
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      console.log("Item received:", item); // Debug giá trị item
      console.log("Raw gender:", item.gender); // Debug gender

      const validStatuses: EmploymentStatus[] = [
        "Đang làm",
        "Thử việc",
        "Nghỉ việc",
        "Nghỉ thai sản",
      ];
      const employment_status = validStatuses.includes(
        item.employment_status as EmploymentStatus
      )
        ? item.employment_status
        : "Đang làm";

      // Xử lý gender với kiểm tra an toàn
      const gender: Gender =
        item.gender === "MALE"
          ? "Nam"
          : item.gender === "FEMALE"
          ? "Nữ"
          : "Nam"; // Mặc định "Nam" nếu không xác định

      console.log("Processed gender:", gender); // Debug gender đã xử lý

      setFormData({
        ...item,
        employment_status: employment_status as EmploymentStatus,
        phone_number: item.phone_number || "",
        birth_date: formatDateForInput(item.birth_date),
        gender: gender,
        address: item.address || "",
        department_id: item.department_id || "",
        position_id: item.position_id || "",
        join_date: formatDateForInput(item.join_date),
        leave_date: item.leave_date
          ? formatDateForInput(item.leave_date)
          : null,
      });
      setAvatarUrl(item.avatar_url || "https://i.pravatar.cc/300");
    } else {
      setFormData(null);
      setAvatarUrl("https://i.pravatar.cc/300");
    }
    fetchDepartments();
    fetchPositions();
  }, [item]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments", { method: "GET" });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Phản hồi lỗi từ /api/departments:", errorData);
        throw new Error(
          `Lỗi khi lấy danh sách phòng ban: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
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
      const response = await fetch("/api/positions", { method: "GET" });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Phản hồi lỗi từ /api/positions:", errorData);
        throw new Error(
          `Lỗi khi lấy danh sách vị trí: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vị trí:", error);
      const errorMessage =
        (error as Error).message || "Không thể tải danh sách vị trí";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (key: keyof Employee, value: string) => {
    if (formData) {
      setFormData({ ...formData, [key]: value });
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
    if (!formData) return false;
    if (!formData.full_name || !formData.email || !formData.employment_status) {
      const errorMessage =
        "Vui lòng điền đầy đủ các trường bắt buộc: Họ và Tên, Email, Trạng thái";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      const errorMessage = "Email không hợp lệ";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (
      formData.phone_number &&
      !/^\+?\d{10,15}$/.test(formData.phone_number)
    ) {
      const errorMessage = "Số điện thoại không hợp lệ (10-15 chữ số)";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (formData.birth_date && isNaN(new Date(formData.birth_date).getTime())) {
      const errorMessage = "Ngày sinh không hợp lệ";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    if (formData.join_date && isNaN(new Date(formData.join_date).getTime())) {
      const errorMessage = "Ngày vào làm không hợp lệ";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    const validStatuses: EmploymentStatus[] = [
      "Đang làm",
      "Thử việc",
      "Nghỉ việc",
      "Nghỉ thai sản",
    ];
    if (!validStatuses.includes(formData.employment_status)) {
      const errorMessage = "Trạng thái không hợp lệ. Vui lòng chọn lại.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    const validGenders: Gender[] = ["Nam", "Nữ"];
    if (!validGenders.includes(formData.gender as Gender)) {
      const errorMessage = "Giới tính không hợp lệ. Vui lòng chọn lại.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!formData || !validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/employees/${formData.employee_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number || null,
          birth_date: formData.birth_date || null,
          gender: formData.gender === "Nam" ? "MALE" : "FEMALE", // Ánh xạ ngược khi gửi API
          address: formData.address || null,
          department_id: formData.department_id || null,
          position_id: formData.position_id || null,
          employment_status: formData.employment_status,
          join_date: formData.join_date || null,
          avatar_url:
            avatarUrl === "https://i.pravatar.cc/300" ? null : avatarUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Cập nhật nhân viên thành công");
        await fetchTasks(1);
        (document.getElementById(drawerId) as HTMLInputElement).checked = false;
      } else {
        const errorMessage =
          data.error ||
          `Lỗi khi cập nhật nhân viên: ${response.status} ${response.statusText}`;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật nhân viên:", error);
      const errorMessage = (error as Error).message || "Lỗi máy chủ nội bộ";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Không có dữ liệu nhân viên để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      <div
        className="grid grid-cols-1 gap-4 overflow-y-auto"
        style={{ maxHeight: "calc(100dvh - 145px)" }}
      >
        <div className="flex flex-col items-center gap-2">
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
        <div className="grid gap-4">
          <div className="grid items-center gap-2">
            <label>Họ và Tên</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder="Nhập họ và tên"
              className="input w-full"
            />
          </div>
          <div className="grid">
            <label>Ngày sinh</label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleInputChange("birth_date", e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="grid">
            <label>Giới tính</label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="select w-full"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="grid">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
              placeholder="Nhập số điện thoại"
              className="input w-full"
            />
          </div>
          <div className="grid">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Nhập email"
              className="input w-full"
            />
          </div>
          <div className="grid">
            <label>Địa chỉ</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Nhập địa chỉ"
              className="textarea w-full"
            ></textarea>
          </div>
          <div className="grid">
            <label>Ngày vào làm</label>
            <input
              type="date"
              value={formData.join_date}
              onChange={(e) => handleInputChange("join_date", e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="grid">
            <label>Trạng thái</label>
            <select
              value={formData.employment_status}
              onChange={(e) =>
                handleInputChange("employment_status", e.target.value)
              }
              className="select w-full"
            >
              <option value="Đang làm">Đang làm</option>
              <option value="Thử việc">Thử việc</option>
              <option value="Nghỉ việc">Nghỉ việc</option>
              <option value="Nghỉ thai sản">Nghỉ thai sản</option>
            </select>
          </div>
          <div className="grid">
            <label>Phòng ban</label>
            <select
              value={formData.department_id}
              onChange={(e) =>
                handleInputChange("department_id", e.target.value)
              }
              className="select w-full"
              disabled={departments.length === 0}
            >
              <option value="">Chọn phòng ban</option>
              {departments.map((dep) => (
                <option key={dep.department_id} value={dep.department_id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid">
            <label>Vị trí công việc</label>
            <select
              value={formData.position_id}
              onChange={(e) => handleInputChange("position_id", e.target.value)}
              className="select w-full"
              disabled={positions.length === 0}
            >
              <option value="">Chọn vị trí</option>
              {positions.map((pos) => (
                <option key={pos.position_id} value={pos.position_id}>
                  {pos.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <label htmlFor={drawerId} className="btn btn-soft">
          Đóng
        </label>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Lưu"
          )}
        </button>
      </div>
    </div>
  );
}
