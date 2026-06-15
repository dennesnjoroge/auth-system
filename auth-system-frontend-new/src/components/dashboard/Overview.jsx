function Overview() {
  const user = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "User",
    verified: true,
    joined: "June, 10",
  };
  return (
    <div className="w-full p-6 bg-white border-gray-100">
      <h2 className="text-3xl font-bold px-6 mb-6 text-black">
        Welcome back, <span>{`${user.firstName} ${user.lastName}`}</span>
      </h2>

      <div className="border px-6 py-6 border-gray-200 rounded-lg max-w-md">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3 ">
            <div className="text-lg text-gray-600">
              <div>
                <span className="font-semibold text-black">Firstname</span>
              </div>
              <div>
                <span>{user.firstName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-lg text-gray-600">
              <div>
                <span className="font-semibold text-black">Lastname</span>
              </div>
              <div>
                <span>{user.lastName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-lg text-gray-600">
              <div>
                <span className="font-semibold text-black">Email</span>
              </div>
              <div>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-lg text-gray-600">
              <div>
                <span className="font-semibold text-black">Role</span>
              </div>
              <div>
                <span>{user.role}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg text-gray-600">
              <span className="font-semibold text-black">Email Verified</span>
              {user.verified ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-lg text-gray-600">
              <div>
                <span className="font-semibold text-black">Joined</span>
              </div>
              <div>
                <span>{user.joined}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
