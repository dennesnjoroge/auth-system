const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export function validateRegisterInput(body) {
  const data = {
    firstName: body.firstName?.trim(),
    lastName: body.lastName?.trim(),
    emailAddress: body.emailAddress?.trim(),
    password: body.password?.trim(),
  };

  if (!data.firstName) {
    throw new Error("First name is required");

    return {
      error: { status: 400, message: "First name is required" },
    };
  }

  if (!data.lastName) {
    return {
      error: { status: 400, message: "Last name is required" },
    };
  }

  if (!data.emailAddress) {
    return {
      error: { status: 400, message: "Email address is required" },
    };
  }

  if (!data.password) {
    return {
      error: { status: 400, message: "Password cannot be empty" },
    };
  }

  if (data.password.length < 8) {
    return {
      error: {
        status: 400,
        message: "Password must be at least 8 characters long",
      },
    };
  }

  if (!PASSWORD_REGEX.test(data.password)) {
    return {
      error: {
        status: 400,
        message:
          "Password must include uppercase, lowercase, number, and special character",
      },
    };
  }

  return { data };
}

// not used anywhere in code //remove
export function validateLoginInput(emailAddress, password) {
  const data = {
    emailAddress: emailAddress.trim(),
    password: password.trim(),
  };

  console.log(data || "Undefined data");
  //const emailAddress = body.emailAddress.trim();
  //const password = body.password.trim();

  if (!data.emailAddress) {
    return {
      error: { status: 400, message: "Email address is required" },
    };
  }

  if (!data.password) {
    return {
      error: { status: 400, message: "Password cannot be empty" },
    };
  }

  return { data };
}
