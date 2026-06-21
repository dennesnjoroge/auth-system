import { useAuth } from "../../hooks/useAuth";
function Security() {
  const { settings } = useAuth();

  return (
    <div className="w-full p-6 bg-white border-gray-100">
      <h2 className="text-3xl px-6 font-bold mb-6 text-black">Settings</h2>

      <div className="border px-6 py-6 border-gray-200 rounded-lg">
        <div className="text-lg text-black">
          <div className="flex items-center justify-between mb-4">
            <p>Password</p>
            <span>***********</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p>2 FA(2 Factor Authentication)</p>
            <span>
              <input type="checkbox" name="" id="" />
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p>Last password change</p>
            <span>{new Date(settings.changed_at).toLocaleString()}</span>
          </div>

          <button className="bg-black text-white px-3 py-2 rounded-sm cursor-pointer">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default Security;
