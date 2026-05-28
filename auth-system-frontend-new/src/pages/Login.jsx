import { Link } from "react-router-dom";
function Login() {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <form className="bg-white w-full max-w-md rounded-xl shadow-md p-6 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Login</h2>

          <p className="text-sm text-gray-500 mt-1">
            Enter your details to continue
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>

          <input
            type="email"
            placeholder="example@mail.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white px-3 py-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
        >
          Login
        </button>
        <p>
          Don't have an account?{" "}
          <Link className="underline font-medium" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
